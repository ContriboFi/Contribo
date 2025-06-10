use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Burn, Mint, Token, TokenAccount, Transfer},
};
use std::str::FromStr;

declare_id!("PROGRAM_ID");

// Replace the hardcoded admin with a super admin account
pub const SUPER_ADMIN: &str = "SUPER_ADMIN_ADDRESS";

// Constants for timelock delays (in seconds)
pub const TIMELOCK_DELAY: i64 = 86400; // 24 hours for parameter changes

#[program]
pub mod claim_refund {
    use super::*;

    // Events
    #[event]
    pub struct ExchangePoolCreated {
        pub admin: Pubkey,
        pub pool: Pubkey,
        pub lct_mint: Pubkey,
        pub return_token_mint: Pubkey,
        pub lct_recipient: Pubkey,
        pub exchange_ratio: u64,
        pub max_lct_cap: u64,
        pub enabled: bool,
    }

    #[event]
    pub struct TokensExchanged {
        pub user: Pubkey,
        pub pool: Pubkey,
        pub lct_amount: u64,
        pub tokens_returned: u64,
        pub total_lct_exchanged: u64,
    }

    #[event]
    pub struct PoolStatusChanged {
        pub pool: Pubkey,
        pub enabled: bool,
        pub admin: Pubkey,
    }

    #[event]
    pub struct MaxCapUpdateRequested {
        pub pool: Pubkey,
        pub old_max_cap: u64,
        pub new_max_cap: u64,
        pub admin: Pubkey,
        pub effective_time: i64,
    }

    #[event]
    pub struct MaxCapUpdated {
        pub pool: Pubkey,
        pub old_max_cap: u64,
        pub new_max_cap: u64,
        pub admin: Pubkey,
    }

    #[event]
    pub struct AdminAdded {
        pub admin: Pubkey,
        pub super_admin: Pubkey,
    }

    #[event]
    pub struct AdminRemoved {
        pub admin: Pubkey,
        pub super_admin: Pubkey,
    }

    #[event]
    pub struct TimelockCanceled {
        pub pool: Pubkey,
        pub action_type: String,
        pub admin: Pubkey,
    }

    // Initialize admin registry
    pub fn initialize_admin_registry(ctx: Context<InitializeAdminRegistry>) -> Result<()> {
        // Verify that the function is called by the super admin
        let super_admin = Pubkey::from_str(SUPER_ADMIN).unwrap();
        require!(
            ctx.accounts.super_admin.key() == super_admin,
            ExchangeError::OnlySuperAdmin
        );

        // Initialize admin registry with super admin as the first admin
        let registry = &mut ctx.accounts.admin_registry;
        registry.super_admin = super_admin;
        registry.admins = vec![super_admin];

        Ok(())
    }

    // Add a new admin to the registry
    pub fn add_admin(ctx: Context<AdminRegistryUpdate>, new_admin: Pubkey) -> Result<()> {
        // Verify that the function is called by the super admin
        let super_admin = Pubkey::from_str(SUPER_ADMIN).unwrap();
        require!(
            ctx.accounts.super_admin.key() == super_admin,
            ExchangeError::OnlySuperAdmin
        );

        // Add admin to registry if not already present
        let registry = &mut ctx.accounts.admin_registry;

        // Check for maximum capacity to prevent resource exhaustion
        require!(
            registry.admins.len() < 20, // Reasonable admin limit
            ExchangeError::AdminRegistryFull
        );

        if !registry.admins.contains(&new_admin) {
            registry.admins.push(new_admin);
        }

        // Emit event
        emit!(AdminAdded {
            admin: new_admin,
            super_admin: ctx.accounts.super_admin.key(),
        });

        Ok(())
    }

    // Remove an admin from the registry
    pub fn remove_admin(ctx: Context<AdminRegistryUpdate>, admin_to_remove: Pubkey) -> Result<()> {
        // Verify that the function is called by the super admin
        let super_admin = Pubkey::from_str(SUPER_ADMIN).unwrap();
        require!(
            ctx.accounts.super_admin.key() == super_admin,
            ExchangeError::OnlySuperAdmin
        );

        // Cannot remove super admin
        require!(
            admin_to_remove != super_admin,
            ExchangeError::CannotRemoveSuperAdmin
        );

        // Remove admin from registry
        let registry = &mut ctx.accounts.admin_registry;
        registry.admins.retain(|&admin| admin != admin_to_remove);

        // Emit event
        emit!(AdminRemoved {
            admin: admin_to_remove,
            super_admin: ctx.accounts.super_admin.key(),
        });

        Ok(())
    }

