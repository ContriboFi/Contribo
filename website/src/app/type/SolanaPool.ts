/* =============================================================================
 * getPoolInfoAnchor.ts • Fetch a pool account using the Anchor framework
 * -----------------------------------------------------------------------------
 *  • Requires @project-serum/anchor ≥0.28 (the canonical Solana Anchor SDK).
 *  • Eliminates manual Borsh schemas—Anchor decodes accounts via the IDL.
 *  • Returns a developer‑friendly `PoolInfo` object with BN and PublicKey
 *    instances intact.
 *
 *  USAGE EXAMPLE -------------------------------------------------------------
 *    import { Connection, PublicKey } from '@solana/web3.js';
 *    import idl from '@/idl/pool.json';               // compiled IDL
 *    import { getPoolInfo } from '@/lib/getPoolInfoAnchor';
 *
 *    const programId = new PublicKey(idl.metadata.address);
 *    const poolPda   = new PublicKey('HjzFbWmHLy5zniKmRVRtKN1DPp6z21VpcEyJ2YD8wa7Y');
 *
 *    const info = await getPoolInfo({
 *      poolAddress: poolPda,
 *      programId,
 *      idl,
 *      connection: new Connection('https://api.devnet.solana.com'),
 *    });
 *    console.log(info.tokenName, info.currentCap.toString());
 * ---------------------------------------------------------------------------*/

import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, Idl, BN } from '@project-serum/anchor';

export interface PoolInfo {
    admin: PublicKey;
    usdcRecipient: PublicKey;
    currentCap: BN;
    enabled: boolean;
    tokenMint: PublicKey;
    tokenName: string;
    tokenSymbol: string;
    poolSeed: string;
    authority: PublicKey;
    authorityBump: number;
    usdcMint: PublicKey;
    minContribution: BN;
    maxContribution: BN;
    maxUsdcCap: BN;
    maxTokenSupply: BN;
    totalTokensMinted: BN;
    totalContributors: BN;
}

interface GetPoolInfoParams<T extends Idl> {
    poolAddress: string | PublicKey;
    programId: PublicKey;
    idl: T;
    connection?: Connection;
    provider?: AnchorProvider; // optional custom provider (overrides connection)
}

export async function getPoolInfo<T extends Idl>({
                                                     poolAddress,
                                                     programId,
                                                     idl,
                                                     connection = new Connection('https://api.devnet.solana.com'),
                                                     provider,
                                                 }: GetPoolInfoParams<T>): Promise<PoolInfo> {
    const pubkey = typeof poolAddress === 'string' ? new PublicKey(poolAddress) : poolAddress;

    // 1. Create (or reuse) an Anchor provider
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const _provider = provider ?? new AnchorProvider(connection, AnchorProvider.defaultOptions().wallet, {
        commitment: 'confirmed',
    });

    // 2. Instantiate the program from IDL
    const program = new Program<T>(idl, programId, _provider);

    // 3. Fetch and decode the account (Anchor handles Borsh under the hood)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const raw = await program.account.pool.fetch(pubkey);

    return {
        admin: raw.admin as PublicKey,
        usdcRecipient: raw.usdcRecipient as PublicKey,
        currentCap: raw.currentCap as BN,
        enabled: raw.enabled as boolean,
        tokenMint: raw.tokenMint as PublicKey,
        tokenName: raw.tokenName as string,
        tokenSymbol: raw.tokenSymbol as string,
        poolSeed: raw.poolSeed as string,
        authority: raw.authority as PublicKey,
        authorityBump: raw.authorityBump as number,
        usdcMint: raw.usdcMint as PublicKey,
        minContribution: raw.minContribution as BN,
        maxContribution: raw.maxContribution as BN,
        maxUsdcCap: raw.maxUsdcCap as BN,
        maxTokenSupply: raw.maxTokenSupply as BN,
        totalTokensMinted: raw.totalTokensMinted as BN,
        totalContributors: raw.totalContributors as BN,
    };
}
