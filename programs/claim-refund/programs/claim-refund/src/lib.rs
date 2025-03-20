use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};
use std::str::FromStr;

declare_id!("6KmFZ2JqHM15C7zc2mJgw2WVv5abzgbWWgCeBdmneYVU");

// Constant storing the program admin address
pub const PROGRAM_ADMIN: &str = "69CjSGZG3h26dake57CqwYqxPLhtqFvHPxFFZDKeyCGF";

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
    pub struct MaxCapUpdated {
        pub pool: Pubkey,
        pub old_max_cap: u64,
        pub new_max_cap: u64,
        pub admin: Pubkey,
    }

    /// Creates a new exchange pool
    pub fn create_exchange_pool(
        ctx: Context<CreateExchangePool>,
        pool_seed: String,
        exchange_ratio: u64,
        max_lct_cap: u64,
        enabled: bool,
    ) -> Result<()> {
        // Verify that the function is called by the program admin
        let program_admin = Pubkey::from_str(PROGRAM_ADMIN).unwrap();
        require!(
            ctx.accounts.admin.key() == program_admin,
            ExchangeError::OnlyProgramAdmin
        );

        // Validate parameters
        require!(!pool_seed.is_empty(), ExchangeError::InvalidParameter);
        require!(exchange_ratio > 0, ExchangeError::InvalidParameter);
        require!(max_lct_cap > 0, ExchangeError::InvalidParameter);
        require!(
            ctx.accounts.lct_recipient.key() != Pubkey::default(),
            ExchangeError::ZeroAddress
        );

        let pool = &mut ctx.accounts.pool;

        // Set pool seed
        pool.pool_seed = pool_seed.clone();

        // Set pool parameters
        pool.admin = ctx.accounts.admin.key();
        pool.lct_mint = ctx.accounts.lct_mint.key();
        pool.return_token_mint = ctx.accounts.return_token_mint.key();
        pool.lct_recipient = ctx.accounts.lct_recipient.key();
        pool.exchange_ratio = exchange_ratio;
        pool.enabled = enabled;
        pool.total_lct_exchanged = 0;
        pool.max_lct_cap = max_lct_cap;

        // Create and store PDA info for authority
        let seeds = [b"authority", pool_seed.as_bytes()];
        let (authority_pda, bump) = Pubkey::find_program_address(&seeds, ctx.program_id);
        pool.authority = authority_pda;
        pool.authority_bump = bump;

        // Emit event
        emit!(ExchangePoolCreated {
            admin: ctx.accounts.admin.key(),
            pool: pool.key(),
            lct_mint: ctx.accounts.lct_mint.key(),
            return_token_mint: ctx.accounts.return_token_mint.key(),
            lct_recipient: ctx.accounts.lct_recipient.key(),
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

        // Check if this exchange would exceed the max LCT cap
        let new_total = pool
            .total_lct_exchanged
            .checked_add(lct_amount)
            .ok_or(ExchangeError::Overflow)?;
        require!(new_total <= pool.max_lct_cap, ExchangeError::MaxCapReached);

        // Calculate return tokens based on exchange ratio
        let return_token_amount = lct_amount
            .checked_mul(pool.exchange_ratio)
            .ok_or(ExchangeError::Overflow)?;

        // Generate signer seeds for PDA operations
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"authority",
            pool.pool_seed.as_bytes(),
            &[pool.authority_bump],
        ]];

        // Step 1: Transfer LCT from user to recipient
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

        // Step 2: Transfer return tokens from pool to user
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.pool_return_token_account.to_account_info(),
                    to: ctx.accounts.user_return_token_account.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
                signer_seeds,
            ),
            return_token_amount,
        )?;

        // Step 3: Burn the received LCT tokens from recipient
        token::burn(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.lct_mint.to_account_info(),
                    from: ctx.accounts.recipient_lct_account.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
                signer_seeds,
            ),
            lct_amount,
        )?;

        // Update pool state
        pool.total_lct_exchanged = new_total;

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

    /// Toggle the exchange pool enabled status
    pub fn toggle_enabled(
        ctx: Context<UpdateConfig>,
        pool_seed: String,
        enabled: bool,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, ExchangeError::PoolSeedMismatch);

        // Verify admin permission
        let program_admin = Pubkey::from_str(PROGRAM_ADMIN).unwrap();
        require!(
            ctx.accounts.admin.key() == program_admin,
            ExchangeError::OnlyProgramAdmin
        );

        // Update enabled status
        pool.enabled = enabled;

        // Emit event
        emit!(PoolStatusChanged {
            pool: pool.key(),
            enabled,
            admin: ctx.accounts.admin.key(),
        });

        Ok(())
    }

    /// Update the maximum LCT cap for the pool
    pub fn update_max_cap(
        ctx: Context<UpdateConfig>,
        pool_seed: String,
        new_max_cap: u64,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, ExchangeError::PoolSeedMismatch);

        // Verify admin permission
        let program_admin = Pubkey::from_str(PROGRAM_ADMIN).unwrap();
        require!(
            ctx.accounts.admin.key() == program_admin,
            ExchangeError::OnlyProgramAdmin
        );

        // Validate new cap
        require!(new_max_cap > 0, ExchangeError::InvalidParameter);
        require!(
            new_max_cap >= pool.total_lct_exchanged,
            ExchangeError::InvalidParameter
        );

        // Store old cap for event
        let old_max_cap = pool.max_lct_cap;

        // Update max cap
        pool.max_lct_cap = new_max_cap;

        // Emit event
        emit!(MaxCapUpdated {
            pool: pool.key(),
            old_max_cap,
            new_max_cap,
            admin: ctx.accounts.admin.key(),
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(pool_seed: String)]
pub struct CreateExchangePool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

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

    /// CHECK: This is the address that will receive the LCT tokens
    pub lct_recipient: UncheckedAccount<'info>,

    /// CHECK: This is the PDA that will be the authority for the pool
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
        constraint = recipient_lct_account.mint == pool.lct_mint,
        constraint = recipient_lct_account.owner == pool_authority.key()
    )]
    pub recipient_lct_account: Account<'info, TokenAccount>,

    #[account(
        mut,
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
}

