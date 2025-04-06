use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};
use std::str::FromStr;

declare_id!("PROGRAM_ID_HERE");

// Initial super admin that will be used to bootstrap the admin registry
// This is used only once when initializing the admin registry
pub const BOOTSTRAP_SUPER_ADMIN: &str = "SUPER_ADMIN_PUBKEY_HERE";

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
        let initializer = &ctx.accounts.initializer;

        // Verify initializer is the bootstrap super admin
        let bootstrap_super_admin = Pubkey::from_str(BOOTSTRAP_SUPER_ADMIN).unwrap();
        require!(
            initializer.key() == bootstrap_super_admin,
            AdminError::Unauthorized
        );

        // Initialize the admin registry
        registry.super_admin = initializer.key();
        registry.proposed_super_admin = None;
        registry.proposed_at = 0;
        registry.timelock_duration = DEFAULT_TIMELOCK_DURATION;
        registry.authorized_admins = vec![initializer.key()]; // Add the super admin as a default authorized admin
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

    /// Get the remaining amount a user can contribute to the pool
    pub fn get_remaining_contribution(
        ctx: Context<GetContribution>,
        pool_seed: String,
    ) -> Result<u64> {
        let pool = &ctx.accounts.pool;
        let user_contribution = &ctx.accounts.user_contribution;

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, PoolError::PoolSeedMismatch);

        // Calculate remaining allowed contribution
        if user_contribution.amount >= pool.max_contribution {
            return Ok(0); // User has reached the maximum allowed contribution
        }

        let remaining = pool
            .max_contribution
            .checked_sub(user_contribution.amount)
            .ok_or(PoolError::Overflow)?;

        Ok(remaining)
    }

    /// Creates a new fundraising pool
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
        let registry = &ctx.accounts.admin_registry;
        let admin = &ctx.accounts.admin;

        // Verify admin is authorized to create pools
        require!(
            registry.authorized_admins.contains(&admin.key()),
            AdminError::Unauthorized
        );

        // Validate parameters
        require!(!pool_seed.is_empty(), PoolError::InvalidParameter);
        require!(!token_name.is_empty(), PoolError::InvalidParameter);
        require!(!token_symbol.is_empty(), PoolError::InvalidParameter);
        require!(usdc_recipient != Pubkey::default(), PoolError::ZeroAddress);
        require!(min_contribution > 0, PoolError::InvalidParameter);
        require!(
            max_contribution >= min_contribution,
            PoolError::InvalidParameter
        );
        require!(max_usdc_cap > 0, PoolError::InvalidParameter);

        // Calculate max token supply automatically as 10x the max USDC cap
        // Note: Since 1 USDC = 1,000,000 (6 decimals) and 1 SPL token = 1,000,000,000 (9 decimals),
        // we use a multiplication factor of 10,000 to maintain the 10:1 ratio
        let max_token_supply = max_usdc_cap
            .checked_mul(10_000)
            .ok_or(PoolError::Overflow)?;

        let pool = &mut ctx.accounts.pool;

        // Set pool seed FIRST before any other operations
        pool.pool_seed = pool_seed.clone();

        // Set pool parameters
        pool.admin = admin.key(); // The creator becomes the sole admin of this pool
        pool.usdc_recipient = usdc_recipient;
        pool.current_cap = 0;
        pool.enabled = enabled;
        pool.token_mint = ctx.accounts.token_mint.key();
        pool.token_name = token_name.clone();
        pool.token_symbol = token_symbol.clone();

        // Set contribution limits
        pool.min_contribution = min_contribution;
        pool.max_contribution = max_contribution;
        pool.max_usdc_cap = max_usdc_cap;
        pool.max_token_supply = max_token_supply;
        pool.total_tokens_minted = 0;
        pool.total_contributors = 0;

        // Create and store PDA info
        let seeds = [b"authority", pool_seed.as_bytes()];
        let (authority_pda, bump) = Pubkey::find_program_address(&seeds, ctx.program_id);
        pool.authority = authority_pda;
        pool.authority_bump = bump;

        // Store USDC mint address provided by parameter
        pool.usdc_mint = usdc_mint;

        // Emit PoolCreated event
        emit!(PoolCreated {
            admin: admin.key(),
            pool: pool.key(),
            token_mint: ctx.accounts.token_mint.key(),
            usdc_recipient,
            token_name: token_name.clone(),
            token_symbol: token_symbol.clone(),
            min_contribution,
            max_contribution,
            max_usdc_cap,
            usdc_mint,
        });

        Ok(())
    }

    /// Initialize a user contribution account for a specific pool
    pub fn init_user_contribution(
        ctx: Context<InitUserContribution>,
        pool_seed: String,
    ) -> Result<()> {
        let pool = &ctx.accounts.pool;
        let user_contribution = &mut ctx.accounts.user_contribution;

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, PoolError::PoolSeedMismatch);

        // Initialize the user contribution account
        user_contribution.user = ctx.accounts.user.key();
        user_contribution.pool = pool.key();
        user_contribution.amount = 0;

        Ok(())
    }

    /// Contribute USDC directly to the recipient and receive tokens in return
    pub fn contribute(ctx: Context<Contribute>, pool_seed: String, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_contribution = &mut ctx.accounts.user_contribution;
        let user_key = ctx.accounts.user.key();

        // Verify pool is valid and active
        require!(pool_seed == pool.pool_seed, PoolError::PoolSeedMismatch);
        require!(pool.enabled, PoolError::ContributionDisabled);

        // Validate contribution amount
        require!(
            amount >= pool.min_contribution,
            PoolError::BelowMinimumContribution
        );

        // Update user contribution
        let new_user_contribution = user_contribution
            .amount
            .checked_add(amount)
            .ok_or(PoolError::Overflow)?;

        // Check user's total contribution against max allowed
        require!(
            new_user_contribution <= pool.max_contribution,
            PoolError::AboveMaximumContribution
        );

        // Check max cap
        let new_total = pool
            .current_cap
            .checked_add(amount)
            .ok_or(PoolError::Overflow)?;
        require!(new_total <= pool.max_usdc_cap, PoolError::MaxCapReached);

        // Calculate tokens to mint (10:1 ratio)
        // Since 1 USDC = 1,000,000 (6 decimals) and 1 SPL token = 1,000,000,000 (9 decimals),
        // we use a multiplication factor of 10,000 to maintain the 10:1 ratio
        let tokens_to_mint = amount.checked_mul(10_000).ok_or(PoolError::Overflow)?;

        // IMPORTANT: First mint tokens before transferring USDC
        // This ensures we don't take USDC if token minting fails
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"authority",
            pool.pool_seed.as_bytes(),
            &[pool.authority_bump],
        ]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                signer_seeds,
            ),
            tokens_to_mint,
        )?;

        // After tokens are successfully minted, transfer USDC
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_usdc_account.to_account_info(),
                    to: ctx.accounts.recipient_usdc_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        // Update pool status
        pool.current_cap = new_total;
        pool.total_tokens_minted = pool
            .total_tokens_minted
            .checked_add(tokens_to_mint)
            .ok_or(PoolError::Overflow)?;

        // Increment total contributors if this is the first contribution
        if user_contribution.amount == 0 {
            pool.total_contributors = pool
                .total_contributors
                .checked_add(1)
                .ok_or(PoolError::Overflow)?;
        }

        // Update user contribution amount
        user_contribution.amount = new_user_contribution;

        // Emit event
        emit!(Contributed {
            user: user_key,
            pool: pool.key(),
            usdc_amount: amount,
            tokens_minted: tokens_to_mint,
            total_usdc: pool.current_cap,
        });

        Ok(())
    }

    /// Toggle the enabled status of the pool
    pub fn toggle_enabled(
        ctx: Context<UpdatePoolConfig>,
        pool_seed: String,
        enabled: bool,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let admin = &ctx.accounts.admin;

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, PoolError::PoolSeedMismatch);

        // Verify admin permission - only the pool's admin can update it
        require!(admin.key() == pool.admin, AdminError::Unauthorized);

        // Update enabled status
        pool.enabled = enabled;

        // Emit event
        emit!(PoolStatusChanged {
            pool: pool.key(),
            enabled,
            admin: admin.key(),
        });

        Ok(())
    }

    /// Recover tokens that were accidentally sent to the pool authority
    pub fn recover_tokens(
        ctx: Context<RecoverTokens>,
        pool_seed: String,
        amount: u64,
    ) -> Result<()> {
        let pool = &ctx.accounts.pool;

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, PoolError::PoolSeedMismatch);

        // Only the pool admin can recover tokens
        require!(
            ctx.accounts.admin.key() == pool.admin,
            AdminError::Unauthorized
        );

        // Ensure we're only recovering tokens that were mistakenly sent to the pool authority
        // and not the tokens that are part of the official pool
        if ctx.accounts.token_mint.key() == pool.token_mint {
            // If recovering the pool's own token, make sure it doesn't affect the accounting
            require!(
                amount <= ctx.accounts.token_account.amount,
                PoolError::InsufficientFunds
            );
        }

        // Create signer seeds for the authority
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"authority",
            pool.pool_seed.as_bytes(),
            &[pool.authority_bump],
        ]];

        // Transfer the tokens from the authority to the recipient
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.token_account.to_account_info(),
                    to: ctx.accounts.recipient_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
        )?;

        // Emit recovery event
        emit!(TokensRecovered {
            pool: pool.key(),
            token_mint: ctx.accounts.token_mint.key(),
            amount,
            recipient: ctx.accounts.recipient.key(),
            admin: ctx.accounts.admin.key(),
        });

        Ok(())
    }
}