    /// Creates a new exchange pool
    pub fn create_exchange_pool(
        ctx: Context<CreateExchangePool>,
        pool_seed: String,
        exchange_ratio: u64,
        max_lct_cap: u64,
        enabled: bool,
    ) -> Result<()> {
        // Verify that the admin is in the registry
        let admin_registry = &ctx.accounts.admin_registry;
        require!(
            admin_registry.admins.contains(&ctx.accounts.admin.key()),
            ExchangeError::Unauthorized
        );

        // Validate parameters
        require!(!pool_seed.is_empty(), ExchangeError::InvalidParameter);
        require!(exchange_ratio > 0, ExchangeError::InvalidParameter);
        require!(max_lct_cap > 0, ExchangeError::InvalidParameter);

        // Check for potential overflows when doing exchange calculations
        // This is to ensure even the maximum transaction wouldn't overflow
        let max_possible_return = u64::MAX / exchange_ratio;
        require!(
            max_lct_cap <= max_possible_return,
            ExchangeError::ParameterWouldCauseOverflow
        );

        let pool = &mut ctx.accounts.pool;

        // Set pool seed
        pool.pool_seed = pool_seed.clone();

        // Set pool parameters
        pool.admin = ctx.accounts.admin.key(); // The admin who created the pool becomes its sole admin
        pool.lct_mint = ctx.accounts.lct_mint.key();
        pool.return_token_mint = ctx.accounts.return_token_mint.key();
        pool.lct_recipient_account = ctx.accounts.lct_recipient_account.key();
        pool.pool_return_token_account = ctx.accounts.pool_return_token_account.key();
        pool.exchange_ratio = exchange_ratio;
        pool.enabled = enabled;
        pool.total_lct_exchanged = 0;
        pool.max_lct_cap = max_lct_cap;

        // Create and store PDA info for authority
        let (pool_authority, authority_bump) =
            Pubkey::find_program_address(&[b"authority", pool_seed.as_bytes()], ctx.program_id);
        pool.authority = pool_authority;
        pool.authority_bump = authority_bump;

        // Initialize timelock fields (only for max cap changes now)
        pool.pending_max_cap_change = false;
        pool.pending_max_cap = 0;
        pool.max_cap_change_time = 0;

        // Emit event
        emit!(ExchangePoolCreated {
            admin: ctx.accounts.admin.key(),
            pool: pool.key(),
            lct_mint: ctx.accounts.lct_mint.key(),
            return_token_mint: ctx.accounts.return_token_mint.key(),
            lct_recipient: ctx.accounts.pool_authority.key(),
            exchange_ratio,
            max_lct_cap,
            enabled,
        });

        Ok(())
    }

    /// Exchange LCT tokens for return tokens
    pub fn exchange_tokens(
        ctx: Context<ExchangeTokens>,
        pool_seed: String,
        lct_amount: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, ExchangeError::PoolSeedMismatch);

        // Check if pool is enabled
        require!(pool.enabled, ExchangeError::ExchangeDisabled);

        // Check if amount is valid
        require!(lct_amount > 0, ExchangeError::InvalidParameter);

        // Validate that token accounts match the ones stored in the pool
        require!(
            ctx.accounts.recipient_lct_account.key() == pool.lct_recipient_account,
            ExchangeError::AccountMismatch
        );
        require!(
            ctx.accounts.pool_return_token_account.key() == pool.pool_return_token_account,
            ExchangeError::AccountMismatch
        );

        // Check if this exchange would exceed the max LCT cap
        let new_total = pool
            .total_lct_exchanged
            .checked_add(lct_amount)
            .ok_or(ExchangeError::Overflow)?;
        require!(new_total <= pool.max_lct_cap, ExchangeError::MaxCapReached);

        // Calculate return tokens based on exchange ratio with checked multiplication
        let return_token_amount = lct_amount
            .checked_mul(pool.exchange_ratio)
            .ok_or(ExchangeError::Overflow)?;

        // Check if the pool has sufficient return tokens to fulfill the exchange
        let pool_return_token_balance = ctx.accounts.pool_return_token_account.amount;
        require!(
            pool_return_token_balance >= return_token_amount,
            ExchangeError::InsufficientPoolBalance
        );

