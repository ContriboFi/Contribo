import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

// Get wallet public key from command line argument
const walletPubkeyArg = process.argv[2];
if (!walletPubkeyArg) {
    console.error('Please provide a wallet public key as an argument');
    console.error('Usage: ts-node scripts/checkWalletContribution.ts <wallet-public-key>');
    process.exit(1);
}

// Load the wallet from wallet-keypair.json (for provider)
const walletKeypairPath = path.join(__dirname, '..', 'wallet-keypair.json');
const walletKeypairData = JSON.parse(fs.readFileSync(walletKeypairPath, 'utf8'));
const walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletKeypairData));

// Set up the connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Program ID
const PROGRAM_ID = new PublicKey('7mHhw5gkkVX59KvbpHCF4fumCRQtTDwEAzWJN5K1q8if');

async function main() {
    try {
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

        // Get the account info to read the remaining contribution
        const accountInfo = await connection.getAccountInfo(userContributionPda);
        if (!accountInfo) {
            console.log('No contribution found for this wallet');
            return;
        }

        // The remaining contribution is stored in the account data
        // Format: [discriminator(8) | user(32) | pool(32) | amount(8)]
        const amountBuffer = accountInfo.data.slice(72, 80);
        const remainingContribution = amountBuffer.readBigUInt64LE(0);

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