import { PublicKey } from '@solana/web3.js';

export interface InitializeAdminRegistryAccounts {
    superAdmin: PublicKey;
    adminRegistry: PublicKey;
    systemProgram: PublicKey;
    rent: PublicKey;
}

export interface CreateExchangePoolAccounts {
    admin: PublicKey;
    adminRegistry: PublicKey;
    pool: PublicKey;
    lctMint: PublicKey;
    returnTokenMint: PublicKey;
    poolAuthority: PublicKey;
    lctRecipientAccount: PublicKey;
    poolReturnTokenAccount: PublicKey;
    systemProgram: PublicKey;
    tokenProgram: PublicKey;
    rent: PublicKey;
}

export interface ExchangeTokensAccounts {
    user: PublicKey;
    pool: PublicKey;
    userLctAccount: PublicKey;
    recipientLctAccount: PublicKey;
    poolReturnTokenAccount: PublicKey;
    userReturnTokenAccount: PublicKey;
    lctMint: PublicKey;
    returnTokenMint: PublicKey;
    poolAuthority: PublicKey;
    tokenProgram: PublicKey;
    associatedTokenProgram: PublicKey;
    systemProgram: PublicKey;
    rent: PublicKey;
} 