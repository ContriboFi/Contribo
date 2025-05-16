// contribution.ts
// React‑friendly helper for the on‑chain “contribute” program that plugs straight
// into **@solana/wallet‑adapter‑react**. No manual Keypair handling—just call it
// from a component where `useWallet()` and `useConnection()` are available.
//
// Workflow
// ────────────────────────────────────────────────────────────────────────────────
//   1. Derive the user‑pool PDA with `PublicKey.findProgramAddressSync`.
//   2. `getAccountInfo` to see if the PDA already exists.
//   3. If **not** → append `init_user_contribution` *then* `contribute`.
//      If **yes** → append only `contribute`.
//   4. Build a `Transaction`, sign with the connected wallet, and send.
//
// Example (inside a React component):
// -----------------------------------------------------------------------------
// const { connection } = useConnection();
// const wallet = useWallet();
//
// const onContribute = async () => {
//   const sig = await contribute({
//     connection,
//     wallet,
//     poolSeed: "pool_1746713542066",
//     amountLamports: 100_000_000, // 0.1 SOL
//   });
//   console.log("✅ contribution tx:", sig);
// };
// -----------------------------------------------------------------------------

import {
    Connection,
    PublicKey,
    SystemProgram, SYSVAR_RENT_PUBKEY,
    Transaction,
} from "@solana/web3.js";
import {AnchorProvider, Program, BN, utils, Idl} from "@project-serum/anchor";
import idl from "../data/idl/contribute.json"; // ← your generated IDL
import { WalletContextState } from "@solana/wallet-adapter-react";
import {activePoolData} from "@/app/data/pool/ActivePool";
import {ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID} from "@solana/spl-token";

// ────────────────────────────────────────────────────────────────────────────────
// Configuration (replace placeholders!)
// ────────────────────────────────────────────────────────────────────────────────
export const PROGRAM_ID = new PublicKey(
    "7mHhw5gkkVX59KvbpHCF4fumCRQtTDwEAzWJN5K1q8if" // TODO: real program ID
);
const POOL_SEED_PREFIX = "pool" as const;
const PDA_SEED_NAMESPACE = "user_contribution"; // TODO: confirm with program
const AUTHORITY_PREFIX = "authority" as const;


export const USDC_MINT_ADDRESS = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr";

// ────────────────────────────────────────────────────────────────────────────────
// Types & helpers
// ────────────────────────────────────────────────────────────────────────────────
interface ContributeParams {
    connection: Connection;
    wallet: WalletContextState;
    poolSeed: string;
    amountLamports: number;
}

export function findContributionPda(
    user: PublicKey,
    poolSeed: string
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            utils.bytes.utf8.encode(PDA_SEED_NAMESPACE),
            user.toBuffer(),
            utils.bytes.utf8.encode(poolSeed),
        ],
        PROGRAM_ID
    );
}

export async function checkIfAccountIsActive(
    connection: Connection,
    address: PublicKey
): Promise<boolean> {
    const info = await connection.getAccountInfo(address);
    return info !== null;
}

export function findPoolPda(poolSeed: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([
        utils.bytes.utf8.encode(POOL_SEED_PREFIX),
        utils.bytes.utf8.encode(poolSeed),
    ], PROGRAM_ID);
}

export function findAuthorityPda(poolSeed: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([
        utils.bytes.utf8.encode(AUTHORITY_PREFIX),
        utils.bytes.utf8.encode(poolSeed),
    ], PROGRAM_ID);
}

function pickMethod<T extends Record<string, any>>(obj: T, candidates: string[]): any {
    for (const c of candidates) {
        if (c in obj) return (obj as any)[c];
    }
    throw new Error(
        `Instruction not found. Tried: ${candidates.join(", ")}. Check your IDL.`
    );
}

