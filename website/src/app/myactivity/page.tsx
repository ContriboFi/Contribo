'use client';

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {EnumTabs} from "@/app/type/EnumTabs";
import TotalSection from "@/app/myactivity/TotalSection";
import ProjectsSection from "@/app/myactivity/ProjectsSection";
import ProjectsListSection from "@/app/myactivity/ProjectsListSection";
import styles from "@/styles/modal.module.scss";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import React from "react";
import {useWallet} from "@solana/wallet-adapter-react";

export default function Page() {
    const {publicKey} = useWallet();

    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <Header activeTab={EnumTabs.MY_ACTIVITY}/>
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full justify-center relative">
                <div className="flex w-full rounded-md bg-white p-3">
                    <div className="flex w-full rounded-md bg-gray-100">
                        <TotalSection/>
                        <ProjectsSection/>
                    </div>
                </div>
                <ProjectsListSection/>
                {!publicKey && (
                    <div className={`flex justify-center items-center absolute z-12 w-full h-full top-0 left-0 p-20 ${styles.overlay} backdrop-blur`}>

                        <WalletMultiButton
                            style={{
                                borderRadius: "5px",
                                background: "#FEA31B",
                                height: "38px",
                                color: "#FFF",
                                fontFamily: "Inter, serif",
                                fontSize: "12px",
                                fontStyle: "normal",
                                fontWeight: 600,
                                lineHeight: "38px",
                                textAlign: "center",
                                cursor: "pointer",
                            }}
                        />
                    </div>
                )}
            </main>
            <Footer/>
        </div>
    )
}