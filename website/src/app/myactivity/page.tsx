'use client';

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {EnumTabs} from "@/app/type/EnumTabs";
import TotalSection from "@/app/myactivity/TotalSection";
import ProjectsSection from "@/app/myactivity/ProjectsSection";
import ProjectsListSection from "@/app/myactivity/ProjectsListSection";
import styles from "@/styles/modal.module.scss";

import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import React, {useState} from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import {Project} from "@/app/type/Project";
import ClaimSidebar from "@/app/myactivity/sidebar/ClaimSidebar";
import WithdrawSidebar from "@/app/myactivity/sidebar/WithdrawSidebar";
import VoteSidebar from "@/app/myactivity/sidebar/VoteSidebar";

export default function Page() {
    const {publicKey} = useWallet();

    const [allowDemo, setAllowDemo] = React.useState(false);
    const [projectToClaim, setProjectToClaim] = useState<Project | null>(null);
    const [projectToWithdraw, setProjectToWithdraw] = useState<Project | null>(null);
    const [projectToVote, setProjectToVote] = useState<Project | null>(null);

    const onClaimClick = (project: Project) => {
        if(projectToClaim?.title === project.title) {
            setProjectToClaim(null);
        }else {
            setProjectToClaim(project);
            setProjectToWithdraw(null);
            setProjectToVote(null);
        }
    }

    const onWithdrawClick = (project: Project) => {
        if(projectToWithdraw?.title === project.title) {
            setProjectToWithdraw(null);
        }else {
            setProjectToWithdraw(project);
            setProjectToClaim(null);
            setProjectToVote(null);
        }
    }

    const onVoteClick = (project: Project) => {
        if(projectToVote?.title === project.title) {
            setProjectToVote(null);
        }else {
            setProjectToVote(project);
            setProjectToClaim(null);
            setProjectToWithdraw(null);
        }
    }

    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <Header activeTab={EnumTabs.MY_ACTIVITY}/>
            <main className="flex flex-row items-center sm:items-start w-full justify-center relative bg-white h-full p-3">
                <div className={"flex flex-col w-full"}>
                    <div className="flex w-full rounded-md bg-white pr-3">
                        <div className="flex w-full rounded-md bg-gray-100">
                            <TotalSection/>
                            <ProjectsSection/>
                        </div>
                    </div>
                    <div className={"flex w-full"}>
                        <ProjectsListSection onVoteClick={onVoteClick} onClaimClick={onClaimClick} onWithdrawClick={onWithdrawClick}/>
                    </div>
                </div>

                {(projectToClaim || projectToWithdraw || projectToVote) && (
                    <div className="flex w-1/4 rounded-md bg-gray-100 p-2 h-full">
                        {projectToClaim && (<ClaimSidebar project={projectToClaim} onProjectChange={onClaimClick}/>)}
                        {projectToWithdraw && (<WithdrawSidebar project={projectToWithdraw} onProjectChange={onWithdrawClick}/>)}
                        {projectToVote && (<VoteSidebar project={projectToVote}/>)}
                    </div>
                )}

                {!publicKey && !allowDemo && (
                    <div className={`flex flex-col justify-center items-center absolute z-12 w-full h-full top-0 left-0 p-20  ${styles.overlay} backdrop-blur`}>

                        <WalletMultiButton
                            className={` max-w-60`}
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
                                maxWidth: "300px",
                                margin: "0 auto"
                            }}
                        >Connect wallet</WalletMultiButton>
                        <div className={'pt-8 text-[12px]'}>or</div>
                        <div className={`mt-8 p-2 text-[14px] text-orange-500 cursor-pointer border-orange-500 rounded-md border-2`} onClick={()=>setAllowDemo(true)}>See demo without wallet</div>
                    </div>
                )}
            </main>
            <Footer/>
        </div>
    )
}