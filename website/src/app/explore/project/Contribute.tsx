'use client';

import React, {useEffect, useState} from "react";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import { PublicKey} from "@solana/web3.js";
import * as token from "@solana/spl-token";
import {activePoolData} from "@/app/data/pool/ActivePool";
import {contribute} from "@/app/helpers/contribute";

//
// export async function checkIfAccountIsActive(
//     connection: Connection,
//     address: PublicKey
// ): Promise<boolean> {
//     const info = await connection.getAccountInfo(address);
//     console.log({info});
//     return info !== null;
// }
//
// export function findContributionPda(
//     user: PublicKey,
//     poolSeed: string
// ): [PublicKey, number] {
//     return PublicKey.findProgramAddressSync(
//         [
//             utils.bytes.utf8.encode(PDA_SEED_NAMESPACE),
//             user.toBuffer(),
//             utils.bytes.utf8.encode(poolSeed),
//         ],
//         PROGRAM_ID
//     );
// }

export const USDC_MINT_ADDRESS = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr";


export default function Contribute(){
    const { connection } = useConnection();
    const wallet = useWallet();
    const {publicKey} = wallet;

    const [usdcBalance, setUSDCBalance] = useState<number>(0);

    const getBalance = async()=>{
        if(publicKey) {
            const usdcMint = new PublicKey(USDC_MINT_ADDRESS); //new
            const usdcAddress = await token.getAssociatedTokenAddress(usdcMint, publicKey); //new
            try {
                const usdcDetails = await token.getAccount(connection, usdcAddress); //new
                const usdcDecimals = 6; //new
                const usdcBalance = Number(usdcDetails.amount) / Math.pow(10, usdcDecimals); //new
                return usdcBalance; //new
            } catch {
                console.log("USDC Account doesn't exist for the given address"); //new
            }
            return 0;
        }
    }

    useEffect(() => {
        if (publicKey) {
            (async()=>{
                const bal = await getBalance();
                setUSDCBalance(bal??0);
            })()
        }
    }, [publicKey, connection, getBalance, setUSDCBalance])

    //

    const onContribute = async () => {
      const sig = await contribute({
        connection,
        wallet,
        poolSeed: activePoolData.poolSeed,
        amountLamports: 100_000_000, // 0.1 SOL
      });
      console.log("✅ contribution tx:", sig);
    };

    return (
        <div className={`bg-bgSecondary border border-outline rounded-xl p-4 mb-10`}>
            <h3 className={`sidebar-title mb-2`}>Contribution</h3>
            <p className={`price mb-2`}>$0</p>
            <p className={`currency`}>US Dollars</p>
            <hr className={`my-4 -mx-4`}/>
            <h3 className={`sidebar-title mb-4 flex justify-between`}>
                {publicKey && (<>
                <span>Deposit</span>
                <small>Balance: {usdcBalance} USDC</small>
                </>)}
            </h3>
            <div className={`currency-dropdown relative mb-4`}>
                <button type={`button`} id="depositField"
                        className={`btn btn-secondary w-full flex justify-between items-center`}
                        aria-expanded="false" aria-haspopup="true">
                    <span>10</span>
                    <span className={`flex items-center gap-[10px]`}>
                                                <img src="/images/usdc.png" width={24} alt=""/>
                                                <img src="/images/chevron-down.svg" width={10} alt=""/>
                                            </span>
                </button>
                <ul className={`dropdown-menu w-48`} role="menu" aria-orientation="vertical"
                    aria-labelledby="depositField" tabIndex={-1}>
                    <li className={`active bg-bgSecondary rounded-lg`}><a href="#"
                                                                          className={`items-center gap-2`}><img
                        src="/images/usdc.png" width={24} alt=""/>USDC</a>
                    </li>
                    <li><a href="#" className={`px-1 py-3 flex items-center gap-2`}><img
                        src="/images/usdt.png" width={24} alt=""/>USDT</a></li>
                </ul>
            </div>
            {!publicKey &&(<WalletMultiButton
                className={` btn btn-primary w-full`}
                style={{
                    background: "var(--color-highlight-gradient)",
                    boxShadow: "0 1px 4px 0 rgba(230, 108, 36, 0.2)",
                    border: "1px solid rgba(0, 0, 0, 0.04)",
                    color: "#fff",
                    fontWeight: "500",
                    lineHeight: "1",
                    letterSpacing: "-0.13px",
                    textAlign: "center",
                    padding: "10px 12px 9px",
                    borderRadius: "8px",
                    whiteSpace: "nowrap",
                    transition: "all 0.25s ease-in-out",
                    fontSize: "0.9375rem",
                    display: "inline-flex",
                    cursor: "pointer"
                }}
            />)}
            {publicKey && (<input type="submit" className={`btn btn-primary w-full`} value={`Contribute`} onClick={()=>onContribute()}/>)}
        </div>
    )
}