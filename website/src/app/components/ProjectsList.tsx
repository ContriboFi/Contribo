import Project from "@/app/components/Project";

export default function ProjectsList() {
    return (
        <div className="flex flex-row gap-8 w-full justify-center">
            <Project title={'Jupiter'} description={'ololo'} image={'/images/jupiter-logo.png'} total={20000}
                     collected={16500} deadline={'2024-11-18 11:00 -4'} imageBackground={'#111727'}/>
            <Project title={'Jito'} description={'ololo'} image={'/images/jito-logo.png'} total={32000}
                     collected={32000} deadline={'2024-12-18 12:00 -4'} imageBackground={'#FFFFFF'}/>
            <Project title={'Tensor'} description={'ololo'} image={'/images/tensor-logo.png'} total={18000}
                     collected={15500} deadline={'2024-11-30 13:00 -4'} imageBackground={'#F0F2F4'}/>
            <Project title={'Kamino'} description={'ololo'} image={'/images/kamino-logo.png'} total={20000}
                     collected={17500} deadline={'2024-10-18 14:00 -4'} imageBackground={'#000000'}/>
        </div>
    )
}