#[account]
pub struct ExchangePool {
    pub admin: Pubkey,             // Pool administrator
    pub lct_mint: Pubkey,          // LCT token mint
    pub return_token_mint: Pubkey, // Return token mint
    pub lct_recipient: Pubkey,     // Authority for the recipient LCT account
    pub exchange_ratio: u64,       // Ratio of return tokens per LCT
    pub enabled: bool,             // Whether exchanges are enabled
    pub total_lct_exchanged: u64,  // Total LCT tokens exchanged
    pub max_lct_cap: u64,          // Maximum total LCT tokens that can be exchanged
    pub pool_seed: String,         // Unique identifier for the pool
    pub authority: Pubkey,         // PDA for pool operations
    pub authority_bump: u8,        // Bump for authority PDA
}

impl ExchangePool {
    pub const LEN: usize = 32 + // admin
                           32 + // lct_mint
                           32 + // return_token_mint
                           32 + // lct_recipient
                           8 +  // exchange_ratio
                           1 +  // enabled
                           8 +  // total_lct_exchanged
                           8 +  // max_lct_cap
                           64 + // pool_seed (max length)
                           32 + // authority
                           1; // authority_bump
}

#[error_code]
pub enum ExchangeError {
    #[msg("Invalid parameter")]
    InvalidParameter,

    #[msg("Overflow occurred during calculation")]
    Overflow,

    #[msg("Exchange is disabled for this pool")]
    ExchangeDisabled,

    #[msg("Unauthorized operation")]
    Unauthorized,

    #[msg("Zero address is not allowed")]
    ZeroAddress,

    #[msg("Maximum LCT cap has been reached")]
    MaxCapReached,

    #[msg("Pool seed mismatch")]
    PoolSeedMismatch,

    #[msg("Only program admin can perform this operation")]
    OnlyProgramAdmin,
}
