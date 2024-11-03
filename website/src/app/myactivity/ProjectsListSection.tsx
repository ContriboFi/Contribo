'use client';

import ListHeader from "@/app/myactivity/ListHeader";
import {projectsData} from "@/app/data/ProjectsData";
import ProjectItem from "@/app/myactivity/ProjectItem";
import {useEffect, useState} from "react";
import {Project} from "@/app/type/Project";
import ClaimSidebar from "@/app/myactivity/sidebar/ClaimSidebar";
import WithdrawSidebar from "@/app/myactivity/sidebar/WithdrawSidebar";
import VoteSidebar from "@/app/myactivity/sidebar/VoteSidebar";
import moment from "moment";

export default function ProjectsListSection() {
    const [projectToClaim, setProjectToClaim] = useState<Project | null>(null);
    const [projectToWithdraw, setProjectToWithdraw] = useState<Project | null>(null);
    const [projectToVote, setProjectToVote] = useState<Project | null>(null);
    const [orderField, setOrderField] = useState<string|null>(null);
    const [orderDirection, setOrderDirection] = useState<string|null>(null);
    const [sortedProjects, setSortedProjects] = useState<Project[]>(projectsData);

    useEffect(()=>{
        if(orderField && orderDirection) {
            const sorted = [...projectsData].sort((a, b) => {
                if(orderDirection === 'asc') {
                    if(orderField === 'project') {
                        return a.title.localeCompare(b.title);
                    }
                    if(orderField === 'pledge') {
                        return a.pledge - b.pledge;
                    }
                    if(orderField === 'stage') {
                        return a.stage - b.stage;
                    }
                    if(orderField === 'withdraw') {
                        return a.stage - b.stage;
                    }
                    if(orderField === 'vote') {
                        return a.stage - b.stage;
                    }
                    if(orderField === 'claim') {
                        return a.stage - b.stage;
                    }
                    if(orderField === 'nextClaim') {
                        return moment(a.nextClaim).unix() - moment(b.nextClaim).unix();
                    }
                }else {
                    if(orderField === 'project') {
                        return b.title.localeCompare(a.title);
                    }
                    if(orderField === 'pledge') {
                        return b.pledge - a.pledge;
                    }
                    if(orderField === 'stage') {
                        return b.stage - a.stage;
                    }
                    if(orderField === 'withdraw') {
                        return b.stage - a.stage;
                    }
                    if(orderField === 'vote') {
                        return b.stage - a.stage;
                    }
                    if(orderField === 'claim') {
                        return b.stage - a.stage;
                    }
                    if(orderField === 'nextClaim') {
                        return moment(b.nextClaim).unix() - moment(a.nextClaim).unix();
                    }
                }
                return 0;
            });
            setSortedProjects(sorted);
        }else {
            setSortedProjects(projectsData);
        }
    }, [orderDirection, orderField]);

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
        <div className="flex w-full rounded-md bg-white p-3">
            <div className="flex flex-col w-full rounded-md bg-gray-100">
                <ListHeader orderDirection={orderDirection} orderField={orderField} setOrderField={setOrderField} setOrderDirection={setOrderDirection}/>
                {sortedProjects.map((project, index) => (
                    <ProjectItem key={index} project={project} onClaimClick={onClaimClick} onWithdrawClick={onWithdrawClick} onVoteClick={onVoteClick}/>
                ))}
            </div>
            {(projectToClaim || projectToWithdraw || projectToVote) && (
                <div className="flex w-1/5 row-span-2 rounded-md bg-gray-100 ml-2 p-2">
                    {projectToClaim && (<ClaimSidebar project={projectToClaim} onProjectChange={onClaimClick}/>)}
                    {projectToWithdraw && (<WithdrawSidebar project={projectToWithdraw} onProjectChange={onWithdrawClick}/>)}
                    {projectToVote && (<VoteSidebar project={projectToVote}/>)}
                </div>
            )}
        </div>
    )
}