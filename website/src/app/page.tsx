import Header from "@/app/components/Header";
import ProjectsList from "@/app/components/ProjectsList";
import Footer from "@/app/components/Footer";
import {EnumTabs} from "@/app/type/EnumTabs";


export default function Home() {
    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <Header activeTab={EnumTabs.CAMPAIGNS}/>
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full ">
                <ProjectsList/>
            </main>
            <Footer/>
        </div>
    );
}
