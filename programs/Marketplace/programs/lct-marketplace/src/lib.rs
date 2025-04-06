use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("FZe9i7PEgbCTBzAq9LVvhXSBxVU58AnDYmNLoTXQdSnM");

#[program]
pub mod lct_marketplace {
    use super::*;

    pub fn initialize_admin_whitelist(
        ctx: Context<InitializeAdminWhitelist>,
        initial_admins: Vec<Pubkey>,
    ) -> Result<()> {
        let whitelist = &mut ctx.accounts.admin_whitelist;
        whitelist.super_admin = ctx.accounts.super_admin.key();
        whitelist.authorized_admins = initial_admins;
        whitelist.bump = ctx.bumps.admin_whitelist;

        Ok(())
    }

    pub fn add_admin(ctx: Context<ManageAdminWhitelist>, new_admin: Pubkey) -> Result<()> {
        let whitelist = &mut ctx.accounts.admin_whitelist;

        // Only super_admin can add new admins
        require!(
            ctx.accounts.super_admin.key() == whitelist.super_admin,
            MarketplaceError::NotSuperAdmin
        );

        // Check if admin already exists
        require!(
            !whitelist.authorized_admins.contains(&new_admin),
            MarketplaceError::AdminAlreadyExists
        );

        whitelist.authorized_admins.push(new_admin);

        Ok(())
    }

