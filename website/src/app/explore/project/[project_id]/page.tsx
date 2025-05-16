'use client';

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {EnumTabs} from "@/app/type/EnumTabs";
import NoItems from "@/app/parts/NoItems";
import Tooltip from "@/app/parts/tooltip";
import ProgressBar from "@/app/parts/progress";
import React, {useEffect} from "react";
import {PublicKey} from "@solana/web3.js";
import idl from "@/app/data/idl/pool.json";
import {activePoolData, completedPoolData} from "@/app/data/pool/ActivePool";
import {getPoolInfo, PoolInfo} from "@/app/type/SolanaPool";
import {Idl} from "@project-serum/anchor";
import Contribute from "@/app/explore/project/Contribute";


export default function Home({params}:{params:{project_id: string}}) {
    const [part, setPart] = React.useState<string>('contribution');
    const [poolInfo, setPoolInfo] = React.useState<PoolInfo|undefined>(undefined);
    const isActive = params.project_id === '123';

    const programId = new PublicKey(idl.metadata.address);
    const poolData = isActive ? activePoolData : completedPoolData;

    useEffect(() => {
        const loadPoolInfo = async()=> {
            const tmp = await getPoolInfo({
                poolAddress: poolData.poolPda,
                programId,
                idl: idl as Idl,
            });
            setPoolInfo(tmp);
        };
        loadPoolInfo()
    },[])


    return (
        <div className="grid grid-rows-[72px_1fr_40px] gap-y-12 justify-items-center min-h-screen">
            <Header activeTab={EnumTabs.EXPLORE}/>
            <main className="w-full" id="main">

                <div className="container">
                    <div className={`main-content`}>
                        <div className="project-header mb-8 md:mb-12">
                            <div className={`mb-10`}><a href="/explore/all" className={`btn-back`}>Back to Projects</a></div>
                            <div className={`flex justify-between items-start flex-wrap flex-col md:flex-row`}>
                                <div className={`flex items-center project-header__info mb-4 md:mb-0`}>
                                    <img src="/images/no-image.png"
                                         className={`info--header__avatar mr-4`} alt=""/>
                                    <div>
                                        <h1 className={`info--header__title flex align-center`}>
                                            Example Project
                                            <Tooltip
                                                text={`This is an official project that has an agreement between the project owners and Contribo.`}/>
                                        </h1>
                                        <h2 className={`info--header__subtitle`}>Decentralised Exchange</h2>
                                    </div>
                                </div>
                                <div className={`ml-auto`}>
                                    <a href="#" className={`btn btn-secondary`}>Share Project</a>
                                </div>
                            </div>
                        </div>
                        {!isActive && (<div
                            className={`border border-outline bg-bgSecondary p-2 text-center text-secondary text-sm mb-12 rounded-xl`}>This
                            project is now complete. Token compensation has been finalised.
                        </div>)}
                        <div className={`md:grid md:grid-cols-[auto_348px] gap-5 md:gap-12`}>
                            <div>
                                <picture className={`border border-outline rounded-xl overflow-hidden mb-10 flex items-center justify-center h-[208px] md:h-[360px]`}>
                                    {/*<img src={`https://picsum.photos/id/24/628/360`}*/}
                                    {/*     srcSet={`https://picsum.photos/id/24/1256/720 2x`}*/}
                                    {/*     width="628" alt=""/>*/}
                                    <img src="/images/no-image.png" width={110} className={``} alt=""/>
                                </picture>
                                <div
                                    className={`border border-outline bg-bgSecondary p-6 pt-5  rounded-xl mb-10`}>
                                    <div className={`md:grid md:grid-cols-[1fr_1px_1fr] md:gap-x-6`}>
                                        <ProgressBar label="Funding" currentAmount={poolInfo?poolInfo.currentCap.toNumber()/1000:0} goalAmount={poolInfo?poolInfo.maxUsdcCap.toNumber()/1000:0} />
                                        <span className={`border-outline border-r hidden md:block`}></span>
                                        <hr className={`my-4 md:hidden`}/>
                                        <div className={`project--steps`}>
                                            <div className={`flex justify-between`}>
                                                <span className={`label`}>Stage</span>
                                                <span className={`value`}>{isActive?'Active':'Completed'}</span>
                                            </div>
                                            <div className={`steps`}>
                                                <span className={`active`}></span>
                                                <span className={isActive?'':'active'}></span>
                                                <span className={isActive?'':'active'}></span>
                                            </div>
                                        </div>
                                    </div>
                                    {!isActive && (<div
                                        className={`bg-background border border-outline mt-7 p-4 rounded-xl flex justify-between items-center flex-col md:flex-row`}>
                                        <div className={`mb-4 md:mb-0`}>
                                            <h3 className={`tracking-largeSpace font-medium`}>Total Token Compensation</h3>
                                            <p className={`text-secondary text-sm`}>Based upon the contributions</p>
                                        </div>
                                        <div>
                                            <p className={`price flex items-center gap-2`}>
                                                <img src="/images/jito-logo.svg" alt=""/>1,000,000</p>
                                        </div>
                                    </div>)}
                                    {false && (<div className={`md:grid md:grid-cols-[1fr_1px_1fr] md:gap-x-6`}>
                                        <ProgressBar
                                            label="Funding"
                                            currentAmount={0}
                                            goalAmount={0}
                                            canceled />
                                        <span className={`border-outline border-r hidden md:block`}></span>
                                        <hr className={`my-4 md:hidden`}/>
                                        <div className={`project--steps`}>
                                            <div className={`flex justify-between`}>
                                                <span className={`label`}>Stage</span>
                                                <span className={`value`}>Cancelled</span>
                                            </div>
                                            <div className={`steps`}>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>)}
                                </div>


                                <div className={`tabs-list--wrapper`}>
                                    <ul className="tabs-list overflow-x-auto whitespace-nowrap">
                                        <li>
                                            <a onClick={()=>setPart('contribution')} data-id={`contribution-tab`} aria-current={part === 'contribution'?'page':undefined}>Contributions</a>
                                        </li>
                                        <li>
                                            <a onClick={()=>setPart('vote')} data-id={`vote-tab`} aria-current={part === 'vote'?'page':undefined}>Vote</a>
                                        </li>
                                        <li>
                                            <a onClick={()=>setPart('tasks')} data-id={`tasks-tab`} aria-current={part === 'tasks'?'page':undefined}>Tasks</a>
                                        </li>
                                        <li>
                                            <a onClick={()=>setPart('about')} data-id={`about-tab`} aria-current={part === 'about'?'page':undefined}>About</a>
                                        </li>
                                        <li>
                                            <a onClick={()=>setPart('rounds')} data-id={`invest-tab`} aria-current={part === 'rounds'?'page':undefined}>Investment Rounds</a>
                                        </li>
                                    </ul>
                                </div>
                                <div className={`tabs-content--wrapper`}>
                                    {part === 'contribution' &&(
                                    <div className={`tabs-content-item active`} id={`contribution-tab`}>
                                        <NoItems text={`No contributions yet`}/>
                                        <div className={`timeline-wrapper`}>
                                            <ul className={`timeline-list`}>
                                                <li>
                                                    <div>
                                                        <a href={`#`} className={`link-arrow-right`}>Title of the Pull
                                                            Request</a>
                                                        <span className={`date`}>27th Jan 2025</span>
                                                    </div>
                                                    <div className={`ml-auto`}>
                                                        <span className={`status status-requested`}>Requested</span>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div>
                                                        <a href={`#`} className={`link-arrow-right`}>Title of the Pull
                                                            Request 2</a>
                                                        <span className={`date`}>15th Jan 2025</span>
                                                    </div>
                                                    <div className={`ml-auto`}>
                                                        <span className={`status status-approved`}>Approved</span>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div>
                                                        <a href={`#`} className={`link-arrow-right`}>Title of the Pull
                                                            Request 2</a>
                                                        <span className={`date`}>10th Jan 2025</span>
                                                    </div>
                                                    <div className={`ml-auto`}>
                                                        <span className={`status status-merged`}>Merged</span>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div>
                                                        <a href={`#`} className={`link-arrow-right`}>Title of the Pull
                                                            Request 2</a>
                                                        <span className={`date`}>19th Dec 2024</span>
                                                    </div>
                                                    <div className={`ml-auto`}>
                                                        <span className={`status status-merged`}>Merged</span>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    )}
                                    {part === 'vote' &&(
                                    <div className={`tabs-content-item active`} id={`vote-tab`}>
                                        <div
                                            className={`bg-bgSecondary rounded-xl border border-outline p-4 mb-4`}> {/* Mihail mb-4 for all except last one */}
                                            <h3 className={`vote-block--title`}>Title of Vote</h3>
                                            <p className={`vote-block--time mb-4`}>Ends in 3 Days</p>
                                            <p className={`vote-block--text`}>Lorem ipsum dolor sit amet consectetur.
                                                Nulla consectetur fusce sem.</p>
                                            <hr className={`my-4`}/>
                                            <div className="vote-progress--wrapper">
                                                <div className="value1" style={{width: '78%'}}>
                                                    <div className="label">78% For</div>
                                                    <div className="bar"></div>
                                                </div>
                                                <div className="value2" style={{width: '22%'}}>
                                                    <div className="label">22% Against</div>
                                                    <div className="bar"></div>
                                                </div>
                                            </div>
                                            <div className={`flex flex-col sm:flex-row gap-3`}>
                                                <a href="#" className={`btn btn-primary flex-1`}>For</a>
                                                <a href="#" className={`btn btn-secondary flex-1`}>Against</a>
                                            </div>
                                        </div>
                                    </div>
                                    )}
                                    {part === 'tasks' &&(
                                    <div className={`tabs-content-item active`} id={`tasks-tab`}>
                                        <div
                                            className={`border border-outline bg-bgSecondary rounded-xl p-4 mb-4`}> {/* Mihail mb-4 for all except last one */}
                                            <h3 className={`task-block--title`}>Title of the Task</h3>
                                            <p className={`task-block--time mb-4`}>Added 3 days ago</p>
                                            <ul className={`tags-list mb-4`}>
                                                <li><a href="#">Backend Development</a></li>
                                                <li><span>Rust</span></li>
                                                <li><span>Smart Contract</span></li>
                                            </ul>
                                            <p className={`mb-4`}>Lorem ipsum dolor sit amet consectetur. Molestie
                                                tortor sit massa dictum enim. Facilisis vulputate elit tempus nunc enim
                                                est. Ipsum ut massa massa congue nisl. Tellus nisl id odio eu. Malesuada
                                                quis at cursus eu ac facilisis adipiscing sed sed. Odio fringilla
                                                imperdiet cras cursus sit sit non ultricies enim. Fringilla potenti nibh
                                                ut massa ac aliquam dolor ac.</p>
                                            <div><a href="#" className={`btn btn-secondary w-full`}>Bid for Task</a>
                                            </div>
                                        </div>
                                    </div>
                                    )}
                                    {part === 'about' &&(
                                    <div className={`tabs-content-item active`} id={`about-tab`}>
                                        <p>Jupiter is one of the largest decentralized trading platforms and one of the
                                            most active governance communities in crypto.</p>
                                        <p>Lorem ipsum dolor sit amet consectetur. Nulla consectetur fusce sem lacus id
                                            semper nibh. Ipsum elit eget eget at. Et sagittis in sed nec sit ultrices
                                            sem. Eleifend placerat nisi laoreet orci odio. Nulla faucibus rhoncus
                                            laoreet tortor odio.</p>
                                        <p>Lorem ipsum dolor sit amet consectetur. Nulla consectetur fusce sem lacus id
                                            semper nibh. Ipsum elit eget eget at. Et sagittis in sed nec sit ultrices
                                            sem. Eleifend placerat nisi laoreet orci odio. Nulla faucibus rhoncus
                                            laoreet tortor odio.</p>
                                    </div>
                                    )}
                                    {part === 'rounts' &&(
                                    <div className={`tabs-content-item active`} id={`invest-tab`}>
                                        <div
                                            className={`invest-rounds-block bg-bgSecondary rounded-xl border border-outline p-4 mb-4`}> {/* Mihail mb-4 for all except last one */}
                                            <div className={`rounds-header flex justify-between flex-col md:flex-row`}>
                                                <div>
                                                    <div className={`name`}>Series A</div>
                                                    <div className={`date`}>31 Jan 2022</div>
                                                </div>
                                                <div className={`text-right`}>
                                                    <div className={`price`}>$109m</div>
                                                    <div className={`vulation`}>Valuation: $1.2B</div>
                                                </div>
                                            </div>
                                            <hr className={`my-4`}/>
                                            <div>
                                                <div className="label">Investors</div>
                                                <ul className={`investors-list`}>
                                                    <li>
                                                        <img src={`https://picsum.photos/id/45/48/48`} width={24}
                                                             alt=""/>Paradigm
                                                    </li>
                                                    <li><span></span>Sequoia Captial</li>
                                                    <li><img src={`https://picsum.photos/id/47/48/48`} width={24}
                                                             alt=""/>a16z
                                                    </li>
                                                    <li><img src={`https://picsum.photos/id/48/48/48`} width={24}
                                                             alt=""/>Variant
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div
                                            className={`invest-rounds-block bg-bgSecondary rounded-xl border border-outline p-4`}>
                                            <div className={`rounds-header flex justify-between flex-col md:flex-row`}>
                                                <div>
                                                    <div className={`name`}>Series A</div>
                                                    <div className={`date`}>31 Jan 2022</div>
                                                </div>
                                                <div className={`text-right`}>
                                                    <div className={`price`}>$109m</div>
                                                    <div className={`vulation`}>Valuation: $1.2B</div>
                                                </div>
                                            </div>
                                            <hr className={`my-4`}/>
                                            <div>
                                                <div className="label">Investors</div>
                                                <ul className={`investors-list`}>
                                                    <li>
                                                        <img src={`https://picsum.photos/id/45/48/48`} width={24}
                                                             alt=""/>Paradigm
                                                    </li>
                                                    <li><span></span>Sequoia Captial</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    )}
                                </div>

                            </div>
                            <div className={`sidebar-block mb-10 md:mb-0`}>
                                {isActive && (<Contribute/>)}
                                {false && (<div className={`bg-bgSecondary border border-outline rounded-xl p-4 mb-10`}>
                                    <h3 className={`sidebar-title mb-2 flex justify-between items-center`}>
                                        Contribution
                                        <small className={`text-secondary text-sm`}>Trade LCT</small>
                                    </h3>
                                    <p className={`price mb-2`}>$0</p>
                                    <p className={`currency`}>US Dollars</p>
                                    <hr className={`my-4 -mx-4`}/>
                                    <p className={`text-secondary text-sm`}>Contributions to this
                                        project are now closed because the funding goal has been reached. Contributions
                                        can be purchased via the Market.</p>
                                    <button type="button" className={`btn btn-primary w-full mt-4`}>Claim Refund
                                    </button>
                                </div>)}
                                {!isActive && (<div className={`bg-bgSecondary border border-outline rounded-xl p-4 mb-10`}>
                                    <h3 className={`sidebar-title mb-2 flex justify-between items-center`}>
                                        Pending Token Rewards
                                        <small className={`text-secondary text-sm`}>Trade</small>
                                    </h3>
                                    <p className={`price mb-2 flex items-center gap-2`}><img src="/images/jito-logo.svg"
                                                                                             alt=""/>10,000</p>
                                    <hr className={`my-4 -mx-4`}/>
                                    <div className={`sidebar-title mb-4 flex justify-between`}>
                                        <small>Unlocked</small>
                                        <span>
                                            {/*Mihail we need some circular progress bar plugin that will allow gradient for trail*/}
                                            28%
                                        </span>
                                    </div>
                                    <div className={`sidebar-title mb-4 flex justify-between`}>
                                        <small>Available to Claim</small>
                                        <span>100</span>
                                    </div>
                                    <div className={`sidebar-title mb-4 flex justify-between`}>
                                        <small>Next Claim Date</small>
                                        <span>Feb 5, 2025</span>
                                    </div>
                                    <button type="button" className={`btn btn-primary w-full`}>Claim</button>
                                </div>)}
                                <h3 className={`sidebar-title mb-4`}>Links</h3>
                                <ul className={`list-of-links`}>
                                    <li>
                                        <span>Website</span>
                                        <a href="#" target={`_blank`} className={`link-arrow-right`}>example.org</a>
                                    </li>
                                    <li>
                                        <span>X (Twitter)</span>
                                        <a href="#" target={`_blank`} className={`link-arrow-right`}>@example</a>
                                    </li>
                                    <li>
                                        <span>Github</span>
                                        <a href="#" target={`_blank`}
                                           className={`link-arrow-right`}>@exampleexchange</a>
                                    </li>
                                    <li>
                                        <span>Discord</span>
                                        <a href="#" target={`_blank`} className={`link-arrow-right`}>@example</a>
                                    </li>
                                </ul>
                                <hr className={`my-10`}/>
                                <div className={`tags-list`}>
                                    <a href="#">DeFi</a>
                                    <span>Solana Ecosystem</span>
                                    <a href="#">Launchpad</a>
                                    <a href="#">Derivitatives</a>
                                    <a href="#">DEX</a>
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
