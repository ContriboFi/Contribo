'use client';

import ListHeader from "@/app/myactivity/ListHeader";
import {projectsData} from "@/app/data/ProjectsData";
import ProjectItem from "@/app/myactivity/ProjectItem";
import {useEffect, useState} from "react";
import {Project} from "@/app/type/Project";
import moment from "moment";

export type ProjectsListSectionProps = {
    onClaimClick: (project: Project) => void;
    onWithdrawClick: (project: Project) => void;
    onVoteClick: (project: Project) => void;
}

export default function ProjectsListSection({onClaimClick, onWithdrawClick, onVoteClick}: ProjectsListSectionProps) {
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



    return (
        <div className="flex w-full rounded-md bg-white pr-3 pt-3">
            <div className="flex flex-col w-full rounded-md bg-gray-100">
                <ListHeader orderDirection={orderDirection} orderField={orderField} setOrderField={setOrderField} setOrderDirection={setOrderDirection}/>
                {sortedProjects.map((project, index) => (
                    <ProjectItem key={index} project={project} onClaimClick={onClaimClick} onWithdrawClick={onWithdrawClick} onVoteClick={onVoteClick}/>
                ))}
            </div>
        </div>
    )
}