    pub fn remove_admin(ctx: Context<ManageAdminWhitelist>, admin_to_remove: Pubkey) -> Result<()> {
        let whitelist = &mut ctx.accounts.admin_whitelist;

        // Only super_admin can remove admins
        require!(
            ctx.accounts.super_admin.key() == whitelist.super_admin,
            MarketplaceError::NotSuperAdmin
        );

        // Find the admin in the vector
        let position = whitelist
            .authorized_admins
            .iter()
            .position(|&admin| admin == admin_to_remove);

        if let Some(index) = position {
            whitelist.authorized_admins.remove(index);
            Ok(())
        } else {
            Err(MarketplaceError::AdminNotFound.into())
        }
    }

    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        commission_rate: u64,
    ) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.admin = ctx.accounts.admin.key();
        marketplace.active = true;
        marketplace.commission_rate = commission_rate;
        marketplace.lct_mint = ctx.accounts.lct_mint.key();
        marketplace.payment_mint = ctx.accounts.payment_mint.key();
        marketplace.bump = ctx.bumps.marketplace;

        Ok(())
    }

    pub fn create_seller_offer(
        ctx: Context<CreateSellerOffer>,
        quantity: u64,
        price_per_token: u64,
    ) -> Result<()> {
        let marketplace = &ctx.accounts.marketplace;
        require!(marketplace.active, MarketplaceError::MarketplaceInactive);

        let offer = &mut ctx.accounts.offer;
        offer.seller = ctx.accounts.seller.key();
        offer.marketplace = ctx.accounts.marketplace.key();
        offer.quantity = quantity;
        offer.price_per_token = price_per_token;
        offer.remaining_quantity = quantity;
        offer.active = true;
        offer.offer_type = OfferType::Sell;
        offer.bump = ctx.bumps.offer;

        let cpi_accounts = Transfer {
            from: ctx.accounts.seller_token_account.to_account_info(),
            to: ctx.accounts.marketplace_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, quantity)?;

        Ok(())
    }

    pub fn create_buyer_bid(
        ctx: Context<CreateBuyerBid>,
        quantity: u64,
        price_per_token: u64,
    ) -> Result<()> {
        let marketplace = &ctx.accounts.marketplace;
        require!(marketplace.active, MarketplaceError::MarketplaceInactive);

        let bid = &mut ctx.accounts.bid;
        bid.buyer = ctx.accounts.buyer.key();
        bid.marketplace = ctx.accounts.marketplace.key();
        bid.quantity = quantity;
        bid.price_per_token = price_per_token;
        bid.remaining_quantity = quantity;
        bid.active = true;
        bid.bump = ctx.bumps.bid;

        // Calculate the total amount of payment tokens to transfer
        let total_payment = quantity
            .checked_mul(price_per_token)
            .ok_or(MarketplaceError::CalculationError)?;

        // Transfer payment tokens from buyer to PDA
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_payment_account.to_account_info(),
            to: ctx.accounts.marketplace_payment_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, total_payment)?;

        Ok(())
    }

    pub fn buy_from_seller_offer(ctx: Context<BuyFromSellerOffer>, quantity: u64) -> Result<()> {
        let marketplace = &ctx.accounts.marketplace;
        require!(marketplace.active, MarketplaceError::MarketplaceInactive);

        let offer = &mut ctx.accounts.offer;
        require!(offer.active, MarketplaceError::OfferInactive);
        require!(
            offer.offer_type == OfferType::Sell,
            MarketplaceError::InvalidOfferType
        );
        require!(
            quantity <= offer.remaining_quantity,
            MarketplaceError::InsufficientQuantity
        );

        let total_payment = quantity
            .checked_mul(offer.price_per_token)
            .ok_or(MarketplaceError::CalculationError)?;

        // Calculate commission
        let commission_amount = total_payment
            .checked_mul(marketplace.commission_rate)
            .ok_or(MarketplaceError::CalculationError)?
            .checked_div(10000)
            .ok_or(MarketplaceError::CalculationError)?;

        let payment_to_seller = total_payment
            .checked_sub(commission_amount)
            .ok_or(MarketplaceError::CalculationError)?;

        // 1. UPDATE STATE FIRST (before any transfers)
        // Update offer state
        offer.remaining_quantity = offer
            .remaining_quantity
            .checked_sub(quantity)
            .ok_or(MarketplaceError::CalculationError)?;

        if offer.remaining_quantity == 0 {
            offer.active = false;
        }

        // 2. THEN PERFORM TRANSFERS
        // Transfer payment tokens from buyer to seller
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_payment_account.to_account_info(),
            to: ctx.accounts.seller_payment_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, payment_to_seller)?;

        // Transfer commission if applicable
        if commission_amount > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.buyer_payment_account.to_account_info(),
                to: ctx.accounts.admin_payment_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            };

            let cpi_ctx =
                CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
            token::transfer(cpi_ctx, commission_amount)?;
        }

        // Transfer LCT tokens from marketplace to buyer
        let marketplace_seeds = &[
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
            &[marketplace.bump],
        ];
        let marketplace_signer = &[&marketplace_seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.marketplace_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.marketplace.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            marketplace_signer,
        );

        token::transfer(cpi_ctx, quantity)?;

        Ok(())
    }

    pub fn accept_buyer_bid(ctx: Context<AcceptBuyerBid>, quantity: u64) -> Result<()> {
        let marketplace = &ctx.accounts.marketplace;
        require!(marketplace.active, MarketplaceError::MarketplaceInactive);

        let bid = &mut ctx.accounts.bid;
        require!(bid.active, MarketplaceError::BidInactive);
        require!(
            quantity <= bid.remaining_quantity,
            MarketplaceError::InsufficientQuantity
        );

        // Calculate payment amount
        let total_payment = quantity
            .checked_mul(bid.price_per_token)
            .ok_or(MarketplaceError::CalculationError)?;

        // Calculate commission
        let commission_amount = total_payment
            .checked_mul(marketplace.commission_rate)
            .ok_or(MarketplaceError::CalculationError)?
            .checked_div(10000)
            .ok_or(MarketplaceError::CalculationError)?;

        let payment_to_seller = total_payment
            .checked_sub(commission_amount)
            .ok_or(MarketplaceError::CalculationError)?;

        // 1. UPDATE STATE FIRST (before any transfers)
        // Update bid state
        bid.remaining_quantity = bid
            .remaining_quantity
            .checked_sub(quantity)
            .ok_or(MarketplaceError::CalculationError)?;

        if bid.remaining_quantity == 0 {
            bid.active = false;
        }

        // 2. THEN PERFORM TRANSFERS
        // Transfer LCT tokens from seller to buyer
        let cpi_accounts = Transfer {
            from: ctx.accounts.seller_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, quantity)?;

        // Transfer payment tokens from marketplace to seller
        let marketplace_seeds = &[
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
            &[marketplace.bump],
        ];
        let marketplace_signer = &[&marketplace_seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.marketplace_payment_account.to_account_info(),
            to: ctx.accounts.seller_payment_account.to_account_info(),
            authority: ctx.accounts.marketplace.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            marketplace_signer,
        );

        token::transfer(cpi_ctx, payment_to_seller)?;

        // Transfer commission if applicable
        if commission_amount > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.marketplace_payment_account.to_account_info(),
                to: ctx.accounts.admin_payment_account.to_account_info(),
                authority: ctx.accounts.marketplace.to_account_info(),
            };

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                marketplace_signer,
            );

            token::transfer(cpi_ctx, commission_amount)?;
        }

        Ok(())
    }

    pub fn deactivate_marketplace(ctx: Context<DeactivateMarketplace>) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        require!(marketplace.active, MarketplaceError::MarketplaceInactive);

        // Only admin can deactivate the marketplace
        require!(
            ctx.accounts.admin.key() == marketplace.admin,
            MarketplaceError::NotAdmin
        );

        marketplace.active = false;

        Ok(())
    }

    pub fn modify_seller_offer(
        ctx: Context<ModifySellerOffer>,
        new_quantity: u64,
        new_price_per_token: u64,
    ) -> Result<()> {
        let marketplace = &ctx.accounts.marketplace;
        require!(marketplace.active, MarketplaceError::MarketplaceInactive);

        let offer = &mut ctx.accounts.offer;
        require!(offer.active, MarketplaceError::OfferInactive);
        require!(
            offer.offer_type == OfferType::Sell,
            MarketplaceError::InvalidOfferType
        );

        // Only the offer creator can modify their offer
        require!(
            ctx.accounts.seller.key() == offer.seller,
            MarketplaceError::NotOfferOwner
        );

        // Validate that new quantity is positive
        require!(
            new_quantity > 0,
            MarketplaceError::InvalidModificationParameters
        );

        // Calculate the current tokens held in the marketplace PDA
        let current_held_tokens = offer.remaining_quantity;

        // If increasing quantity, transfer additional tokens from seller to PDA
        if new_quantity > current_held_tokens {
            let additional_tokens = new_quantity
                .checked_sub(current_held_tokens)
                .ok_or(MarketplaceError::CalculationError)?;

            // Transfer additional tokens from seller to PDA
            let cpi_accounts = Transfer {
                from: ctx.accounts.seller_token_account.to_account_info(),
                to: ctx.accounts.marketplace_token_account.to_account_info(),
                authority: ctx.accounts.seller.to_account_info(),
            };

            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

            token::transfer(cpi_ctx, additional_tokens)?;
        }
        // If decreasing quantity, return excess tokens to seller
        else if new_quantity < current_held_tokens {
            let excess_tokens = current_held_tokens
                .checked_sub(new_quantity)
                .ok_or(MarketplaceError::CalculationError)?;

            // Return excess tokens to seller
            let marketplace_seeds = &[
                b"marketplace".as_ref(),
                marketplace.lct_mint.as_ref(),
                marketplace.payment_mint.as_ref(),
                &[marketplace.bump],
            ];
            let marketplace_signer = &[&marketplace_seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.marketplace_token_account.to_account_info(),
                to: ctx.accounts.seller_token_account.to_account_info(),
                authority: ctx.accounts.marketplace.to_account_info(),
            };

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                marketplace_signer,
            );

            token::transfer(cpi_ctx, excess_tokens)?;
        }

        // Update offer details
        offer.quantity = new_quantity;
        offer.price_per_token = new_price_per_token;
        offer.remaining_quantity = new_quantity;

        Ok(())
    }

    pub fn modify_buyer_bid(
        ctx: Context<ModifyBuyerBid>,
        new_quantity: u64,
        new_price_per_token: u64,
    ) -> Result<()> {
        let marketplace = &ctx.accounts.marketplace;
        require!(marketplace.active, MarketplaceError::MarketplaceInactive);

        let bid = &mut ctx.accounts.bid;
        require!(bid.active, MarketplaceError::BidInactive);

        // Only the bid creator can modify their bid
        require!(
            ctx.accounts.buyer.key() == bid.buyer,
            MarketplaceError::NotBidOwner
        );

        // Validate that new quantity is positive
        require!(
            new_quantity > 0,
            MarketplaceError::InvalidModificationParameters
        );

        // Calculate the current amount of payment tokens held in the marketplace PDA
        let current_payment = bid
            .remaining_quantity
            .checked_mul(bid.price_per_token)
            .ok_or(MarketplaceError::CalculationError)?;

        // Calculate the new payment amount required
        let new_payment_amount = new_quantity
            .checked_mul(new_price_per_token)
            .ok_or(MarketplaceError::CalculationError)?;

        // If new payment amount is greater, transfer additional tokens from buyer to PDA
        if new_payment_amount > current_payment {
            let additional_payment = new_payment_amount
                .checked_sub(current_payment)
                .ok_or(MarketplaceError::CalculationError)?;

            // Transfer additional payment tokens from buyer to PDA
            let cpi_accounts = Transfer {
                from: ctx.accounts.buyer_payment_account.to_account_info(),
                to: ctx.accounts.marketplace_payment_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            };

            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

            token::transfer(cpi_ctx, additional_payment)?;
        }
        // If new payment amount is less, return excess tokens to buyer
        else if new_payment_amount < current_payment {
            let excess_payment = current_payment
                .checked_sub(new_payment_amount)
                .ok_or(MarketplaceError::CalculationError)?;

            // Return excess payment tokens to buyer
            let marketplace_seeds = &[
                b"marketplace".as_ref(),
                marketplace.lct_mint.as_ref(),
                marketplace.payment_mint.as_ref(),
                &[marketplace.bump],
            ];
            let marketplace_signer = &[&marketplace_seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.marketplace_payment_account.to_account_info(),
                to: ctx.accounts.buyer_payment_account.to_account_info(),
                authority: ctx.accounts.marketplace.to_account_info(),
            };

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                marketplace_signer,
            );

            token::transfer(cpi_ctx, excess_payment)?;
        }

        // Update bid details
        bid.quantity = new_quantity;
        bid.price_per_token = new_price_per_token;
        bid.remaining_quantity = new_quantity;

        Ok(())
    }

    pub fn cancel_seller_offer(ctx: Context<CancelSellerOffer>) -> Result<()> {
        let marketplace = &ctx.accounts.marketplace;
        let offer = &mut ctx.accounts.offer;

        // Only the seller can cancel their own offer
        require!(
            ctx.accounts.seller.key() == offer.seller,
            MarketplaceError::NotOfferOwner
        );

        require!(offer.active, MarketplaceError::OfferInactive);
        require!(
            offer.offer_type == OfferType::Sell,
            MarketplaceError::InvalidOfferType
        );

        // Return tokens to seller
        let marketplace_seeds = &[
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
            &[marketplace.bump],
        ];
        let marketplace_signer = &[&marketplace_seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.marketplace_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.marketplace.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            marketplace_signer,
        );

        token::transfer(cpi_ctx, offer.remaining_quantity)?;

        // Mark offer as inactive
        offer.active = false;

        Ok(())
    }

    pub fn cancel_buyer_bid(ctx: Context<CancelBuyerBid>) -> Result<()> {
        let marketplace = &ctx.accounts.marketplace;
        let bid = &mut ctx.accounts.bid;

        // Only the buyer can cancel their own bid
        require!(
            ctx.accounts.buyer.key() == bid.buyer,
            MarketplaceError::NotBidOwner
        );

        require!(bid.active, MarketplaceError::BidInactive);

        // Calculate remaining payment amount
        let remaining_payment = bid
            .remaining_quantity
            .checked_mul(bid.price_per_token)
            .ok_or(MarketplaceError::CalculationError)?;

        // Return payment tokens to buyer
        let marketplace_seeds = &[
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
            &[marketplace.bump],
        ];
        let marketplace_signer = &[&marketplace_seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.marketplace_payment_account.to_account_info(),
            to: ctx.accounts.buyer_payment_account.to_account_info(),
            authority: ctx.accounts.marketplace.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            marketplace_signer,
        );

        token::transfer(cpi_ctx, remaining_payment)?;

        // Mark bid as inactive
        bid.active = false;

        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum OfferType {
    Sell,
    Buy,
}

#[account]
pub struct AdminWhitelist {
    pub super_admin: Pubkey,
    pub authorized_admins: Vec<Pubkey>,
    pub bump: u8,
}

#[account]
pub struct Marketplace {
    pub admin: Pubkey,
    pub active: bool,
    pub commission_rate: u64, // Commission rate in basis points (1/100 of 1%)
    pub lct_mint: Pubkey,
    pub payment_mint: Pubkey,
    pub bump: u8,
}

#[account]
pub struct Offer {
    pub seller: Pubkey,
    pub marketplace: Pubkey,
    pub quantity: u64,
    pub price_per_token: u64,
    pub remaining_quantity: u64,
    pub active: bool,
    pub offer_type: OfferType,
    pub bump: u8,
}

#[account]
pub struct Bid {
    pub buyer: Pubkey,
    pub marketplace: Pubkey,
    pub quantity: u64,
    pub price_per_token: u64,
    pub remaining_quantity: u64,
    pub active: bool,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializeAdminWhitelist<'info> {
    #[account(mut)]
    pub super_admin: Signer<'info>,

    #[account(
        init,
        payer = super_admin,
        space = 8 + 32 + 4 + (32 * 10) + 1, // Arbitrary initial capacity for 10 admins
        seeds = [b"admin_whitelist".as_ref()],
        bump
    )]
    pub admin_whitelist: Account<'info, AdminWhitelist>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ManageAdminWhitelist<'info> {
    #[account(mut)]
    pub super_admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"admin_whitelist".as_ref()],
        bump = admin_whitelist.bump
    )]
    pub admin_whitelist: Account<'info, AdminWhitelist>,
}

