import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {EnumTabs} from "@/app/type/EnumTabs";
import SortBy from "@/app/parts/sortBy";
import Tooltip from "@/app/parts/tooltip";
import VerticalCard from "@/app/parts/VerticalCard";
import CtaBox from "@/app/parts/CtaBox";
import ProgressBar from "@/app/parts/progress";
import React from "react";
import {getPoolInfo} from "@/app/type/SolanaPool";
import { PublicKey } from '@solana/web3.js';
import idl from '@/app/data/idl/pool.json';
import {Idl} from '@project-serum/anchor';
import {activePoolData, completedPoolData} from "@/app/data/pool/ActivePool";
import Link from "next/link";



export default async function Home({params}: { params: { status: string } }) {

    const programId = new PublicKey(idl.metadata.address);

    const activePoolInfo = await getPoolInfo({
        poolAddress: activePoolData.poolPda,
        programId,
        idl: idl as Idl,
    });

    const completedPoolInfo = await getPoolInfo({
        poolAddress: completedPoolData.poolPda,
        programId,
        idl: idl as Idl,
    });

    const projectId = params.status === 'completed'?'321':'123';
    const projectLink = `/explore/project/${projectId}`;
    const poolInfo = params.status === 'completed'?completedPoolInfo:activePoolInfo;

    return (
        <div className="grid grid-rows-[72px_1fr_40px] gap-y-12 justify-items-center min-h-screen">
            <Header activeTab={EnumTabs.EXPLORE}/>
            <main className="w-full" id="main">
                <div className="container md:grid md:grid-cols-[224px_1fr] md:gap-x-[48px]">
                    <aside>
                        <nav role={`navigation`} className={`secondary-nav`}>
                            <a href="/explore/all"
                               className={`flex justify-between ${params.status === 'all' ? 'active' : ''}`}><span>All</span><small>1</small></a>
                            <a href="/explore/active"
                               className={`flex justify-between ${params.status === 'active' ? 'active' : ''}`}><span>Active</span><small>1</small></a>
                            <a href="/explore/in-progress"
                               className={`flex justify-between ${params.status === 'in-progress' ? 'active' : ''}`}><span>In Progress</span><small>0</small></a>
                            <a href="/explore/completed"
                               className={`flex justify-between ${params.status === 'completed' ? 'active' : ''}`}><span>Complete</span><small>0</small></a>
                        </nav>
                    </aside>
                    <div className={`main-content`}>
                        <div className={`main-content--header flex justify-between items-center mb-6 md:mb-10`}>
                            <h1 className={`main-content--title`}>
                                {params.status === 'all' ? 'Projects' : ''}
                                {params.status === 'active' ? 'Active' : ''}
                                {params.status === 'in-progress' ? 'In Progress' : ''}
                                {params.status === 'completed' ? 'Complete' : ''}
                            </h1>
                            <SortBy/>
                        </div>
                        <div className={`page-block mb-10`}>
                            <h2 className={`page-block--title mb-4 md:mb-6 font-medium`}>Featured</h2>
                            <Link href={projectLink}>
                                <div
                                    className={`project-slider--wrapper`}> {/* Mihail, it's swiper wrapper, just add class to it */}
                                    <div
                                        className={`project-slider--item border border-outline shadow-cards rounded-xl`}> {/* Mihail, it's swiper item wrapper, just add class to it */}
                                        <div className="grid md:grid-cols-2">
                                            <div
                                                className={`order-1 md:order-0 project-slider--item__info bg-bgSecondary p-4 md:p-8 rounded-b-xl md:rounded-b-none md:rounded-l-xl flex flex-col`}>
                                                <div className={`project-header__info mb-4`}>
                                                    <img src="/images/no-image.png"
                                                         className={`hidden md:block info--header__avatar mb-4`} alt=""/>
                                                    <h3 className={`info--header__title flex align-center`}>
                                                        Example {params.status === 'completed'?'Completed':'Active'} Project
                                                        <Tooltip
                                                            text={`This is an official project that has an agreement between the project owners and Contribo.`}/>
                                                    </h3>
                                                    <p className={`info--header__subtitle`}>DeFi</p>
                                                </div>
                                                <ProgressBar label="Funding" currentAmount={poolInfo.currentCap.toNumber()/1000} goalAmount={poolInfo.maxUsdcCap.toNumber()/1000} withMarginAuto />
                                            </div>
                                            <figure className={`order-0 md:order-1 h-[225px] md:h-[332px] rounded-t-xl md:rounded-tl-none md:rounded-r-xl overflow-hidden border-outline border-b md:border-b-0 md:border-l flex items-center justify-center`}>
                                                {/*<img src="https://picsum.photos/id/0/754/664" width={377}*/}
                                                {/*     className={`object-cover size-full`}*/}
                                                {/*     alt=""/>*/}
                                                <img src="/images/no-image.png" width={110} className={``} alt=""/>
                                            </figure>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {(params.status === 'all' || params.status === 'active') && (
                            <div className={`page-block mb-10`}>
                                <h2 className={`page-block--title mb-6 font-medium`}>Active</h2>
                                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6`}>
                                    <VerticalCard
                                        link={projectLink}
                                        title="Example Project"
                                        category="DeFi"
                                        tooltipText="2This is an official project that has an agreement between the project owners and Contribo."
                                    />
                                    <VerticalCard
                                        link={projectLink}
                                        title="Example Project"
                                        category="Marketplace"
                                        tooltipText="This is an official project that has an agreement between the project owners and Contribo."
                                    />
                                    <VerticalCard
                                        link={projectLink}
                                        title="Example Project"
                                        category="Exchange"
                                        tooltipText="3This is an official project that has an agreement between the project owners and Contribo."
                                    />
                                </div>
                            </div>
                        )}

                        <CtaBox
                            title="Refer a Project to Contribo"
                            description="Lorem ipsum dolor sit amet consectetur. Dui lorem diam viverra elementum. Dui faucibus eget enim etiam bibendum vitae pulvinar risus sodales."
                            buttonText="Refer a Project"
                            buttonLink="#"
                        />
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
