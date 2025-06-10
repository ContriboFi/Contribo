use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};
use std::str::FromStr;

declare_id!("PROGRAM_ID");

// Initial super admin that will be used to bootstrap the admin registry
// This is used only once when initializing the admin registry
pub const BOOTSTRAP_SUPER_ADMIN: &str = "SUPER_ADMIN_ADDRESS";

// Seed for the admin registry PDA
pub const ADMIN_REGISTRY_SEED: &[u8] = b"admin-registry";

// Default timelock duration for admin changes (2 days in seconds)
pub const DEFAULT_TIMELOCK_DURATION: i64 = 172800;

#[program]
pub mod contribute {
    use super::*;

    // Events
    #[event]
    pub struct PoolCreated {
        pub admin: Pubkey,
        pub pool: Pubkey,
        pub token_mint: Pubkey,
        pub usdc_recipient: Pubkey,
        pub token_name: String,
        pub token_symbol: String,
        pub min_contribution: u64,
        pub max_contribution: u64,
        pub max_usdc_cap: u64,
        pub usdc_mint: Pubkey,
    }

    #[event]
    pub struct Contributed {
        pub user: Pubkey,
        pub pool: Pubkey,
        pub usdc_amount: u64,
        pub tokens_minted: u64,
        pub total_usdc: u64,
    }

    #[event]
    pub struct PoolStatusChanged {
        pub pool: Pubkey,
        pub enabled: bool,
        pub admin: Pubkey,
    }

    #[event]
    pub struct AdminAdded {
        pub admin: Pubkey,
        pub added_by: Pubkey,
    }

    #[event]
    pub struct AdminRemoved {
        pub admin: Pubkey,
        pub removed_by: Pubkey,
    }

    #[event]
    pub struct SuperAdminChangeProposed {
        pub current_super_admin: Pubkey,
        pub proposed_super_admin: Pubkey,
        pub executable_after: i64,
    }

    #[event]
    pub struct SuperAdminChanged {
        pub old_super_admin: Pubkey,
        pub new_super_admin: Pubkey,
    }

    #[event]
    pub struct TokensRecovered {
        pub pool: Pubkey,
        pub token_mint: Pubkey,
        pub amount: u64,
        pub recipient: Pubkey,
        pub admin: Pubkey,
    }

    /// Initialize the admin registry (one-time operation)
    pub fn initialize_admin_registry(ctx: Context<InitializeAdminRegistry>) -> Result<()> {
        let registry = &mut ctx.accounts.admin_registry;
        registry.authorized_admins = vec![ctx.accounts.initializer.key()];
        registry.bump = ctx.bumps.admin_registry;
        Ok(())
    }

    /// Propose a new super admin (timelock protected)
    pub fn propose_new_super_admin(
        ctx: Context<UpdateAdminRegistry>,
        new_super_admin: Pubkey,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.admin_registry;
        let current_super_admin = &ctx.accounts.super_admin;
        let clock = Clock::get()?;

        // Only the current super admin can propose a new super admin
        require!(
            current_super_admin.key() == registry.super_admin,
            AdminError::Unauthorized
        );

        // Set the proposed super admin and timestamp
        registry.proposed_super_admin = Some(new_super_admin);
        registry.proposed_at = clock.unix_timestamp;

        emit!(SuperAdminChangeProposed {
            current_super_admin: current_super_admin.key(),
            proposed_super_admin: new_super_admin,
            executable_after: clock.unix_timestamp + registry.timelock_duration,
        });

        Ok(())
    }

    /// Execute the super admin change after timelock period
    pub fn execute_super_admin_change(ctx: Context<UpdateAdminRegistry>) -> Result<()> {
        let registry = &mut ctx.accounts.admin_registry;
        let current_super_admin = &ctx.accounts.super_admin;
        let clock = Clock::get()?;

        // Only the current super admin can execute the change
        require!(
            current_super_admin.key() == registry.super_admin,
            AdminError::Unauthorized
        );

        // Ensure there is a proposed change
        require!(
            registry.proposed_super_admin.is_some(),
            AdminError::NoProposedChange
        );

        // Verify the timelock period has passed
        require!(
            clock.unix_timestamp >= registry.proposed_at + registry.timelock_duration,
            AdminError::TimelockNotExpired
        );

        let old_super_admin = registry.super_admin;
        let new_super_admin = registry.proposed_super_admin.unwrap();

        // Execute the change
        registry.super_admin = new_super_admin;
        registry.proposed_super_admin = None;
        registry.proposed_at = 0;

        emit!(SuperAdminChanged {
            old_super_admin,
            new_super_admin,
        });

        Ok(())
    }

