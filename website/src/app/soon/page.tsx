import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {EnumTabs} from "@/app/type/EnumTabs";

export default function Page() {
    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <Header activeTab={EnumTabs.CAMPAIGNS}/>
            <main className="flex gap-8 row-start-2 items-center sm:items-start w-full justify-center ">
                <div className={"flex rounded-xl"} style={{backgroundColor:'#FFFFFF'}}>
                    <div className={"p-20 text-xl"}>Coming soon...</div>
                </div>
            </main>
            <Footer/>
        </div>
    )
}