#[derive(Accounts)]
pub struct InitializeMarketplace<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [b"admin_whitelist".as_ref()],
        bump = admin_whitelist.bump,
        constraint = admin_whitelist.authorized_admins.contains(&admin.key()) @ MarketplaceError::NotAuthorizedAdmin,
    )]
    pub admin_whitelist: Account<'info, AdminWhitelist>,

    #[account(
        init,
        payer = admin,
        space = 8 + std::mem::size_of::<Marketplace>(),
        seeds = [
            b"marketplace".as_ref(),
            lct_mint.key().as_ref(),
            payment_mint.key().as_ref(),
        ],
        bump
    )]
    pub marketplace: Account<'info, Marketplace>,

    pub lct_mint: Account<'info, Mint>,
    pub payment_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = lct_mint,
        associated_token::authority = marketplace
    )]
    pub marketplace_lct_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = payment_mint,
        associated_token::authority = marketplace
    )]
    pub marketplace_payment_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(quantity: u64, price_per_token: u64)]
pub struct CreateSellerOffer<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
        ],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,

    // We need the actual mint account
    #[account(address = marketplace.lct_mint)]
    pub lct_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = seller,
        space = 8 + std::mem::size_of::<Offer>(),
        seeds = [
            b"offer".as_ref(),
            marketplace.key().as_ref(),
            seller.key().as_ref(),
        ],
        bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        mut,
        constraint = seller_token_account.owner == seller.key(),
        constraint = seller_token_account.mint == marketplace.lct_mint
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = lct_mint,
        associated_token::authority = marketplace
    )]
    pub marketplace_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyFromSellerOffer<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
        ],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        mut,
        constraint = offer.marketplace == marketplace.key(),
        seeds = [
            b"offer".as_ref(),
            marketplace.key().as_ref(),
            offer.seller.as_ref(),
        ],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>,

    /// The original seller of the tokens
    #[account(
        constraint = seller.key() == offer.seller @ MarketplaceError::SellerMismatch
    )]
    pub seller: AccountInfo<'info>,

    #[account(
        mut,
        constraint = seller_payment_account.owner == seller.key(),
        constraint = seller_payment_account.mint == marketplace.payment_mint
    )]
    pub seller_payment_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = buyer_payment_account.owner == buyer.key(),
        constraint = buyer_payment_account.mint == marketplace.payment_mint
    )]
    pub buyer_payment_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = buyer_token_account.owner == buyer.key(),
        constraint = buyer_token_account.mint == marketplace.lct_mint
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = marketplace_token_account.owner == marketplace.key(),
        constraint = marketplace_token_account.mint == marketplace.lct_mint
    )]
    pub marketplace_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = admin_payment_account.owner == marketplace.admin,
        constraint = admin_payment_account.mint == marketplace.payment_mint
    )]
    pub admin_payment_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(quantity: u64, price_per_token: u64)]
