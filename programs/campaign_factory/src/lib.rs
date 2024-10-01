use anchor_lang::prelude::*;

declare_id!("YourCampaignFactoryProgramID"); // Replace with your actual Program ID

#[program]
pub mod campaign_factory {
    use super::*;

    /// Initializes the CampaignFactory with the owner's public key.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let factory = &mut ctx.accounts.factory;
        factory.owner = ctx.accounts.owner.key();
        Ok(())
    }

    /// Creates a new Campaign associated with this factory.
    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        name: String,
        symbol: String,
        supply: u64,
        stable_mint: Pubkey,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        campaign.owner = ctx.accounts.owner.key();
        campaign.name = name;
        campaign.symbol = symbol;
        campaign.max_supply = supply;
        campaign.stable_mint = stable_mint;
        campaign.rate = 0;
        campaign.is_active = false;

        // Emit an event for the creation of a new campaign
        emit!(CampaignCreated {
            campaign_address: campaign.key(),
            owner: campaign.owner,
            name: campaign.name.clone(),
            symbol: campaign.symbol.clone(),
            supply: campaign.max_supply,
            stable_address: campaign.stable_mint,
        });

        Ok(())
    }

    /// Changes the owner of the CampaignFactory.
    pub fn change_owner(ctx: Context<ChangeOwner>, new_owner: Pubkey) -> Result<()> {
        let factory = &mut ctx.accounts.factory;
        require!(
            factory.owner == ctx.accounts.owner.key(),
            CampaignError::Unauthorized
        );
        factory.owner = new_owner;
        Ok(())
    }
}

/// Accounts required to initialize the CampaignFactory.
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = owner, space = Factory::LEN)]
    pub factory: Account<'info, Factory>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Accounts required to create a new Campaign.
#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub factory: Account<'info, Factory>,
    #[account(init, payer = owner, space = Campaign::LEN)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Accounts required to change the owner of the CampaignFactory.
#[derive(Accounts)]
pub struct ChangeOwner<'info> {
    #[account(mut)]
    pub factory: Account<'info, Factory>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

/// Represents the state of the CampaignFactory.
#[account]
pub struct Factory {
    pub owner: Pubkey,
}

impl Factory {
    const LEN: usize = 8 + 32; // Anchor accounts require an 8-byte discriminator
}

/// Represents a Campaign created by the CampaignFactory.
#[account]
pub struct Campaign {
    pub owner: Pubkey,
    pub name: String,
    pub symbol: String,
    pub max_supply: u64,
    pub stable_mint: Pubkey,
    pub rate: u64,
    pub is_active: bool,
    pub token_mint: Pubkey, // Address of the SPL token, set later
}

impl Campaign {
    const LEN: usize = 8 + 32 + 4 + 10 + 10 + 8 + 32 + 8 + 1 + 32;
}

/// Event emitted when a new Campaign is created.
#[event]
pub struct CampaignCreated {
    pub campaign_address: Pubkey,
    pub owner: Pubkey,
    pub name: String,
    pub symbol: String,
    pub supply: u64,
    pub stable_address: Pubkey,
}

/// Custom error types for the CampaignFactory.
#[error_code]
pub enum CampaignError {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
}
