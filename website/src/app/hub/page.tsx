import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {EnumTabs} from "@/app/type/EnumTabs";
import SortBy from "@/app/parts/sortBy";
import React from "react";
import CtaBox from "@/app/parts/CtaBox";


export default function Home() {
    return (
        <div className="grid grid-rows-[72px_1fr_40px] gap-y-12 justify-items-center min-h-screen">
            <Header activeTab={EnumTabs.PARTNER_HUB}/>
            <main className="w-full" id="main">

                <div className="container">
                    <div className={`main-content`}>
                        <div className={`main-content--header flex justify-between items-center mb-10`}>
                            <h1 className={`main-content--title`}>Partner Hub</h1>
                            <SortBy/>
                        </div>
                        <CtaBox
                            title="Earn rewards by Referring Projects"
                            description="Lorem ipsum dolor sit amet consectetur. Dui lorem diam viverra elementum. Dui faucibus eget enim etiam bibendum vitae pulvinar risus sodales."
                            buttonText="Refer a Project"
                            buttonLink="#"
                        />

                        <div className={`page-block mb-10`}>
                            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6`}>
                                <div
                                    className={`flex flex-col rounded-xl border border-outline shadow-cards`}>
                                    <div className={`bg-bgSecondary p-5 rounded-b-xl flex-1`}>
                                        <div className={`flex items-center justify-between mb-3`}>
                                            <div>
                                                <h3 className={`flex align-middle mb-1`}>
                                                    Example Project
                                                </h3>
                                                <p className={`text-secondary text-sm`}>DeFi</p>
                                            </div>
                                            <div>
                                                <img src="https://picsum.photos/id/2/80/80" width={40}
                                                     className={`rounded-lg border border-outline`} alt=""/>
                                            </div>
                                        </div>
                                        <ul className={`mb-3`}>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-largeSpace`}>Funding</span>
                                                <span className={`text-right font-medium`}>$25,000</span>
                                            </li>
                                        </ul>
                                        <p><a href="#" className={`btn btn-primary w-full`}>Claim</a></p>
                                    </div>
                                </div>
                                <div
                                    className={`flex flex-col rounded-xl border border-outline shadow-cards`}>
                                    <div className={`bg-bgSecondary p-5 rounded-b-xl flex-1`}>
                                        <div className={`flex items-center justify-between mb-3`}>
                                            <div>
                                                <h3 className={`flex align-middle mb-1`}>
                                                    Example Project
                                                </h3>
                                                <p className={`text-secondary text-sm`}>DeFi</p>
                                            </div>
                                            <div>
                                                <img src="https://picsum.photos/id/4/80/80" width={40}
                                                     className={`rounded-lg border border-outline`} alt=""/>
                                            </div>
                                        </div>
                                        <ul className={`mb-3`}>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-largeSpace`}>Funding</span>
                                                <span className={`text-right font-medium`}>$25,000</span>
                                            </li>
                                        </ul>
                                        <p><a href="#" className={`btn btn-primary w-full`}>Claim</a></p>
                                    </div>
                                </div>
                                <div
                                    className={`flex flex-col rounded-xl border border-outline shadow-cards`}>
                                    <div className={`bg-bgSecondary p-5 rounded-b-xl flex-1`}>
                                        <div className={`flex items-center justify-between mb-3`}>
                                            <div>
                                                <h3 className={`flex align-middle mb-1`}>
                                                    Example Project
                                                </h3>
                                                <p className={`text-secondary text-sm`}>DeFi</p>
                                            </div>
                                            <div>
                                                <img src="https://picsum.photos/id/5/80/80" width={40}
                                                     className={`rounded-lg border border-outline`} alt=""/>
                                            </div>
                                        </div>
                                        <ul className={`mb-3`}>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-largeSpace`}>Funding</span>
                                                <span className={`text-right font-medium`}>$25,000</span>
                                            </li>
                                        </ul>
                                        <p><a href="#" className={`btn btn-secondary w-full`}>Claimed</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
            <Footer/>
        </div>
    );
}
