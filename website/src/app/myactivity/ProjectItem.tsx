'use client';

import {Project} from "@/app/type/Project";
import StageSection from "@/app/myactivity/StageSection";
import ActionButton from "@/app/myactivity/ActionButton";
import ProjectIcon from "@/app/components/ProjectIcon";

export type ProjectItemProps = {
    project: Project;
    onClaimClick: (project: Project) => void;
    onWithdrawClick: (project: Project) => void;
    onVoteClick: (project: Project) => void;
}

export default function ProjectItem({project, onClaimClick, onWithdrawClick, onVoteClick}: ProjectItemProps) {
    return (
        <div className="flex w-full bg-gray-100 p-2">
            <div className="flex flex-row w-full bg-white mt-2 p-2 rounded-md min-h-16 items-center align-baseline">
                <div className="flex w-2/12 font-semibold text-xs" onClick={()=>onWithdrawClick(project)}><ProjectIcon project={project}/>
                    <div className="ml-1 pt-3">{project.title}</div>
                </div>
                <div className="flex w-2/12 font-semibold text-xs"  onClick={()=>onWithdrawClick(project)}>{new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0
                }).format(project.pledge)}</div>
                <div className="flex w-2/12 font-semibold text-xs"><StageSection stage={project.stage}/></div>
                <div className="flex w-2/12 font-semibold text-xs">
                    <ActionButton text={'Withdraw'} onClick={() => {
                        if (project.stage !== 1) {
                            onWithdrawClick(project);
                        }
                    }} state={(project.stage === 1 ? "not active" : "active")}/>
                </div>
                <div className="flex w-1/12 font-semibold text-xs">
                    <ActionButton text={(project.stage === 1 ? "No Vote" : "Vote")} onClick={() => {
                        if (project.stage !== 1) {
                            onVoteClick(project);
                        }
                    }} state={(project.stage === 1 ? "not active" : "active")}/>
                </div>
                <div className="flex w-2/12 font-semibold text-xs">{project.nextClaim}</div>
                <div className="flex w-1/12 font-semibold text-xs">
                    <ActionButton text={'Claim'} onClick={() => {
                        if (project.stage !== 1) {
                            onClaimClick(project);
                        }
                    }} state={(project.stage === 1 ? "not active" : "active")} isClaim={true}/>
                </div>
            </div>
        </div>
    )
}