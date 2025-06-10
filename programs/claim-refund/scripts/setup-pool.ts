import {
    Keypair,
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    SYSVAR_CLOCK_PUBKEY,
    Connection,
    clusterApiUrl,
    Transaction,
    sendAndConfirmTransaction,
    TransactionInstruction,
} from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    createInitializeMintInstruction,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    createMintToInstruction,
    createInitializeAccountInstruction,
    getMinimumBalanceForRentExemptAccount,
    ACCOUNT_SIZE,
    setAuthority,
    AuthorityType,
    createSetAuthorityInstruction,
} from "@solana/spl-token";
import BN from "bn.js";
import * as fs from 'fs';
import * as anchor from "@coral-xyz/anchor";
import * as crypto from "crypto";

// Define the instruction layout
class CreateExchangePoolInstruction {
    pool_seed: string;
    exchange_ratio: BN;
    max_lct_cap: BN;
    enabled: boolean;

    constructor(fields: { pool_seed: string; exchange_ratio: BN; max_lct_cap: BN; enabled: boolean }) {
        this.pool_seed = fields.pool_seed;
        this.exchange_ratio = fields.exchange_ratio;
        this.max_lct_cap = fields.max_lct_cap;
        this.enabled = fields.enabled;
    }
}

// Define the schema for serialization
const createExchangePoolSchema = new Map([
    [
        CreateExchangePoolInstruction,
        {
            kind: 'struct',
            fields: [
                ['pool_seed', 'string'],
                ['exchange_ratio', 'u64'],
                ['max_lct_cap', 'u64'],
                ['enabled', 'u8'],
            ],
        },
    ],
]);