        // Store all pool data needed for PDA derivation before updating state
        let pool_seed_bytes = pool.pool_seed.as_bytes().to_vec();
        let authority_bump = pool.authority_bump;

        // Update state before external calls
        pool.total_lct_exchanged = new_total;

        // Generate signer seeds for PDA operations
        let pool_authority_seeds = &[b"authority".as_ref(), &pool_seed_bytes, &[authority_bump]];

        // IMPROVED ORDER OF OPERATIONS:
        // 1. First transfer return tokens from pool to user - this ensures user gets value first
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.pool_return_token_account.to_account_info(),
                    to: ctx.accounts.user_return_token_account.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
                &[pool_authority_seeds],
            ),
            return_token_amount,
        )?;

        // 2. Then transfer LCT from user to recipient - only after user has received value
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_lct_account.to_account_info(),
                    to: ctx.accounts.recipient_lct_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            lct_amount,
        )?;

        // 3. Finally, burn the received LCT tokens from recipient
        token::burn(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.lct_mint.to_account_info(),
                    from: ctx.accounts.recipient_lct_account.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
                &[pool_authority_seeds],
            ),
            lct_amount,
        )?;

        // Emit event
        emit!(TokensExchanged {
            user: ctx.accounts.user.key(),
            pool: pool.key(),
            lct_amount,
            tokens_returned: return_token_amount,
            total_lct_exchanged: new_total,
        });

        Ok(())
    }

    /// Toggle the exchange pool enabled status immediately (no timelock)
    pub fn toggle_pool_status(
        ctx: Context<UpdateConfig>,
        pool_seed: String,
        enabled: bool,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, ExchangeError::PoolSeedMismatch);

        // Verify admin permission - only the pool's admin can update it
        require!(
            ctx.accounts.admin.key() == pool.admin,
            ExchangeError::OnlyPoolAdmin
        );

        // Update enabled status immediately
        pool.enabled = enabled;

        // Emit event
        emit!(PoolStatusChanged {
            pool: pool.key(),
            enabled,
            admin: ctx.accounts.admin.key(),
        });

        Ok(())
    }

    /// Request to update the maximum LCT cap for the pool (with timelock)
    pub fn request_update_max_cap(
        ctx: Context<UpdateConfig>,
        pool_seed: String,
        new_max_cap: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let clock = Clock::get()?;

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, ExchangeError::PoolSeedMismatch);

        // Verify admin permission
        require!(
            ctx.accounts.admin.key() == pool.admin,
            ExchangeError::OnlyPoolAdmin
        );

        // Don't allow new requests if there's already a pending change
        require!(
            !pool.pending_max_cap_change,
            ExchangeError::PendingChangeExists
        );

        // Validate new cap
        require!(new_max_cap > 0, ExchangeError::InvalidParameter);
        require!(
            new_max_cap >= pool.total_lct_exchanged,
            ExchangeError::InvalidParameter
        );

        // Check for potential overflows when doing exchange calculations with the new cap
        let max_possible_return = u64::MAX / pool.exchange_ratio;
        require!(
            new_max_cap <= max_possible_return,
            ExchangeError::ParameterWouldCauseOverflow
        );

        // Set pending max cap
        pool.pending_max_cap_change = true;
        pool.pending_max_cap = new_max_cap;

        // Use checked addition for timestamp calculation
        pool.max_cap_change_time = clock
            .unix_timestamp
            .checked_add(TIMELOCK_DELAY)
            .ok_or(ExchangeError::Overflow)?;

        // Emit event
        emit!(MaxCapUpdateRequested {
            pool: pool.key(),
            old_max_cap: pool.max_lct_cap,
            new_max_cap,
            admin: ctx.accounts.admin.key(),
            effective_time: pool.max_cap_change_time,
        });

        Ok(())
    }

    /// Execute the pending max cap change after timelock expires
    pub fn execute_max_cap_change(ctx: Context<UpdateConfig>, pool_seed: String) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let clock = Clock::get()?;

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, ExchangeError::PoolSeedMismatch);

        // Check if there's a pending change
        require!(pool.pending_max_cap_change, ExchangeError::NoPendingChange);

        // Check if timelock has expired
        require!(
            clock.unix_timestamp >= pool.max_cap_change_time,
            ExchangeError::TimelockNotExpired
        );

        // Store old cap for event
        let old_max_cap = pool.max_lct_cap;

        // Update max cap
        pool.max_lct_cap = pool.pending_max_cap;

        // Clear pending change
        pool.pending_max_cap_change = false;
        pool.max_cap_change_time = 0;

        // Emit event
        emit!(MaxCapUpdated {
            pool: pool.key(),
            old_max_cap,
            new_max_cap: pool.max_lct_cap,
            admin: ctx.accounts.admin.key(),
        });

        Ok(())
    }

    /// Cancel a pending max cap change
    pub fn cancel_max_cap_change(ctx: Context<UpdateConfig>, pool_seed: String) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, ExchangeError::PoolSeedMismatch);

        // Verify admin permission
        require!(
            ctx.accounts.admin.key() == pool.admin,
            ExchangeError::OnlyPoolAdmin
        );

        // Check if there's a pending change
        require!(pool.pending_max_cap_change, ExchangeError::NoPendingChange);

        // Clear pending change
        pool.pending_max_cap_change = false;
        pool.max_cap_change_time = 0;

        // Emit event
        emit!(TimelockCanceled {
            pool: pool.key(),
            action_type: "max_cap_change".to_string(),
            admin: ctx.accounts.admin.key(),
        });

        Ok(())
    }
}

