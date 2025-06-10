import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

interface GetContributionParams {
    connection: Connection;
    wallet: { publicKey: PublicKey | null };
    poolSeed: string;
}

// Load IDL from file
const idlPath = path.join(__dirname, '..', 'target', 'idl', 'contribute.json');
const fixedIdl = JSON.parse(fs.readFileSync(idlPath, 'utf8')) as Idl;

function findPoolPda(poolSeed: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('pool'), Buffer.from(poolSeed, 'utf8')],
        new PublicKey(fixedIdl.address)
    );
}

function findContributionPda(user: PublicKey, poolPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('user-contribution'), poolPda.toBuffer(), user.toBuffer()],
        new PublicKey(fixedIdl.address)
    );
}

export async function getContribution({
    connection,
    wallet,
    poolSeed,
}: GetContributionParams): Promise<number> {
    if (!wallet.publicKey) throw new Error("Wallet not connected");

    const provider = new AnchorProvider(connection, wallet as any, {
        preflightCommitment: "confirmed",
    });
    const program = new Program(fixedIdl, provider);
    const [poolPda] = findPoolPda(poolSeed);
    const [pda] = findContributionPda(wallet.publicKey, poolPda);

    // @ts-ignore - The account type is defined in the IDL
    const poolAccount = await program.account.pool.fetch(poolPda);
    const maxUsdcCap: BN = poolAccount?.maxUsdcCap ?? new BN(0);

    const remaining = await program.methods
        .getRemainingContribution(poolSeed)
        .accounts({
            user: provider.wallet.publicKey,
            pool: poolPda,
            userContribution: pda,
        })
        .view();

    return (maxUsdcCap.sub(remaining)).toNumber() / 1_000_000;
}

// Main function to run the script
async function main() {
    // Get wallet public key from command line argument
    const walletPubkeyArg = process.argv[2];
    if (!walletPubkeyArg) {
        console.error('Please provide a wallet public key as an argument');
        console.error('Usage: ts-node scripts/checkWalletContributionDirect.ts <wallet-public-key>');
        process.exit(1);
    }

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const wallet = { publicKey: new PublicKey(walletPubkeyArg) };
    const poolSeed = 'pool_1747772014170'; // Using the same pool seed as before

    try {
        const contribution = await getContribution({
            connection,
            wallet,
            poolSeed
        });
        console.log('Contribution amount:', contribution);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});