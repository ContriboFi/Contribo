import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider } from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';

// Load the wallet from wallet-keypair.json
const walletKeypairPath = path.join(__dirname, '..', 'wallet-keypair.json');
const walletKeypairData = JSON.parse(fs.readFileSync(walletKeypairPath, 'utf8'));
const walletKeypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(walletKeypairData));

// Set up the connection and provider
const connection = new anchor.web3.Connection('https://api.devnet.solana.com', 'confirmed');
const provider = new AnchorProvider(connection, new anchor.Wallet(walletKeypair), { commitment: 'confirmed' });
anchor.setProvider(provider);

// Get the program from the workspace
const program = anchor.workspace.contribute as any;

async function main() {
    // Example pool seed (replace with your actual pool seed)
    const poolSeed = 'pool_1747772014170';

    // Derive the pool PDA
    const [poolPda] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from('pool'),
            Buffer.from(poolSeed, 'utf8'),
        ],
        program.programId
    );

    // Derive the user contribution PDA
    const [userContributionPda] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from('user-contribution'),
            poolPda.toBuffer(),
            walletKeypair.publicKey.toBuffer(),
        ],
        program.programId
    );

    try {
        // Call the get_remaining_contribution method
        const remainingContribution = await program.methods
            .getRemainingContribution(poolSeed)
            .accounts({
                user: walletKeypair.publicKey,
                pool: poolPda,
                userContribution: userContributionPda,
            })
            .view();

        console.log('Remaining contribution:', remainingContribution.toString());
    } catch (error) {
        console.error('Error calling getRemainingContribution:', error);
    }
}

main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
}); 