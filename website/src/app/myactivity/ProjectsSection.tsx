import {projectsData} from "@/app/data/ProjectsData";
import Image from "next/image";

export default function ProjectsSection() {
    return (
        <div className="flex flex-col w-40 p-3 rounded-md bg-gray-100">
            <div className="w-full font-normal text-sm">Projects</div>
            <div className="w-full flex flex-row pt-1.5">
                {projectsData.map((project, index) => (
                    <Image src={project.image} alt={project.title} key={index} width={40} height={40} className="flex rounded-3xl mr-1.5"/>
                ))}
            </div>
        </div>
    )
}