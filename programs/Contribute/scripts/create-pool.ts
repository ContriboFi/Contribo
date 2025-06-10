import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Keypair } from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createAssociatedTokenAccount,
    getAssociatedTokenAddress,
    createMint,
    mintTo,
    getAccount,
} from "@solana/spl-token";
import * as fs from 'fs';
import * as path from 'path';

// Program ID of your deployed contract (update if needed)
const PROGRAM_ID = "7mHhw5gkkVX59KvbpHCF4fumCRQtTDwEAzWJN5K1q8if";

// USDC mint address on devnet
const USDC_MINT = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr";

// Admin registry seed
const ADMIN_REGISTRY_SEED = "admin-registry";

// Function to save pool details to a file
function savePoolDetails(poolSeed: string, poolPda: PublicKey, authorityPda: PublicKey, tokenMint: PublicKey) {
    const poolDetails = {
        poolSeed,
        poolPda: poolPda.toString(),
        authorityPda: authorityPda.toString(),
        tokenMint: tokenMint.toString(),
        createdAt: new Date().toISOString()
    };

    // Create pools directory if it doesn't exist
    const poolsDir = path.join(__dirname, '../pools');
    if (!fs.existsSync(poolsDir)) {
        fs.mkdirSync(poolsDir, { recursive: true });
    }

    // Save pool details to a JSON file
    const filePath = path.join(poolsDir, `${poolSeed}.json`);
    fs.writeFileSync(filePath, JSON.stringify(poolDetails, null, 2));
    console.log(`Pool details saved to: ${filePath}`);
}

async function main() {
    // Load wallet from keypair file in the current repository
    const walletKeypair = Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync(path.join(__dirname, '../wallet-keypair.json'), 'utf-8')))
    );
    console.log("Using wallet:", walletKeypair.publicKey.toString());

    // Configure the client to use devnet
    const connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(walletKeypair),
        { commitment: "confirmed" }
    );
    anchor.setProvider(provider);

    // Load the IDL dynamically from the Anchor build output (recommended for Anchor projects)
    const idlPath = path.join(__dirname, '../target/idl/contribute.json');
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
    const programId = new PublicKey(PROGRAM_ID);
    const program = anchor.workspace.Contribute as Program;

    // Find the admin registry PDA
    const [adminRegistryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from(ADMIN_REGISTRY_SEED)],
        programId
    );
    console.log("Admin Registry PDA:", adminRegistryPda.toString());

    // Generate a unique pool seed
    const poolSeed = `pool_${Date.now()}`;
    console.log("Creating pool with seed:", poolSeed);

    // Find PDAs
    const [poolPda, poolBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), Buffer.from(poolSeed)],
        programId
    );
    const [authorityPda, authorityBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("authority"), Buffer.from(poolSeed)],
        programId
    );

    // Create a new token mint keypair
    const tokenMintKeypair = Keypair.generate();
    console.log("Token mint created:", tokenMintKeypair.publicKey.toString());

    // Pool configuration
    const config = {
        minContribution: 1_000_000, // 1 USDC (6 decimals)
        maxContribution: 10_000_000, // 10 USDC (6 decimals)
        maxUsdcCap: 10_000_000, // 10 USDC (6 decimals)
        tokenName: "Contribo Token",
        tokenSymbol: "CTB",
        enabled: true,
    };

    try {
        // Create the pool
        const tx = await program.methods
            .createPool(
                poolSeed,
                walletKeypair.publicKey, // usdc_recipient (using admin wallet for testing)
                config.tokenName,
                config.tokenSymbol,
                config.enabled,
                new anchor.BN(config.minContribution),
                new anchor.BN(config.maxContribution),
                new anchor.BN(config.maxUsdcCap),
                new PublicKey(USDC_MINT)
            )
            .accounts({
                admin: walletKeypair.publicKey,
                adminRegistry: adminRegistryPda,
                pool: poolPda,
                tokenMint: tokenMintKeypair.publicKey,
                authority: authorityPda,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
            })
            .signers([tokenMintKeypair])
            .rpc();

        console.log("Pool created successfully!");
        console.log("Transaction:", tx);
        console.log("Pool PDA:", poolPda.toString());
        console.log("Authority PDA:", authorityPda.toString());
        console.log("Token Mint:", tokenMintKeypair.publicKey.toString());

        // Save pool details
        savePoolDetails(poolSeed, poolPda, authorityPda, tokenMintKeypair.publicKey);

    } catch (error) {
        console.error("Error creating pool:", error as any);
        if ((error as any).logs) {
            console.error((error as any).logs);
        }
    }
}

main().catch(console.error); 