async function main() {
    // Load wallet keypair
    const walletKeypair = Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync('./wallet-keypair.json', 'utf-8')))
    );

    // Initialize connection to devnet
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Constants
    const PROGRAM_ID = new PublicKey("6KmFZ2JqHM15C7zc2mJgw2WVv5abzgbWWgCeBdmneYVU");
    const LCT_MINT = new PublicKey("B1g6rs5bL63sdv54MPqXCuUuhSp8vUhmZx7K3DKSJ4Z8");
    const POOL_SEED = "test-pool-2";
    const EXCHANGE_RATIO = new BN(10); // 10 return tokens for 1 LCT
    const MAX_LCT_CAP = new BN(1000000); // 1 million LCT tokens max
    const RETURN_TOKENS_TO_MINT = 100;

    // Find PDAs
    const [adminRegistryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("admin_registry")],
        PROGRAM_ID
    );

    const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), Buffer.from(POOL_SEED)],
        PROGRAM_ID
    );

    const [poolAuthorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("authority"), Buffer.from(POOL_SEED)],
        PROGRAM_ID
    );

    const [lctRecipientPda, lctRecipientBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("lct_recipient"), Buffer.from(POOL_SEED)],
        PROGRAM_ID
    );

    const [poolReturnPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool_return"), Buffer.from(POOL_SEED)],
        PROGRAM_ID
    );

    // Debug output
    console.log('POOL_SEED:', POOL_SEED);
    console.log('lctRecipientPda:', lctRecipientPda.toBase58());
    console.log('Program ID:', PROGRAM_ID.toBase58());

    // Check if admin registry exists
    const adminRegistryAccount = await connection.getAccountInfo(adminRegistryPda);
    if (!adminRegistryAccount) {
        console.log("Admin registry does not exist. Creating it...");
        const tx = new Transaction().add(
            // Add your initialize admin registry instruction here
            // This would need to be constructed manually based on your program's instruction format
        );
        const signature = await sendAndConfirmTransaction(connection, tx, [walletKeypair]);
        console.log("Admin registry created:", signature);
    } else {
        console.log("Admin registry exists at:", adminRegistryPda.toBase58());
    }

    console.log("Creating return token mint...");
    // Create return token mint
    const returnTokenMint = await createMint(
        connection,
        walletKeypair,
        walletKeypair.publicKey,
        walletKeypair.publicKey,
        9 // 9 decimals
    );
    console.log("Return token mint created:", returnTokenMint.toBase58());

    // Create token accounts at new, unique addresses
    console.log("Creating token accounts...");
    const lctRecipientKeypair = Keypair.generate();
    const poolReturnKeypair = Keypair.generate();
    const rentExempt = await getMinimumBalanceForRentExemptAccount(connection);
    const lctRecipientAccountCreateIx = SystemProgram.createAccount({
        fromPubkey: walletKeypair.publicKey,
        newAccountPubkey: lctRecipientKeypair.publicKey,
        lamports: rentExempt,
        space: ACCOUNT_SIZE,
        programId: TOKEN_PROGRAM_ID,
    });
    const lctRecipientAccountInitIx = createInitializeAccountInstruction(
        lctRecipientKeypair.publicKey,
        LCT_MINT,
        walletKeypair.publicKey,
        TOKEN_PROGRAM_ID
    );
    const poolReturnAccountCreateIx = SystemProgram.createAccount({
        fromPubkey: walletKeypair.publicKey,
        newAccountPubkey: poolReturnKeypair.publicKey,
        lamports: rentExempt,
        space: ACCOUNT_SIZE,
        programId: TOKEN_PROGRAM_ID,
    });
    const poolReturnAccountInitIx = createInitializeAccountInstruction(
        poolReturnKeypair.publicKey,
        returnTokenMint,
        walletKeypair.publicKey,
        TOKEN_PROGRAM_ID
    );

    // Transfer ownership to PDAs
    const lctRecipientTransferIx = createSetAuthorityInstruction(
        lctRecipientKeypair.publicKey,
        walletKeypair.publicKey,
        AuthorityType.AccountOwner,
        poolAuthorityPda
    );
    const poolReturnTransferIx = createSetAuthorityInstruction(
        poolReturnKeypair.publicKey,
        walletKeypair.publicKey,
        AuthorityType.AccountOwner,
        poolAuthorityPda
    );

    console.log("Creating exchange pool...");
    // --- Discriminator calculation ---
    function getIxDiscriminator(ixName: string) {
        return crypto.createHash('sha256').update(`global:${ixName}`).digest().slice(0, 8);
    }
    const discriminator = getIxDiscriminator("create_exchange_pool");

    // Prepare the data buffer
    const poolSeedBuf = Buffer.from(POOL_SEED, 'utf8');
    const poolSeedLen = Buffer.alloc(4);
    poolSeedLen.writeUInt32LE(poolSeedBuf.length, 0);
    const exchangeRatioBuf = Buffer.alloc(8);
    exchangeRatioBuf.writeBigUInt64LE(BigInt(EXCHANGE_RATIO.toString()), 0);
    const maxLctCapBuf = Buffer.alloc(8);
    maxLctCapBuf.writeBigUInt64LE(BigInt(MAX_LCT_CAP.toString()), 0);
    const enabledBuf = Buffer.from([1]); // true

    const data = Buffer.concat([
        discriminator,
        poolSeedLen,
        poolSeedBuf,
        exchangeRatioBuf,
        maxLctCapBuf,
        enabledBuf,
    ]);

    const createPoolIx = new TransactionInstruction({
        keys: [
            { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: true }, // admin
            { pubkey: adminRegistryPda, isSigner: false, isWritable: true }, // admin_registry
            { pubkey: poolPda, isSigner: false, isWritable: true }, // pool
            { pubkey: LCT_MINT, isSigner: false, isWritable: false }, // lct_mint
            { pubkey: returnTokenMint, isSigner: false, isWritable: false }, // return_token_mint
            { pubkey: poolAuthorityPda, isSigner: false, isWritable: false }, // pool_authority
            { pubkey: lctRecipientPda, isSigner: false, isWritable: true }, // lct_recipient_account
            { pubkey: poolReturnPda, isSigner: false, isWritable: true }, // pool_return_token_account
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }, // rent
        ],
        programId: PROGRAM_ID,
        data,
    });

    // Create and send the transaction
    const createPoolTx = new Transaction()
        .add(lctRecipientAccountCreateIx)
        .add(lctRecipientAccountInitIx)
        .add(poolReturnAccountCreateIx)
        .add(poolReturnAccountInitIx)
        .add(lctRecipientTransferIx)
        .add(poolReturnTransferIx)
        .add(createPoolIx);
    const createPoolSignature = await sendAndConfirmTransaction(
        connection,
        createPoolTx,
        [walletKeypair, lctRecipientKeypair, poolReturnKeypair]
    );
    console.log("Exchange pool created:", createPoolSignature);

    console.log("Minting return tokens to pool...");
    // Mint return tokens to pool
    const mintReturnTokensIx = createMintToInstruction(
        returnTokenMint,
        poolReturnPda,
        walletKeypair.publicKey,
        RETURN_TOKENS_TO_MINT * Math.pow(10, 9) // Convert to raw amount with decimals
    );

    // Save all important information to a file
    const outputData = {
        network: "devnet",
        programId: PROGRAM_ID.toBase58(),
        adminRegistry: adminRegistryPda.toBase58(),
        poolSeed: POOL_SEED,
        poolAddress: poolPda.toBase58(),
        returnTokenMint: returnTokenMint.toBase58(),
        poolReturnTokenAccount: poolReturnKeypair.publicKey.toBase58(),
        lctRecipientAccount: lctRecipientKeypair.publicKey.toBase58(),
        poolAuthority: poolAuthorityPda.toBase58(),
        exchangeRatio: EXCHANGE_RATIO.toString(),
        maxLctCap: MAX_LCT_CAP.toString(),
        lctRecipientBump: lctRecipientBump,
        transactions: {
            createPool: createPoolSignature,
            mintTokens: mintReturnTokensIx
        }
    };

    fs.writeFileSync(
        'pool-setup-info.json',
        JSON.stringify(outputData, null, 2)
    );

    console.log("Setup completed successfully!");
    console.log("All information has been saved to pool-setup-info.json");
}

main().then(
    () => process.exit(0),
    (err) => {
        console.error(err);
        process.exit(1);
    }
); 