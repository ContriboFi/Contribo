import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import * as splToken from "@solana/spl-token";
import { assert } from "chai";
import { ClaimRefund } from "../target/types/claim_refund";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { InitializeAdminRegistryAccounts, CreateExchangePoolAccounts, ExchangeTokensAccounts } from './types';

// Use the correct program name as in Anchor.toml and Rust declare_id!
describe("claim_refund", () => {
    // Configure the client to use the local cluster.
    const connection = new anchor.web3.Connection('http://localhost:8899', 'confirmed');
    const wallet = new anchor.Wallet(anchor.web3.Keypair.fromSecretKey(Buffer.from(require('../wallet-keypair.json'))));
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    anchor.setProvider(provider);
    const program = anchor.workspace.claim_refund as Program<ClaimRefund>;
    const payer = (provider.wallet as NodeWallet).payer;

    let mintA: anchor.web3.PublicKey;
    let mintB: anchor.web3.PublicKey;
    let userTokenA: anchor.web3.PublicKey;
    let userTokenB: anchor.web3.PublicKey;
    let pool: anchor.web3.PublicKey;
    let poolReturnTokenAccount: anchor.web3.PublicKey;
    let lctRecipientAccount: anchor.web3.PublicKey;
    let poolAuthority: anchor.web3.PublicKey;
    let adminRegistry: anchor.web3.PublicKey;
    let poolSeed = "test-pool";
    let exchangeRatio = new anchor.BN(10); // 10:1
    let maxLctCap = new anchor.BN(100);

    before(async () => {
        // Airdrop SOL to the wallet
        const signature = await connection.requestAirdrop(wallet.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(signature);
    });

    it("Initializes mints and user token accounts", async () => {
        // Create Mint A (LCT)
        mintA = await splToken.createMint(
            connection,
            payer,
            wallet.publicKey,
            null,
            0
        );

        // Create Mint B (Return Token)
        mintB = await splToken.createMint(
            connection,
            payer,
            wallet.publicKey,
            null,
            0
        );

        // Create user token accounts
        userTokenA = await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mintA,
            wallet.publicKey
        ).then(acc => acc.address);

        userTokenB = await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mintB,
            wallet.publicKey
        ).then(acc => acc.address);

        // Mint 100 tokens A to user
        await splToken.mintTo(
            connection,
            payer,
            mintA,
            userTokenA,
            wallet.publicKey,
            100
        );

        // Do NOT mint token B to user here

        // Check balances
        let balA = await splToken.getAccount(connection, userTokenA);
        let balB = await splToken.getAccount(connection, userTokenB);
        assert.equal(Number(balA.amount), 100);
        assert.equal(Number(balB.amount), 0);
    });

    it("Initializes admin registry", async () => {
        // Derive admin registry PDA
        [adminRegistry] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("admin_registry")],
            program.programId
        );
        await program.methods.initializeAdminRegistry().accounts({
            superAdmin: wallet.publicKey,
            adminRegistry,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        } as InitializeAdminRegistryAccounts).rpc();
    });

    it("Creates exchange pool", async () => {
        // Derive pool PDA
        [pool] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("pool"), Buffer.from(poolSeed)],
            program.programId
        );
        // Derive pool authority PDA
        [poolAuthority] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("authority"), Buffer.from(poolSeed)],
            program.programId
        );
        // Derive lct recipient and pool return token accounts
        [lctRecipientAccount] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("lct_recipient"), Buffer.from(poolSeed)],
            program.programId
        );
        [poolReturnTokenAccount] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("pool_return"), Buffer.from(poolSeed)],
            program.programId
        );
        await program.methods.createExchangePool(
            poolSeed,
            exchangeRatio,
            maxLctCap,
            true
        ).accounts({
            admin: wallet.publicKey,
            adminRegistry,
            pool,
            lctMint: mintA,
            returnTokenMint: mintB,
            poolAuthority,
            lctRecipientAccount,
            poolReturnTokenAccount,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: splToken.TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        } as CreateExchangePoolAccounts).rpc();
    });

    it("Sends token B to pool's return token account", async () => {
        // Mint 1000 token B to pool's return token account
        await splToken.mintTo(
            connection,
            payer,
            mintB,
            poolReturnTokenAccount,
            wallet.publicKey,
            1000
        );
        let bal = await splToken.getAccount(connection, poolReturnTokenAccount);
        assert.equal(Number(bal.amount), 1000);
    });

    it("Claims token B for token A", async () => {
        // User exchanges all 100 A for 1000 B
        await program.methods.exchangeTokens(poolSeed, new anchor.BN(100)).accounts({
            user: wallet.publicKey,
            pool,
            userLctAccount: userTokenA,
            recipientLctAccount: lctRecipientAccount,
            poolReturnTokenAccount,
            userReturnTokenAccount: userTokenB,
            lctMint: mintA,
            returnTokenMint: mintB,
            poolAuthority,
            tokenProgram: splToken.TOKEN_PROGRAM_ID,
            associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        } as ExchangeTokensAccounts).rpc();

        // Check balances
        let balA = await splToken.getAccount(connection, userTokenA);
        let balB = await splToken.getAccount(connection, userTokenB);
        let poolBalB = await splToken.getAccount(connection, poolReturnTokenAccount);
        assert.equal(Number(balA.amount), 0); // all spent
        assert.equal(Number(balB.amount), 1000); // all received
        assert.equal(Number(poolBalB.amount), 0); // all spent
    });
}); 