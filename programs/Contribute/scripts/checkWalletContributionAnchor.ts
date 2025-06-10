import { Program, AnchorProvider, web3, Wallet, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

// Get wallet public key from command line argument
const walletPubkeyArg = process.argv[2];
if (!walletPubkeyArg) {
    console.error('Please provide a wallet public key as an argument');
    console.error('Usage: ts-node scripts/checkWalletContributionAnchor.ts <wallet-public-key>');
    process.exit(1);
}

// Load the wallet from wallet-keypair.json (for provider)
const walletKeypairPath = path.join(__dirname, '..', 'wallet-keypair.json');
const walletKeypairData = JSON.parse(fs.readFileSync(walletKeypairPath, 'utf8'));
const walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletKeypairData));

// Set up the connection and provider
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const wallet = new Wallet(walletKeypair);
const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });

// Program ID
const PROGRAM_ID = new PublicKey('7mHhw5gkkVX59KvbpHCF4fumCRQtTDwEAzWJN5K1q8if');

// Load IDL from file
const idlPath = path.join(__dirname, '..', 'target', 'idl', 'contribute.json');
const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8')) as Idl;

async function main() {
    try {
        // Create program instance
        const program = await Program.at(PROGRAM_ID, provider);

        // Parse the provided wallet public key
        const targetWalletPubkey = new PublicKey(walletPubkeyArg);
        console.log('Checking remaining contribution for wallet:', targetWalletPubkey.toString());

        // Example pool seed (replace with your actual pool seed)
        const poolSeed = 'pool_1747772014170';

        // Derive the pool PDA
        const [poolPda] = await PublicKey.findProgramAddress(
            [
                Buffer.from('pool'),
                Buffer.from(poolSeed, 'utf8'),
            ],
            PROGRAM_ID
        );

        // Derive the user contribution PDA for the target wallet
        const [userContributionPda] = await PublicKey.findProgramAddress(
            [
                Buffer.from('user-contribution'),
                poolPda.toBuffer(),
                targetWalletPubkey.toBuffer(),
            ],
            PROGRAM_ID
        );

        // Call the get_remaining_contribution method
        const remainingContribution = await program.methods
            .getRemainingContribution(poolSeed)
            .accounts({
                user: targetWalletPubkey,
                pool: poolPda,
                userContribution: userContributionPda,
            })
            .view();

        console.log('Remaining contribution:', remainingContribution.toString());
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
}); 