    /// Cancel a proposed super admin change
    pub fn cancel_super_admin_change(ctx: Context<UpdateAdminRegistry>) -> Result<()> {
        let registry = &mut ctx.accounts.admin_registry;
        let current_super_admin = &ctx.accounts.super_admin;

        // Only the current super admin can cancel the change
        require!(
            current_super_admin.key() == registry.super_admin,
            AdminError::Unauthorized
        );

        // Ensure there is a proposed change to cancel
        require!(
            registry.proposed_super_admin.is_some(),
            AdminError::NoProposedChange
        );

        // Cancel the change
        registry.proposed_super_admin = None;
        registry.proposed_at = 0;

        Ok(())
    }

    /// Add an admin to the authorized list
    pub fn add_admin(ctx: Context<UpdateAdminRegistry>, new_admin: Pubkey) -> Result<()> {
        let registry = &mut ctx.accounts.admin_registry;
        let super_admin = &ctx.accounts.super_admin;

        // Only the super admin can add new admins
        require!(
            super_admin.key() == registry.super_admin,
            AdminError::Unauthorized
        );

        // Check if admin already exists
        require!(
            !registry.authorized_admins.contains(&new_admin),
            AdminError::AdminAlreadyExists
        );

        // Resize the account to accommodate the new admin
        registry.authorized_admins.push(new_admin);

        emit!(AdminAdded {
            admin: new_admin,
            added_by: super_admin.key(),
        });

        Ok(())
    }

    /// Remove an admin from the authorized list
    pub fn remove_admin(ctx: Context<UpdateAdminRegistry>, admin_to_remove: Pubkey) -> Result<()> {
        let registry = &mut ctx.accounts.admin_registry;
        let super_admin = &ctx.accounts.super_admin;

        // Only the super admin can remove admins
        require!(
            super_admin.key() == registry.super_admin,
            AdminError::Unauthorized
        );

        // Find the admin in the vector
        let admin_index = registry
            .authorized_admins
            .iter()
            .position(|&admin| admin == admin_to_remove)
            .ok_or(AdminError::AdminNotFound)?;

        // Cannot remove the super admin from the admin list
        require!(
            admin_to_remove != registry.super_admin,
            AdminError::CannotRemoveSuperAdmin
        );

        // Remove the admin
        registry.authorized_admins.remove(admin_index);

        emit!(AdminRemoved {
            admin: admin_to_remove,
            removed_by: super_admin.key(),
        });

        Ok(())
    }

    /// Get the remaining contribution amount for a user
    pub fn get_remaining_contribution(
        ctx: Context<GetContribution>,
        _pool_seed: String,
    ) -> Result<u64> {
        let pool = &ctx.accounts.pool;
        let user_contribution = &ctx.accounts.user_contribution;

        // Calculate remaining contribution
        let remaining = if user_contribution.amount >= pool.max_contribution {
            0
        } else {
            pool.max_contribution - user_contribution.amount
        };

        Ok(remaining)
    }

    /// Create a new pool
    pub fn create_pool(
        ctx: Context<CreatePool>,
        pool_seed: String,
        usdc_recipient: Pubkey,
        token_name: String,
        token_symbol: String,
        enabled: bool,
        min_contribution: u64,
        max_contribution: u64,
        max_usdc_cap: u64,
        usdc_mint: Pubkey,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let admin = &ctx.accounts.admin;
        let admin_registry = &ctx.accounts.admin_registry;

        // Verify admin is authorized
        require!(
            admin_registry.authorized_admins.contains(&admin.key()),
            AdminError::Unauthorized
        );

        // Initialize pool
        pool.admin = admin.key();
        pool.usdc_recipient = usdc_recipient;
        pool.current_cap = 0;
        pool.enabled = enabled;
        pool.token_mint = ctx.accounts.token_mint.key();
        pool.token_name = token_name;
        pool.token_symbol = token_symbol;
        pool.pool_seed = pool_seed.clone();
        pool.authority = ctx.accounts.authority.key();
        pool.authority_bump = ctx.bumps.authority;
        pool.usdc_mint = usdc_mint;
        pool.min_contribution = min_contribution;
        pool.max_contribution = max_contribution;
        pool.max_usdc_cap = max_usdc_cap;
        pool.max_token_supply = max_usdc_cap; // 1:1 ratio for now
        pool.total_tokens_minted = 0;
        pool.total_contributors = 0;
        pool.bump = ctx.bumps.pool;

        emit!(PoolCreated {
            admin: admin.key(),
            pool: pool.key(),
            token_mint: pool.token_mint,
            usdc_recipient: pool.usdc_recipient,
            token_name: pool.token_name.clone(),
            token_symbol: pool.token_symbol.clone(),
            min_contribution: pool.min_contribution,
            max_contribution: pool.max_contribution,
            max_usdc_cap: pool.max_usdc_cap,
            usdc_mint: pool.usdc_mint,
        });

        Ok(())
    }

