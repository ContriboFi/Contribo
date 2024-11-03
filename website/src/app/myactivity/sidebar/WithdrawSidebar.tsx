import {Project} from "@/app/type/Project";
import ProjectIcon from "@/app/components/ProjectIcon";
import AmountInput from "@/app/components/AmountInput";
import styles from "@/styles/project.module.scss";
import React from "react";
import ProjectSelector from "@/app/myactivity/sidebar/ProjectSelector";

export type WithdrawSidebarProps = {
    project: Project;
    onProjectChange: (project: Project) => void;
}

export default function WithdrawSidebar({project, onProjectChange}: WithdrawSidebarProps) {
    return (
        <div className="flex w-full flex-col items-center">
            <div className="pt-5 font-semibold text-xl pb-5">
                Withdraw
            </div>
            <div className="flex w-full flex-row align-middle pb-5">
                <ProjectSelector onProjectClick={onProjectChange}/>
            </div>
            <div className="flex  w-full bg-white rounded-md p-3 flex-row align-middle">
                <ProjectIcon project={project}/>
                <div className="flex align-middle pt-2">{project.title}</div>
            </div>
            <div className="flex flex-col w-full pt-5">
                <div className="text-right w-full text-[11px] text-orange-400 underline cursor-pointer pb-2">{project.withdrawCount} USDC</div>
                <AmountInput/>
            </div>
            <div className="flex w-full pt-5">
                <div className={`${styles.pledgeButton} w-full`}>Cancel pledge</div>
            </div>
        </div>
    )
}