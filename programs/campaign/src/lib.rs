use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount, Transfer};

declare_id!("YourCampaignProgramID"); // Replace with your actual Program ID

#[program]
pub mod campaign {
    use super::*;

    /// Initializes the Campaign with provided parameters.
    pub fn initialize_campaign(
        ctx: Context<InitializeCampaign>,
        name: String,
        symbol: String,
        max_supply: u64,
        stable_mint: Pubkey,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        campaign.owner = ctx.accounts.owner.key();
        campaign.name = name;
        campaign.symbol = symbol;
        campaign.max_supply = max_supply;
        campaign.stable_mint = stable_mint;
        campaign.rate = 0;
        campaign.is_active = false;
        campaign.token_mint = Pubkey::default(); // To be set later

        Ok(())
    }

    /// Sets the token information for the Campaign.
    pub fn set_token_information(
        ctx: Context<SetTokenInfo>,
        token_mint: Pubkey,
        rate: u64,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        require!(campaign.owner == ctx.accounts.owner.key(), CampaignError::Unauthorized);
        require!(token_mint != Pubkey::default(), CampaignError::InvalidTokenAddress);
        require!(rate > 0, CampaignError::InvalidRate);

        campaign.token_mint = token_mint;
        campaign.rate = rate;
        campaign.is_active = true;

        // Emit an event for setting token information
        emit!(TokenInformationSet {
            token: token_mint,
            rate,
        });

        Ok(())
    }

    /// Allows participants to contribute stable tokens and receive campaign tokens.
    pub fn participate(ctx: Context<Participate>, stable_amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        require!(stable_amount > 0, CampaignError::InvalidAmount);
        let current_supply = ctx.accounts.token_mint_account.supply;
        require!(
            current_supply + stable_amount <= campaign.max_supply,
            CampaignError::ExceedsMaxSupply
        );

        // Transfer stable tokens from participant to campaign
        let cpi_accounts = Transfer {
            from: ctx.accounts.participant_stable.to_account_info(),
            to: ctx.accounts.campaign_stable.to_account_info(),
            authority: ctx.accounts.participant.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, stable_amount)?;

        // Mint campaign tokens to participant
        let mint_to_accounts = MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.participant_token.to_account_info(),
            authority: ctx.accounts.campaign.to_account_info(),
        };
        let mint_to_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), mint_to_accounts);
        token::mint_to(mint_to_ctx, stable_amount)?;

        // Emit an event for participation
        emit!(Participation {
            participant: ctx.accounts.participant.key(),
            stable_amount,
            minted_amount: stable_amount, // Assuming 1:1 rate
        });

        Ok(())
    }

    /// Allows the Campaign owner to withdraw stable tokens from the campaign.
    pub fn withdraw_stables(ctx: Context<WithdrawStables>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        require!(campaign.owner == ctx.accounts.owner.key(), CampaignError::Unauthorized);
        require!(amount > 0, CampaignError::InvalidAmount);

        // Transfer stable tokens from campaign to owner
        let cpi_accounts = Transfer {
            from: ctx.accounts.campaign_stable.to_account_info(),
            to: ctx.accounts.owner_stable.to_account_info(),
            authority: ctx.accounts.campaign.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Emit an event for withdrawal
        emit!(StablesWithdrawn {
            owner: ctx.accounts.owner.key(),
            amount,
        });

        Ok(())
    }

    /// Allows participants to redeem their campaign tokens for stable tokens.
    pub fn redeem(ctx: Context<Redeem>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        require!(campaign.is_active, CampaignError::NotActive);
        require!(amount > 0, CampaignError::InvalidAmount);

        let token_amount = amount.checked_mul(campaign.rate).ok_or(CampaignError::CalculationError)?;

        // Burn campaign tokens from participant
        let cpi_accounts = Burn {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.participant_token.to_account_info(),
            authority: ctx.accounts.participant.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::burn(cpi_ctx, amount)?;

        // Transfer stable tokens to participant
        let cpi_transfer_accounts = Transfer {
            from: ctx.accounts.campaign_stable.to_account_info(),
            to: ctx.accounts.participant_stable_out.to_account_info(),
            authority: ctx.accounts.campaign.to_account_info(),
        };
        let cpi_transfer_ctx = CpiContext::new(cpi_transfer_program, cpi_transfer_accounts);
        token::transfer(cpi_transfer_ctx, token_amount)?;

        // Emit an event for redemption
        emit!(Redeemed {
            participant: ctx.accounts.participant.key(),
            amount,
            token_amount,
        });

        Ok(())
    }
}

/// Accounts required to initialize a Campaign.
#[derive(Accounts)]
pub struct InitializeCampaign<'info> {
    #[account(init, payer = owner, space = Campaign::LEN)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Accounts required to set token information for the Campaign.
#[derive(Accounts)]
pub struct SetTokenInfo<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

/// Accounts required for participation in the Campaign.
#[derive(Accounts)]
pub struct Participate<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub participant: Signer<'info>,
    #[account(mut)]
    pub participant_stable: Account<'info, TokenAccount>,
    #[account(mut)]
    pub campaign_stable: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub participant_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

/// Accounts required to withdraw stable tokens from the Campaign.
#[derive(Accounts)]
pub struct WithdrawStables<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub campaign_stable: Account<'info, TokenAccount>,
    #[account(mut)]
    pub owner_stable: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

/// Accounts required to redeem campaign tokens for stable tokens.
#[derive(Accounts)]
pub struct Redeem<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub participant: Signer<'info>,
    #[account(mut)]
    pub participant_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub campaign_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub participant_stable_out: Account<'info, TokenAccount>,
    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

/// Represents the state of a Campaign.
#[account]
pub struct Campaign {
    pub owner: Pubkey,
    pub name: String,
    pub symbol: String,
    pub max_supply: u64,
    pub stable_mint: Pubkey,
    pub rate: u64,
    pub is_active: bool,
    pub token_mint: Pubkey, // Address of the SPL token
}

impl Campaign {
    const LEN: usize = 8 + 32 + 4 + 100 + 4 + 10 + 8 + 32 + 8 + 1 + 32 + 32; 
    // Adjust sizes based on actual string lengths and fields
}

/// Event emitted when token information is set for the Campaign.
#[event]
pub struct TokenInformationSet {
    pub token: Pubkey,
    pub rate: u64,
}

/// Event emitted when a participant joins the Campaign.
#[event]
pub struct Participation {
    pub participant: Pubkey,
    pub stable_amount: u64,
    pub minted_amount: u64,
}

/// Event emitted when stable tokens are withdrawn by the owner.
#[event]
pub struct StablesWithdrawn {
    pub owner: Pubkey,
    pub amount: u64,
}

/// Event emitted when a participant redeems their campaign tokens.
#[event]
pub struct Redeemed {
    pub participant: Pubkey,
    pub amount: u64,
    pub token_amount: u64,
}

/// Custom error types for the Campaign.
#[error_code]
pub enum CampaignError {
    #[msg("Unauthorized action.")]
    Unauthorized,

    #[msg("Invalid token address.")]
    InvalidTokenAddress,

    #[msg("Rate must be greater than zero.")]
    InvalidRate,

    #[msg("Invalid amount.")]
    InvalidAmount,

    #[msg("Exceeds maximum supply.")]
    ExceedsMaxSupply,

    #[msg("Calculation error.")]
    CalculationError,

    #[msg("Campaign is not active.")]
    NotActive,
}
