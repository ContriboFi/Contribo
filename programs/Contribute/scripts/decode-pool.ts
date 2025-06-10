import { Connection, PublicKey } from "@solana/web3.js";
import * as Layout from "@solana/buffer-layout";

// Define the layout for the Pool account
const POOL_LAYOUT = Layout.struct([
    Layout.blob(32, "admin"),
    Layout.blob(32, "usdc_recipient"),
    Layout.blob(8, "current_cap"),
    Layout.blob(8, "max_cap"),
    Layout.blob(8, "min_contribution"),
    Layout.blob(8, "max_contribution"),
    Layout.blob(32, "pool_seed"),
    Layout.blob(32, "token_mint"),
    Layout.blob(32, "authority"),
]) as Layout.Layout<{
    admin: Uint8Array;
    usdc_recipient: Uint8Array;
    current_cap: Uint8Array;
    max_cap: Uint8Array;
    min_contribution: Uint8Array;
    max_contribution: Uint8Array;
    pool_seed: Uint8Array;
    token_mint: Uint8Array;
    authority: Uint8Array;
}>;

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const poolAddress = new PublicKey("6eUZLDQw5V3vifFwg3AbwwQCsszL3uqBkP3t75xU8Kmg");

    try {
        const accountInfo = await connection.getAccountInfo(poolAddress);
        if (!accountInfo) {
            console.log("Account not found");
            return;
        }

        // Skip the 8-byte discriminator
        const data = accountInfo.data.slice(8);

        // Deserialize the account data
        const pool = POOL_LAYOUT.decode(data);

        console.log("Pool Account Data:");
        console.log("Admin:", new PublicKey(pool.admin).toBase58());
        console.log("USDC Recipient:", new PublicKey(pool.usdc_recipient).toBase58());
        console.log("Current Cap:", Buffer.from(pool.current_cap).readBigUInt64LE(0).toString());
        console.log("Max Cap:", Buffer.from(pool.max_cap).readBigUInt64LE(0).toString());
        console.log("Min Contribution:", Buffer.from(pool.min_contribution).readBigUInt64LE(0).toString());
        console.log("Max Contribution:", Buffer.from(pool.max_contribution).readBigUInt64LE(0).toString());
        console.log("Pool Seed:", Buffer.from(pool.pool_seed).toString('utf8').replace(/\0/g, ''));
        console.log("Token Mint:", new PublicKey(pool.token_mint).toBase58());
        console.log("Authority:", new PublicKey(pool.authority).toBase58());
    } catch (error) {
        console.error("Error decoding account:", error);
    }
}

main().catch(console.error); 