    /// Initialize a user's contribution account for a pool
    pub fn init_user_contribution(
        ctx: Context<InitUserContribution>,
        _pool_seed: String,
    ) -> Result<()> {
        let user_contribution = &mut ctx.accounts.user_contribution;
        let pool = &ctx.accounts.pool;

        // Initialize user contribution
        user_contribution.user = ctx.accounts.user.key();
        user_contribution.pool = pool.key();
        user_contribution.amount = 0;

        Ok(())
    }

    /// Contribute USDC to a pool
    pub fn contribute(ctx: Context<Contribute>, _pool_seed: String, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_contribution = &mut ctx.accounts.user_contribution;
        let user = &ctx.accounts.user;

        // Verify pool is enabled
        require!(pool.enabled, PoolError::ContributionDisabled);

        // Verify contribution amount
        require!(amount > 0, PoolError::InvalidParameter);
        require!(
            amount >= pool.min_contribution,
            PoolError::BelowMinimumContribution
        );
        require!(
            amount <= pool.max_contribution,
            PoolError::AboveMaximumContribution
        );

        // Verify user hasn't exceeded their maximum contribution
        let new_user_total = user_contribution
            .amount
            .checked_add(amount)
            .ok_or(PoolError::Overflow)?;
        require!(
            new_user_total <= pool.max_contribution,
            PoolError::MaxUserContributionReached
        );

        // Verify pool hasn't reached its maximum cap
        let new_pool_total = pool
            .current_cap
            .checked_add(amount)
            .ok_or(PoolError::Overflow)?;
        require!(new_pool_total <= pool.max_usdc_cap, PoolError::MaxCapReached);

        // Verify token mint authority
        require!(
            ctx.accounts.token_mint.mint_authority.unwrap() == ctx.accounts.authority.key(),
            PoolError::InvalidAuthority
        );

        // Transfer USDC from user to recipient
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_usdc_account.to_account_info(),
                to: ctx.accounts.recipient_usdc_account.to_account_info(),
                authority: user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Calculate tokens to mint (1:1 ratio for now)
        let tokens_to_mint = amount;

        // Verify we haven't exceeded maximum token supply
        let new_token_total = pool
            .total_tokens_minted
            .checked_add(tokens_to_mint)
            .ok_or(PoolError::Overflow)?;
        require!(
            new_token_total <= pool.max_token_supply,
            PoolError::MaxTokenSupplyReached
        );

        // Mint tokens to user
        let seeds = &[
            b"authority",
            pool.pool_seed.as_bytes(),
            &[pool.authority_bump],
        ];
        let signer = &[&seeds[..]];
        let mint_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
            signer,
        );
        token::mint_to(mint_ctx, tokens_to_mint)?;

        // Update pool and user contribution state
        pool.current_cap = new_pool_total;
        pool.total_tokens_minted = new_token_total;
        user_contribution.amount = new_user_total;

        // Increment total contributors if this is the user's first contribution
        if user_contribution.amount == amount {
            pool.total_contributors = pool
                .total_contributors
                .checked_add(1)
                .ok_or(PoolError::Overflow)?;
        }

        emit!(Contributed {
            user: user.key(),
            pool: pool.key(),
            usdc_amount: amount,
            tokens_minted: tokens_to_mint,
            total_usdc: pool.current_cap,
        });