// Account structure for storing the admin registry
#[account]
pub struct AdminRegistry {
    pub super_admin: Pubkey,
    pub admins: Vec<Pubkey>,
}

// Initialize admin registry context
#[derive(Accounts)]
pub struct InitializeAdminRegistry<'info> {
    #[account(mut)]
    pub super_admin: Signer<'info>,

    #[account(
        init,
        payer = super_admin,
        space = 8 + 32 + 4 + (32 * 20), // Support for up to 20 admins
        seeds = [b"admin_registry"],
        bump
    )]
    pub admin_registry: Account<'info, AdminRegistry>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// Update admin registry context
#[derive(Accounts)]
pub struct AdminRegistryUpdate<'info> {
    #[account(mut)]
    pub super_admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"admin_registry"],
        bump
    )]
    pub admin_registry: Account<'info, AdminRegistry>,

    pub system_program: Program<'info, System>,
}

// Modified context to include admin registry and create token accounts
#[derive(Accounts)]
#[instruction(pool_seed: String)]
pub struct CreateExchangePool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [b"admin_registry"],
        bump
    )]
    pub admin_registry: Account<'info, AdminRegistry>,

    #[account(
        init,
        payer = admin,
        space = 8 + ExchangePool::LEN,
        seeds = [b"pool", pool_seed.as_bytes()],
        bump
    )]
    pub pool: Account<'info, ExchangePool>,

    pub lct_mint: Account<'info, Mint>,

    pub return_token_mint: Account<'info, Mint>,

    /// CHECK: This is the PDA that will be the authority for the pool
    #[account(
        seeds = [b"authority", pool_seed.as_bytes()],
        bump
    )]
    pub pool_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = admin,
        token::mint = lct_mint,
        token::authority = pool_authority,
        seeds = [b"lct_recipient", pool_seed.as_bytes()],
        bump
    )]
    pub lct_recipient_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = admin,
        token::mint = return_token_mint,
        token::authority = pool_authority,
        seeds = [b"pool_return", pool_seed.as_bytes()],
        bump
    )]
    pub pool_return_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(pool_seed: String, lct_amount: u64)]
pub struct ExchangeTokens<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool_seed.as_bytes()],
        bump
    )]
    pub pool: Account<'info, ExchangePool>,

    #[account(
        mut,
        constraint = user_lct_account.mint == pool.lct_mint,
        constraint = user_lct_account.owner == user.key()
    )]
    pub user_lct_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = pool.lct_recipient_account,
        constraint = recipient_lct_account.mint == pool.lct_mint,
        constraint = recipient_lct_account.owner == pool_authority.key()
    )]
    pub recipient_lct_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = pool.pool_return_token_account,
        constraint = pool_return_token_account.mint == pool.return_token_mint,
        constraint = pool_return_token_account.owner == pool_authority.key()
    )]
    pub pool_return_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = return_token_mint,
        associated_token::authority = user
    )]
    pub user_return_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = pool.lct_mint
    )]
    pub lct_mint: Account<'info, Mint>,

    #[account(address = pool.return_token_mint)]
    pub return_token_mint: Account<'info, Mint>,

    /// CHECK: Authority PDA for the pool
    #[account(
        seeds = [b"authority", pool.pool_seed.as_bytes()],
        bump = pool.authority_bump
    )]
    pub pool_authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(pool_seed: String)]
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool_seed.as_bytes()],
        bump
    )]
    pub pool: Account<'info, ExchangePool>,

    // Add clock for timelock operations
    pub clock: Sysvar<'info, Clock>,
}

