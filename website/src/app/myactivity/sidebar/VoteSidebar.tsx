import {Project} from "@/app/type/Project";
import styles from "@/styles/project.module.scss";
import React from "react";
import NextClaimSection from "@/app/myactivity/sidebar/NextClaimSection";
import VoteBar from "@/app/myactivity/sidebar/VoteBar";

export type VoteSidebarProps = {
    project: Project;
}

export default function VoteSidebar({project}: VoteSidebarProps) {
    return (
        <div className="flex w-full flex-col items-center">
            <div className="pt-5 font-semibold text-xl pb-5">
                Status
            </div>
            <div className="flex  w-full bg-white rounded-xl p-1 flex-row align-middle h-6">
                <div className="flex pr-1.5 pt-1 pl-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
                        <circle cx="3" cy="3" r="3" fill="#56C07F"/>
                    </svg>
                </div>
                <div className="flex text-[10px] text-[#56C07F]">
                    Active
                </div>
            </div>
            <div className="flex w-full pt-5">
                <NextClaimSection claimDate={project.nextClaim} label={'ends'}/>
            </div>
            <div className="flex w-full pt-5 text-[12px] font-normal">
                DAO voting to remove the current developer from Step3 for a change.
            </div>
            <div className="flex w-full pt-5">
                <VoteBar left={project.voteYes} right={project.voteNo}/>
            </div>
            <div className="flex w-full pt-5">
                <div className={`${styles.pledgeButton} w-1/2 mr-2`}>Yes</div>
                <div className={`${styles.pledgeButtonBlank} w-1/2`}>No</div>
            </div>
        </div>
    )
}