        Ok(())
    }

    /// Toggle pool enabled status
    pub fn toggle_enabled(
        ctx: Context<UpdatePoolConfig>,
        _pool_seed: String,
        enabled: bool,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let admin = &ctx.accounts.admin;

        // Update pool status
        pool.enabled = enabled;

        emit!(PoolStatusChanged {
            pool: pool.key(),
            enabled,
            admin: admin.key(),
        });

        Ok(())
    }

    /// Recover tokens from a pool
    pub fn recover_tokens(
        ctx: Context<RecoverTokens>,
        _pool_seed: String,
        amount: u64,
    ) -> Result<()> {
        let pool = &ctx.accounts.pool;
        let admin = &ctx.accounts.admin;

        // Transfer tokens from pool to recipient
        let seeds = &[
            b"authority",
            pool.pool_seed.as_bytes(),
            &[pool.authority_bump],
        ];
        let signer = &[&seeds[..]];
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.token_account.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, amount)?;

        emit!(TokensRecovered {
            pool: pool.key(),
            token_mint: ctx.accounts.token_mint.key(),
            amount,
            recipient: ctx.accounts.recipient.key(),
            admin: admin.key(),
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeAdminRegistry<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    #[account(
        init,
        payer = initializer,
        space = 8 + AdminRegistry::BASE_SIZE + 32 * 10, // Space for 10 initial admins
        seeds = [ADMIN_REGISTRY_SEED],
        bump
    )]
    pub admin_registry: Account<'info, AdminRegistry>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateAdminRegistry<'info> {
    #[account(mut)]
    pub super_admin: Signer<'info>,

    #[account(
        mut,
        seeds = [ADMIN_REGISTRY_SEED],
        bump = admin_registry.bump,
        realloc = 8 + AdminRegistry::BASE_SIZE + 32 * (admin_registry.authorized_admins.len() + 1),
        realloc::payer = super_admin,
        realloc::zero = false,
    )]
    pub admin_registry: Account<'info, AdminRegistry>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetContribution<'info> {
    pub user: Signer<'info>,

    #[account(
        seeds = [b"pool", pool.pool_seed.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        seeds = [b"user-contribution", pool.key().as_ref(), user.key().as_ref()],
        bump,
    )]
    pub user_contribution: Account<'info, UserContribution>,
}

#[derive(Accounts)]
#[instruction(pool_seed: String)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [ADMIN_REGISTRY_SEED],
        bump = admin_registry.bump
    )]
    pub admin_registry: Account<'info, AdminRegistry>,

    #[account(
        init,
        payer = admin,
        space = 8 + Pool::LEN,
        seeds = [b"pool", pool_seed.as_bytes()],
        bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        init,
        payer = admin,
        mint::decimals = 9,
        mint::authority = authority,
    )]
    pub token_mint: Account<'info, Mint>,

    /// CHECK: This is the PDA that will be the authority for the token mint
    #[account(
        init,
        payer = admin,
        space = 0,
        seeds = [b"authority", pool_seed.as_bytes()],
        bump
    )]
    pub authority: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct InitUserContribution<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"pool", pool.pool_seed.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        init,
        payer = user,
        space = 8 + UserContribution::LEN,
        seeds = [b"user-contribution", pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_contribution: Account<'info, UserContribution>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool.pool_seed.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        mut,
        seeds = [b"user-contribution", pool.key().as_ref(), user.key().as_ref()],
        bump,
        constraint = user_contribution.user == user.key(),
        constraint = user_contribution.pool == pool.key()
    )]
    pub user_contribution: Account<'info, UserContribution>,

    #[account(
        mut,
        constraint = user_usdc_account.mint == pool.usdc_mint,
        constraint = user_usdc_account.owner == user.key()
    )]
    pub user_usdc_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = usdc_mint, 
        associated_token::authority = recipient,
        constraint = recipient_usdc_account.mint == usdc_mint.key()
    )]
    pub recipient_usdc_account: Account<'info, TokenAccount>,

    /// CHECK: This is the USDC recipient address, used only as authority
    #[account(
        address = pool.usdc_recipient
    )]
    pub recipient: UncheckedAccount<'info>,

    #[account(address = pool.usdc_mint)]
    pub usdc_mint: Account<'info, Mint>,

    #[account(
        mut,
        address = pool.token_mint
    )]
    pub token_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = token_mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    /// CHECK: Authority PDA for the token mint
    #[account(
        seeds = [b"authority", pool.pool_seed.as_bytes()],
        bump = pool.authority_bump
    )]
    pub authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdatePoolConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool.pool_seed.as_bytes()],
        bump = pool.bump,
        constraint = admin.key() == pool.admin
    )]
    pub pool: Account<'info, Pool>,
}

#[derive(Accounts)]
pub struct RecoverTokens<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [b"pool", pool.pool_seed.as_bytes()],
        bump = pool.bump,
        constraint = admin.key() == pool.admin
    )]
    pub pool: Account<'info, Pool>,

    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = token_account.mint == token_mint.key(),
        constraint = token_account.owner == authority.key()
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: This is the authority PDA for the pool
    #[account(
        seeds = [b"authority", pool.pool_seed.as_bytes()],
        bump = pool.authority_bump
    )]
    pub authority: UncheckedAccount<'info>,

    /// CHECK: This is the recipient of the recovered tokens
    pub recipient: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = recipient_token_account.mint == token_mint.key(),
        constraint = recipient_token_account.owner == recipient.key()
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct AdminRegistry {
    pub super_admin: Pubkey, // Super admin who can add/remove admins
    pub proposed_super_admin: Option<Pubkey>, // For timelock changes
    pub proposed_at: i64,    // Timestamp of proposed change
    pub timelock_duration: i64, // How long changes are delayed
    pub authorized_admins: Vec<Pubkey>, // List of admins who can create pools
    pub bump: u8,            // Bump for PDA
}