pub struct CreateBuyerBid<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
        ],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,

    // We need the actual payment mint account
    #[account(address = marketplace.payment_mint)]
    pub payment_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = buyer,
        space = 8 + std::mem::size_of::<Bid>(),
        seeds = [
            b"bid".as_ref(),
            marketplace.key().as_ref(),
            buyer.key().as_ref(),
        ],
        bump
    )]
    pub bid: Account<'info, Bid>,

    #[account(
        mut,
        constraint = buyer_payment_account.owner == buyer.key(),
        constraint = buyer_payment_account.mint == marketplace.payment_mint
    )]
    pub buyer_payment_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = payment_mint,
        associated_token::authority = marketplace
    )]
    pub marketplace_payment_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AcceptBuyerBid<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
        ],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        mut,
        constraint = bid.marketplace == marketplace.key(),
        seeds = [
            b"bid".as_ref(),
            marketplace.key().as_ref(),
            bid.buyer.as_ref(),
        ],
        bump = bid.bump
    )]
    pub bid: Account<'info, Bid>,

    /// The original buyer who placed the bid
    #[account(
        constraint = buyer.key() == bid.buyer @ MarketplaceError::BuyerMismatch
    )]
    pub buyer: AccountInfo<'info>,

    #[account(
        mut,
        constraint = buyer_token_account.owner == buyer.key(),
        constraint = buyer_token_account.mint == marketplace.lct_mint
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = seller_token_account.owner == seller.key(),
        constraint = seller_token_account.mint == marketplace.lct_mint
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = seller_payment_account.owner == seller.key(),
        constraint = seller_payment_account.mint == marketplace.payment_mint
    )]
    pub seller_payment_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = marketplace_payment_account.owner == marketplace.key(),
        constraint = marketplace_payment_account.mint == marketplace.payment_mint
    )]
    pub marketplace_payment_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = admin_payment_account.owner == marketplace.admin,
        constraint = admin_payment_account.mint == marketplace.payment_mint
    )]
    pub admin_payment_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DeactivateMarketplace<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
        ],
        bump = marketplace.bump,
        constraint = marketplace.admin == admin.key()
    )]
    pub marketplace: Account<'info, Marketplace>,
}

