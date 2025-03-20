use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};
use std::str::FromStr;

declare_id!("7mHhw5gkkVX59KvbpHCF4fumCRQtTDwEAzWJN5K1q8if");

// Constant storing the program admin address
pub const PROGRAM_ADMIN: &str = "69CjSGZG3h26dake57CqwYqxPLhtqFvHPxFFZDKeyCGF";

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

    /// Get the remaining amount a user can contribute to the pool
    pub fn get_remaining_contribution(
        ctx: Context<GetContribution>,
        pool_seed: String,
    ) -> Result<u64> {
        let pool = &ctx.accounts.pool;
        let user_key = ctx.accounts.user.key();

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, PoolError::PoolSeedMismatch);

        // Find user's current contribution
        let mut current_contribution: u64 = 0;
        for record in pool.user_contributions.iter() {
            if record.user == user_key {
                current_contribution = record.amount;
                break;
            }
        }

        // Calculate remaining allowed contribution
        if current_contribution >= pool.max_contribution {
            return Ok(0); // User has reached the maximum allowed contribution
        }

        let remaining = pool
            .max_contribution
            .checked_sub(current_contribution)
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
        // Verify that the function is called by the program admin
        let program_admin = Pubkey::from_str(PROGRAM_ADMIN).unwrap();
        require!(
            ctx.accounts.admin.key() == program_admin,
            PoolError::OnlyProgramAdmin
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
        pool.admin = ctx.accounts.admin.key();
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

        // Initialize user contributions vector
        pool.user_contributions = Vec::new();

        // Create and store PDA info
        let seeds = [b"authority", pool_seed.as_bytes()];
        let (authority_pda, bump) = Pubkey::find_program_address(&seeds, ctx.program_id);
        pool.authority = authority_pda;
        pool.authority_bump = bump;

        // Store USDC mint address provided by parameter
        pool.usdc_mint = usdc_mint;

        // Emit PoolCreated event
        emit!(PoolCreated {
            admin: ctx.accounts.admin.key(),
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

    /// Contribute USDC directly to the recipient and receive tokens in return
    pub fn contribute(ctx: Context<Contribute>, pool_seed: String, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_key = ctx.accounts.user.key();

        // Verify pool is valid and active
        require!(pool_seed == pool.pool_seed, PoolError::PoolSeedMismatch);
        require!(pool.enabled, PoolError::ContributionDisabled);

        // Validate contribution amount
        require!(
            amount >= pool.min_contribution,
            PoolError::BelowMinimumContribution
        );

        // Track user contribution
        let mut user_total_contribution = amount;
        let mut user_index = None;

        // Find existing user contribution record if it exists
        for (i, record) in pool.user_contributions.iter().enumerate() {
            if record.user == user_key {
                user_total_contribution = record
                    .amount
                    .checked_add(amount)
                    .ok_or(PoolError::Overflow)?;
                user_index = Some(i);
                break;
            }
        }

        // Check user's total contribution against max allowed
        require!(
            user_total_contribution <= pool.max_contribution,
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

        // Transfer USDC
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

        // Mint tokens
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

        // Update pool status
        pool.current_cap = new_total;
        pool.total_tokens_minted = pool
            .total_tokens_minted
            .checked_add(tokens_to_mint)
            .ok_or(PoolError::Overflow)?;

        // Update user contribution record
        if let Some(idx) = user_index {
            // Update existing record
            pool.user_contributions[idx].amount = user_total_contribution;
        } else {
            // Create new record
            pool.user_contributions.push(UserContributionRecord {
                user: user_key,
                amount: amount,
            });
        }

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
        ctx: Context<UpdateConfig>,
        pool_seed: String,
        enabled: bool,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        // Verify pool seed match
        require!(pool_seed == pool.pool_seed, PoolError::PoolSeedMismatch);

        // Verify admin permission
        let program_admin = Pubkey::from_str(PROGRAM_ADMIN).unwrap();
        require!(
            ctx.accounts.admin.key() == program_admin,
            PoolError::OnlyProgramAdmin
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
}

#[derive(Accounts)]
#[instruction(pool_seed: String)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

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
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool_seed.as_bytes()],
        bump
    )]
    pub pool: Account<'info, Pool>,
}

#[account]
pub struct Pool {
    pub admin: Pubkey,                                   // Pool administrator
    pub usdc_recipient: Pubkey, // Address to receive the USDC contributions
    pub current_cap: u64,       // Current amount raised
    pub enabled: bool,          // Whether contributions are enabled
    pub token_mint: Pubkey,     // Project token mint address
    pub token_name: String,     // Name of the project token
    pub token_symbol: String,   // Symbol of the project token
    pub pool_seed: String,      // Unique identifier for the pool
    pub authority: Pubkey,      // PDA for token minting
    pub authority_bump: u8,     // Bump for authority PDA
    pub usdc_mint: Pubkey,      // USDC mint address
    pub min_contribution: u64,  // Minimum contribution amount
    pub max_contribution: u64,  // Maximum contribution amount
    pub max_usdc_cap: u64,      // Maximum total USDC that can be raised
    pub max_token_supply: u64,  // Maximum total tokens that can be minted
    pub total_tokens_minted: u64, // Total number of tokens minted so far
    pub user_contributions: Vec<UserContributionRecord>, // Track contributions per user
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct UserContributionRecord {
    pub user: Pubkey, // User public key
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
                           1024; // Vector for user contributions (about 20 entries)
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

    #[msg("Only program admin can perform this operation")]
    OnlyProgramAdmin,

    #[msg("User has reached maximum contribution amount")]
    MaxUserContributionReached,
}