impl AdminRegistry {
    pub const BASE_SIZE: usize = 32 +  // super_admin
        33 +                          // proposed_super_admin (Option<Pubkey>)
        8 +                           // proposed_at (i64)
        8 +                           // timelock_duration (i64)
        4 +                           // authorized_admins vector length
        1;                            // bump (u8)
}

#[account]
pub struct Pool {
    pub admin: Pubkey,            // Pool administrator (creator)
    pub usdc_recipient: Pubkey,   // Address to receive the USDC contributions
    pub current_cap: u64,         // Current amount raised
    pub enabled: bool,            // Whether contributions are enabled
    pub token_mint: Pubkey,       // Project token mint address
    pub token_name: String,       // Name of the project token
    pub token_symbol: String,     // Symbol of the project token
    pub pool_seed: String,        // Unique identifier for the pool
    pub authority: Pubkey,        // PDA for token minting
    pub authority_bump: u8,       // Bump for authority PDA
    pub usdc_mint: Pubkey,        // USDC mint address
    pub min_contribution: u64,    // Minimum contribution amount
    pub max_contribution: u64,    // Maximum contribution amount
    pub max_usdc_cap: u64,        // Maximum total USDC that can be raised
    pub max_token_supply: u64,    // Maximum total tokens that can be minted
    pub total_tokens_minted: u64, // Total number of tokens minted so far
    pub total_contributors: u64,  // Total number of unique contributors
    pub bump: u8,                 // Bump for pool PDA
}

impl Pool {
    pub const LEN: usize = 32 + // admin
        32 +                    // usdc_recipient
        8 +                     // current_cap
        1 +                     // enabled
        32 +                    // token_mint
        32 +                    // token_name (max length)
        10 +                    // token_symbol (max length)
        32 +                    // pool_seed (max length)
        32 +                    // authority
        1 +                     // authority_bump
        32 +                    // usdc_mint
        8 +                     // min_contribution
        8 +                     // max_contribution
        8 +                     // max_usdc_cap
        8 +                     // max_token_supply
        8 +                     // total_tokens_minted
        8;                      // total_contributors
}

#[account]
pub struct UserContribution {
    pub user: Pubkey, // User public key
    pub pool: Pubkey, // Pool this contribution belongs to
    pub amount: u64,  // Total contribution amount
}

impl UserContribution {
    pub const LEN: usize = 32 + // user
        32 +                    // pool
        8;                      // amount
}

#[error_code]
pub enum PoolError {
    #[msg("Invalid parameter")]
    InvalidParameter,

    #[msg("Overflow occurred during calculation")]
    Overflow,

    #[msg("Contribution is disabled for this pool")]
    ContributionDisabled,

    #[msg("Unauthorized operation")]
    Unauthorized,

    #[msg("Contribution is below minimum amount")]
    BelowMinimumContribution,

    #[msg("Contribution is above maximum amount")]
    AboveMaximumContribution,

    #[msg("Zero address is not allowed")]
    ZeroAddress,

    #[msg("Maximum USDC cap has been reached")]
    MaxCapReached,

    #[msg("Maximum token supply has been reached")]
    MaxTokenSupplyReached,

    #[msg("Pool seed mismatch")]
    PoolSeedMismatch,

    #[msg("User has reached maximum contribution amount")]
    MaxUserContributionReached,

    #[msg("Insufficient funds for the operation")]
    InsufficientFunds,

    #[msg("Invalid token mint")]
    InvalidTokenMint,
    
    #[msg("Invalid USDC mint")]
    InvalidUsdcMint,
    
    #[msg("Invalid authority")]
    InvalidAuthority,
}

#[error_code]
pub enum AdminError {
    #[msg("Unauthorized operation")]
    Unauthorized,

    #[msg("Admin already exists in the registry")]
    AdminAlreadyExists,

    #[msg("Admin not found in the registry")]
    AdminNotFound,

    #[msg("Cannot remove the super admin from the admin list")]
    CannotRemoveSuperAdmin,

    #[msg("No proposed change exists")]
    NoProposedChange,

    #[msg("Timelock period has not expired yet")]
    TimelockNotExpired,
}
