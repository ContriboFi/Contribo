import Image from "next/image";
import {Project} from "@/app/type/Project";

export type ProjectIconProps = {
    project: Project;
}

export default function ProjectIcon({project}: ProjectIconProps) {
    return (<Image src={project.image} alt={project.title} width={40} height={40} className="flex rounded-3xl mr-1.5"/>);
}