// ────────────────────────────────────────────────────────────────────────────────
// Main helper
// ────────────────────────────────────────────────────────────────────────────────
export async function contribute({
                                     connection,
                                     wallet,
                                     poolSeed,
                                     amountLamports,
                                 }: ContributeParams): Promise<string> {

    console.log({
        connection,
        wallet,
        poolSeed,
        amountLamports
    });

    if (!wallet.publicKey) throw new Error("Wallet not connected");
    if (!wallet.signTransaction) throw new Error("Wallet cannot sign transactions");

    // Anchor provider bridged to wallet‑adapter
    const provider = new AnchorProvider(connection, wallet as any, {
        preflightCommitment: "confirmed",
    });
    const program = new Program(idl as Idl, PROGRAM_ID, provider);

    // Derive PDA & check status
    const [pda] = findContributionPda(wallet.publicKey, poolSeed);
    const isActive = await checkIfAccountIsActive(connection, pda);

    // Build instruction list
    const ix = [] as import("@solana/web3.js").TransactionInstruction[];

    const [poolPda]              = findPoolPda(poolSeed);
    const [authorityPda]         = findAuthorityPda(poolSeed);
    const poolAccount = await program.account.pool.fetch(poolPda);
    const tokenMint: PublicKey = poolAccount.tokenMint as PublicKey;
    const usdcMint = new PublicKey(USDC_MINT_ADDRESS); //new
    const usdcRecipient: PublicKey = poolAccount.usdcRecipient as PublicKey;



    const userUsdcAta  = await getAssociatedTokenAddress(usdcMint,  wallet.publicKey);
    const recipientUsdcAta = await getAssociatedTokenAddress(usdcMint, usdcRecipient, true);
    const userTokenAta = await getAssociatedTokenAddress(tokenMint, wallet.publicKey);



    if (!isActive) {

        const initBuilder = pickMethod(program.methods, [
            "initUserContribution",
            "init_user_contribution",
            "initializeUserContribution",
        ]);

        ix.push(
            await initBuilder(poolSeed)
                .accounts({
                    user: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                    pool: activePoolData.poolPda,
                    userContribution: pda,
                })
                .instruction()
        );
    }

    console.log('contribute params: ', {
        user: wallet.publicKey,
        userContribution: pda,
        systemProgram: SystemProgram.programId,
        pool: activePoolData.poolPda,
        userUsdcAccount: userUsdcAta,

        // user: wallet.publicKey,
        // pool: activePoolData.poolPda,
        // userContribution: pda,
        // userUsdcAccount: userUsdcAta,
        recipientUsdcAccount: recipientUsdcAta,
        recipient: usdcRecipient,
        usdcMint,
        tokenMint,
        userTokenAccount: userTokenAta,
        authority: authorityPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
    });

    console.log("User:", wallet.publicKey.toBase58());
    console.log("Pool:", activePoolData.poolPda);
    console.log("User Contribution:", pda.toBase58());
    console.log("User USDC Account:", userUsdcAta.toBase58());
    console.log("Recipient USDC Account:", recipientUsdcAta.toBase58());
    console.log("USDC Mint:", usdcMint.toBase58());
    console.log("Token Mint:", tokenMint.toBase58());
    console.log("User Token Account:", userTokenAta.toBase58());
    console.log("Authority:", authorityPda.toBase58());
    console.log("Contributing amount:", amountLamports.toString());

    ix.push(
        await program.methods
            .contribute(poolSeed, new BN(amountLamports))
            .accounts({
                user: wallet.publicKey,
                userContribution: pda,
                systemProgram: SystemProgram.programId,
                pool: activePoolData.poolPda,
                userUsdcAccount: userUsdcAta,
                recipientUsdcAccount: recipientUsdcAta,
                recipient: usdcRecipient,
                usdcMint,
                tokenMint,
                userTokenAccount: userTokenAta,
                authority: authorityPda,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
            })
            .instruction()
    );

    // Compose, sign & send
    const tx = new Transaction();
    tx.feePayer = wallet.publicKey;
    tx.add(...ix);
    tx.recentBlockhash = (
        await connection.getLatestBlockhash("confirmed")
    ).blockhash;

    const signed = await wallet.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
    });

    // Optionally wait for confirmation
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
}