// Account contexts for admin registry operations
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
        realloc = 8 + AdminRegistry::BASE_SIZE + 32 * admin_registry.authorized_admins.len(),
        realloc::payer = super_admin,
        realloc::zero = false,
    )]
    pub admin_registry: Account<'info, AdminRegistry>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(pool_seed: String)]
pub struct GetContribution<'info> {
    pub user: Signer<'info>,

    #[account(
        seeds = [b"pool", pool_seed.as_bytes()],
        bump
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
        seeds = [b"authority", pool_seed.as_bytes()],
        bump
    )]
    pub authority: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(pool_seed: String)]
pub struct InitUserContribution<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"pool", pool_seed.as_bytes()],
        bump
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
#[instruction(pool_seed: String, amount: u64)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool_seed.as_bytes()],
        bump
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
#[instruction(pool_seed: String)]
pub struct UpdatePoolConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool_seed.as_bytes()],
        bump,
        constraint = admin.key() == pool.admin
    )]
    pub pool: Account<'info, Pool>,
}

#[derive(Accounts)]
#[instruction(pool_seed: String, amount: u64)]
pub struct RecoverTokens<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [b"pool", pool_seed.as_bytes()],
        bump,
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

// Account definitions
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
                              33 +  // proposed_super_admin (Option<Pubkey>)
                              8 +   // proposed_at
                              8 +   // timelock_duration
                              4 +   // Vec length prefix
                              1; // bump

    // Helper to calculate full size including vector elements
    pub fn size_with_admins(admin_count: usize) -> usize {
        Self::BASE_SIZE + (32 * admin_count) // Each Pubkey is 32 bytes
    }
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
}

#[account]
pub struct UserContribution {
    pub user: Pubkey, // User public key
    pub pool: Pubkey, // Pool this contribution belongs to
    pub amount: u64,  // Total contribution amount
}

impl Pool {
    pub const LEN: usize = 32 + // admin
                           32 + // usdc_recipient
                           8 +  // current_cap
                           1 +  // enabled
                           32 + // token_mint
                           64 + // token_name (max length)
                           16 + // token_symbol (max length)
                           64 + // pool_seed (max length)
                           32 + // authority
                           1 +  // authority_bump
                           32 + // usdc_mint
                           8 +  // min_contribution
                           8 +  // max_contribution
                           8 +  // max_usdc_cap
                           8 +  // max_token_supply
                           8 +  // total_tokens_minted
                           8; // total_contributors
}

impl UserContribution {
    pub const LEN: usize = 32 + // user
                           32 + // pool
                           8; // amount
}

// Error definitions
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