#[derive(Accounts)]
pub struct CancelSellerOffer<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
        ],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        mut,
        constraint = offer.seller == seller.key(),
        constraint = offer.marketplace == marketplace.key(),
        seeds = [
            b"offer".as_ref(),
            marketplace.key().as_ref(),
            seller.key().as_ref(),
        ],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        mut,
        constraint = seller_token_account.owner == seller.key(),
        constraint = seller_token_account.mint == marketplace.lct_mint
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = marketplace_token_account.owner == marketplace.key(),
        constraint = marketplace_token_account.mint == marketplace.lct_mint
    )]
    pub marketplace_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelBuyerBid<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
        ],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        mut,
        constraint = bid.buyer == buyer.key(),
        constraint = bid.marketplace == marketplace.key(),
        seeds = [
            b"bid".as_ref(),
            marketplace.key().as_ref(),
            buyer.key().as_ref(),
        ],
        bump = bid.bump
    )]
    pub bid: Account<'info, Bid>,

    #[account(
        mut,
        constraint = buyer_payment_account.owner == buyer.key(),
        constraint = buyer_payment_account.mint == marketplace.payment_mint
    )]
    pub buyer_payment_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = marketplace_payment_account.owner == marketplace.key(),
        constraint = marketplace_payment_account.mint == marketplace.payment_mint
    )]
    pub marketplace_payment_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ModifySellerOffer<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
        ],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        mut,
        constraint = offer.seller == seller.key(),
        constraint = offer.marketplace == marketplace.key(),
        seeds = [
            b"offer".as_ref(),
            marketplace.key().as_ref(),
            seller.key().as_ref(),
        ],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        mut,
        constraint = seller_token_account.owner == seller.key(),
        constraint = seller_token_account.mint == marketplace.lct_mint
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = marketplace_token_account.owner == marketplace.key(),
        constraint = marketplace_token_account.mint == marketplace.lct_mint
    )]
    pub marketplace_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ModifyBuyerBid<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"marketplace".as_ref(),
            marketplace.lct_mint.as_ref(),
            marketplace.payment_mint.as_ref(),
        ],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        mut,
        constraint = bid.buyer == buyer.key(),
        constraint = bid.marketplace == marketplace.key(),
        seeds = [
            b"bid".as_ref(),
            marketplace.key().as_ref(),
            buyer.key().as_ref(),
        ],
        bump = bid.bump
    )]
    pub bid: Account<'info, Bid>,

    #[account(
        mut,
        constraint = buyer_payment_account.owner == buyer.key(),
        constraint = buyer_payment_account.mint == marketplace.payment_mint
    )]
    pub buyer_payment_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = marketplace_payment_account.owner == marketplace.key(),
        constraint = marketplace_payment_account.mint == marketplace.payment_mint
    )]
    pub marketplace_payment_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum MarketplaceError {
    #[msg("This marketplace has been deactivated by the admin and cannot process new trades")]
    MarketplaceInactive,

    #[msg("Operation failed: only the designated marketplace admin can perform this action")]
    NotAdmin,

    #[msg("This offer is no longer active and cannot be fulfilled")]
    OfferInactive,

    #[msg("This bid is no longer active and cannot be accepted")]
    BidInactive,

    #[msg("Invalid offer type: the requested operation is incompatible with this offer type")]
    InvalidOfferType,

    #[msg("Insufficient quantity available: the requested amount exceeds what's available")]
    InsufficientQuantity,

    #[msg("Calculation error: numeric overflow or underflow detected")]
    CalculationError,

    #[msg("Authorization error: only the creator of an offer can modify or cancel it")]
    NotOfferOwner,

    #[msg("Authorization error: only the creator of a bid can modify or cancel it")]
    NotBidOwner,

    #[msg("Invalid parameters: modifications must maintain positive quantities")]
    InvalidModificationParameters,

    #[msg("Not authorized: the provided seller account doesn't match the offer's seller")]
    SellerMismatch,

    #[msg("Not authorized: the provided buyer account doesn't match the bid's buyer")]
    BuyerMismatch,

    #[msg("Authorization error: only the super admin can manage the admin whitelist")]
    NotSuperAdmin,

    #[msg("Not authorized: the account is not on the marketplace admin whitelist")]
    NotAuthorizedAdmin,

    #[msg("Admin already exists: this account is already in the admin whitelist")]
    AdminAlreadyExists,

    #[msg("Admin not found: the specified account is not in the admin whitelist")]
    AdminNotFound,
}
