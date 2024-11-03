'use client';

import {useState} from "react";
import {projectsData} from "@/app/data/ProjectsData";
import {Project} from "@/app/type/Project";

export type ProjectSelectorProps = {
    onProjectClick: (project: Project) => void;
}

export default function ProjectSelector({onProjectClick}: ProjectSelectorProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    return (
        <div className="flex w-full relative">
            <div className="flex flex-row w-full">
                <div className="text-[12px]">Select&nbsp;project</div>
                <div className="text-right w-full text-[12px] text-orange-400 cursor-pointer"
                     onClick={() => setShowDropdown(!showDropdown)}>change project &gt;</div>
            </div>
            {showDropdown && <div className="absolute right-0 mt-4 rounded-md bg-gray-100 p-2">
                {projectsData.filter((project) => project.stage > 1).map((project, index) => (
                    <div key={index} className="p-1 cursor-pointer hover:bg-gray-200"
                         onClick={() => onProjectClick(project)}>{project.title}</div>
                ))}
            </div>}
        </div>
    )
}