#[account]
pub struct ExchangePool {
    pub admin: Pubkey,                     // Pool administrator
    pub lct_mint: Pubkey,                  // LCT token mint
    pub return_token_mint: Pubkey,         // Return token mint
    pub lct_recipient_account: Pubkey, // LCT recipient account (instead of just a pubkey authority)
    pub pool_return_token_account: Pubkey, // Pool's return token account
    pub exchange_ratio: u64,           // Ratio of return tokens per LCT
    pub enabled: bool,                 // Whether exchanges are enabled
    pub total_lct_exchanged: u64,      // Total LCT tokens exchanged
    pub max_lct_cap: u64,              // Maximum total LCT tokens that can be exchanged
    pub pool_seed: String,             // Unique identifier for the pool
    pub authority: Pubkey,             // PDA for pool operations
    pub authority_bump: u8,            // Bump for authority PDA

    // Timelock fields for max cap changes
    pub pending_max_cap_change: bool, // Whether there is a pending max cap change
    pub pending_max_cap: u64,         // The pending max cap value
    pub max_cap_change_time: i64,     // When the max cap change can be executed
}

impl ExchangePool {
    pub const LEN: usize = 32 + // admin
                           32 + // lct_mint
                           32 + // return_token_mint
                           32 + // lct_recipient_account
                           32 + // pool_return_token_account
                           8 +  // exchange_ratio
                           1 +  // enabled
                           8 +  // total_lct_exchanged
                           8 +  // max_lct_cap
                           64 + // pool_seed (max length)
                           32 + // authority
                           1 +  // authority_bump
                           1 +  // pending_max_cap_change
                           8 +  // pending_max_cap
                           8; // max_cap_change_time
}

#[error_code]
pub enum ExchangeError {
    #[msg("Invalid parameter provided: Parameters must be non-zero positive values")]
    InvalidParameter,

    #[msg("Arithmetic overflow occurred during calculation: This indicates a possible attack or misconfiguration")]
    Overflow,

    #[msg("Exchange is currently disabled for this pool: Contact pool admin for details")]
    ExchangeDisabled,

    #[msg("Unauthorized operation: The caller does not have permission to perform this action")]
    Unauthorized,

    #[msg("Zero address is not allowed: A valid public key must be provided")]
    ZeroAddress,

    #[msg("Maximum LCT cap has been reached: Pool cannot accept more LCT tokens until cap is increased")]
    MaxCapReached,

    #[msg("Pool seed mismatch: The provided seed does not match the pool's stored seed")]
    PoolSeedMismatch,

    #[msg(
        "Only the super admin can perform this operation: Administrative registry action restricted"
    )]
    OnlySuperAdmin,

    #[msg("Only the pool's admin can perform this operation: Pool management action restricted")]
    OnlyPoolAdmin,

    #[msg("Cannot remove the super admin: The super admin account must remain in the registry")]
    CannotRemoveSuperAdmin,

    #[msg("There is already a pending change for this parameter: Execute or cancel the existing request first")]
    PendingChangeExists,

    #[msg("No pending change exists for this parameter: Request a change before trying to execute or cancel")]
    NoPendingChange,

    #[msg("Timelock period has not expired yet: Operation cannot be executed until the waiting period ends")]
    TimelockNotExpired,

    #[msg("Account mismatch: The provided token account doesn't match what's stored in pool data")]
    AccountMismatch,

    #[msg("Insufficient return token balance in pool to complete this exchange: Pool needs more liquidity")]
    InsufficientPoolBalance,

    #[msg("Parameter would cause overflow in calculations: Reduce the parameter value to prevent overflow")]
    ParameterWouldCauseOverflow,

    #[msg(
        "Admin registry has reached maximum capacity: Cannot add more admins until some are removed"
    )]
    AdminRegistryFull,

    // Keeping this for backward compatibility
    #[msg("Only program admin can perform this operation: Action requires elevated privileges")]
    OnlyProgramAdmin,
}
