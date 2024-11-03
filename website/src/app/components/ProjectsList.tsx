import Project from "@/app/components/Project";
import {projectsData} from "@/app/data/ProjectsData";

export default function ProjectsList() {
    return (
        <div className="flex flex-row gap-8 w-full justify-center">
            {projectsData.map((project, index) => (
                <Project key={index} title={project.title} description={project.description} image={project.image}
                         total={project.total} collected={project.collected} deadline={project.deadline}
                         imageBackground={project.imageBackground}/>
            ))}
        </div>
    )
}