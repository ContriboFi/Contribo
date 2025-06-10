import {
    Connection,
    PublicKey,
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    SYSVAR_RENT_PUBKEY,
    TransactionInstruction,
    clusterApiUrl
} from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount,
} from "@solana/spl-token";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Constants
const PROGRAM_ID = "7mHhw5gkkVX59KvbpHCF4fumCRQtTDwEAzWJN5K1q8if";
const USDC_MINT_ADDRESS = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"); // Mainnet/Devnet USDC

// Get pool file path from command line or use default
const poolFilePath = process.argv[2] || path.join(__dirname, '../pools/pool_1747772014170.json');

function loadWalletKeypair(keypairPath: string): Keypair {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync(keypairPath, "utf-8")))
    );
}

function encodeContributeInstruction(poolSeed: string, amount: bigint): Buffer {
    // Discriminator (8 bytes)
    const discriminator = Buffer.from([82, 33, 68, 131, 32, 0, 205, 95]);
    // Anchor string: 4-byte LE length prefix + UTF-8 bytes
    const poolSeedBuf = Buffer.from(poolSeed, 'utf8');
    const poolSeedLen = Buffer.alloc(4);
    poolSeedLen.writeUInt32LE(poolSeedBuf.length, 0);
    // u64 amount (LE)
    const amountBuf = Buffer.alloc(8);
    amountBuf.writeBigUInt64LE(amount, 0);
    return Buffer.concat([discriminator, poolSeedLen, poolSeedBuf, amountBuf]);
}

// Helper to compute Anchor discriminator for an instruction
function getDiscriminator(name: string): Buffer {
    // Anchor discriminator: first 8 bytes of sha256('global:<name>')
    return crypto.createHash('sha256').update('global:' + name).digest().slice(0, 8);
}

// Helper to encode init_user_contribution instruction
function encodeInitUserContributionInstruction(poolSeed: string): Buffer {
    const discriminator = getDiscriminator('init_user_contribution');
    const poolSeedBuf = Buffer.from(poolSeed, 'utf8');
    const poolSeedLen = Buffer.alloc(4);
    poolSeedLen.writeUInt32LE(poolSeedBuf.length, 0);
    return Buffer.concat([discriminator, poolSeedLen, poolSeedBuf]);
}

async function main() {
    // Load wallet
    const walletKeypair = loadWalletKeypair(path.join(__dirname, '../../wallet-keypair.json'));
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Read pool details
    const poolDetails = JSON.parse(fs.readFileSync(poolFilePath, 'utf-8'));
    const poolSeed = poolDetails.poolSeed;
    const tokenMint = new PublicKey(poolDetails.tokenMint);
    const authority = new PublicKey(poolDetails.authorityPda);

    // Derive pool PDA from seed and program ID
    const [pool] = await PublicKey.findProgramAddress(
        [Buffer.from("pool"), Buffer.from(poolSeed, "utf8")],
        new PublicKey(PROGRAM_ID)
    );
    // Debug print: compare derived PDA and JSON PDA
    console.log("Derived pool PDA:", pool.toBase58());
    console.log("JSON pool PDA:", poolDetails.poolPda);

    // Find or create associated token accounts
    const userUsdcAddress = await getAssociatedTokenAddress(
        USDC_MINT_ADDRESS,
        walletKeypair.publicKey
    );
    const userTokenAddress = await getAssociatedTokenAddress(
        tokenMint,
        walletKeypair.publicKey
    );

    // Check and create token accounts if needed
    const transaction = new Transaction();
    try {
        await getAccount(connection, userTokenAddress);
    } catch {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                walletKeypair.publicKey,
                userTokenAddress,
                walletKeypair.publicKey,
                tokenMint
            )
        );
    }
    try {
        await getAccount(connection, userUsdcAddress);
    } catch {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                walletKeypair.publicKey,
                userUsdcAddress,
                walletKeypair.publicKey,
                USDC_MINT_ADDRESS
            )
        );
    }
    if (transaction.instructions.length > 0) {
        await sendAndConfirmTransaction(connection, transaction, [walletKeypair]);
    }

    // Find or create user_contribution PDA
    const [userContributionPda] = await PublicKey.findProgramAddress(
        [
            Buffer.from("user-contribution"),
            pool.toBuffer(),
            walletKeypair.publicKey.toBuffer(),
        ],
        new PublicKey(PROGRAM_ID)
    );
    // Check if user_contribution account exists
    let userContributionInfo = await connection.getAccountInfo(userContributionPda);
    if (!userContributionInfo) {
        console.log("User contribution account not found, initializing...");
        // Build the init_user_contribution instruction
        const ixData = encodeInitUserContributionInstruction(poolSeed);
        const keys = [
            { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: true }, // user
            { pubkey: pool, isSigner: false, isWritable: true }, // pool
            { pubkey: userContributionPda, isSigner: false, isWritable: true }, // user_contribution
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }, // rent
        ];
        const initIx = new TransactionInstruction({
            programId: new PublicKey(PROGRAM_ID),
            keys,
            data: ixData,
        });
        const tx = new Transaction().add(initIx);
        const sig = await sendAndConfirmTransaction(connection, tx, [walletKeypair]);
        console.log("Initialized user contribution account. Tx:", sig);
        // Wait for confirmation
        userContributionInfo = await connection.getAccountInfo(userContributionPda);
        if (!userContributionInfo) {
            throw new Error("User contribution account still not found after initialization!");
        }
    } else {
        console.log("User contribution account already initialized.");
    }

    // Find or create authority PDA
    const [authorityPda] = await PublicKey.findProgramAddress(
        [
            Buffer.from("authority"),
            Buffer.from(poolSeed, 'utf8'),
        ],
        new PublicKey(PROGRAM_ID)
    );
    // You may need to fetch the pool account to get usdc_recipient
    // For now, assume recipient = walletKeypair.publicKey (replace with actual recipient if needed)
    const recipient = walletKeypair.publicKey;
    const recipientUsdcAddress = await getAssociatedTokenAddress(
        USDC_MINT_ADDRESS,
        recipient
    );
    // Amount to contribute (example: 5 USDC = 5_000_000)
    const amount = BigInt(5_000_000);
    // Encode instruction data
    const ixData = encodeContributeInstruction(poolSeed, amount);
    // Build keys array (order matters) for contribute instruction
    const keys = [
        { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: true }, // user
        { pubkey: pool, isSigner: false, isWritable: true }, // pool
        { pubkey: userContributionPda, isSigner: false, isWritable: true }, // user_contribution
        { pubkey: userUsdcAddress, isSigner: false, isWritable: true }, // user_usdc_account
        { pubkey: recipientUsdcAddress, isSigner: false, isWritable: true }, // recipient_usdc_account
        { pubkey: recipient, isSigner: false, isWritable: false }, // recipient
        { pubkey: USDC_MINT_ADDRESS, isSigner: false, isWritable: false }, // usdc_mint
        { pubkey: tokenMint, isSigner: false, isWritable: true }, // token_mint
        { pubkey: userTokenAddress, isSigner: false, isWritable: true }, // user_token_account
        { pubkey: authorityPda, isSigner: false, isWritable: false }, // authority
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // associated_token_program
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }, // rent
    ];
    // Create and send the transaction
    const contributeIx = new TransactionInstruction({
        programId: new PublicKey(PROGRAM_ID),
        keys,
        data: ixData,
    });
    const tx = new Transaction().add(contributeIx);
    const sig = await sendAndConfirmTransaction(connection, tx, [walletKeypair]);
    console.log('Contribute transaction signature:', sig);
}

main().catch(console.error); 