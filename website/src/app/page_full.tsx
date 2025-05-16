import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {EnumTabs} from "@/app/type/EnumTabs";
import NoItems from "@/app/parts/NoItems";
import SortBy from "@/app/parts/sortBy";
import Tooltip from "@/app/parts/tooltip";
import ProgressBar from "@/app/parts/progress";
import React from "react";
import CtaBox from "@/app/parts/CtaBox";
import VerticalCard from "@/app/parts/VerticalCard";


export default function Home() {
    return (
        <div className="grid grid-rows-[72px_1fr_40px] gap-y-12 justify-items-center min-h-screen">
            <Header activeTab={EnumTabs.CAMPAIGNS}/>
            <main className="w-full" id="main">
                <div className="container md:grid md:grid-cols-[224px_1fr] md:gap-x-[48px]">
                    <aside>
                        <nav role={`navigation`} className={`secondary-nav`}>
                            <a href="#" className={`flex justify-between active`}><span>All</span><small>1</small></a>
                            <a href="#" className={`flex justify-between`}><span>Active</span><small>1</small></a>
                            <a href="#" className={`flex justify-between`}><span>In Progress</span><small>0</small></a>
                            <a href="#" className={`flex justify-between`}><span>Complete</span><small>0</small></a>
                        </nav>
                    </aside>
                    <div className={`main-content`}>
                        <div className={`main-content--header flex justify-between items-center mb-6 md:mb-10`}>
                            <h1 className={`main-content--title`}>Projects</h1>
                            <SortBy/>
                        </div>
                        <div className={`page-block mb-10`}>
                            <h2 className={`page-block--title mb-4 md:mb-6 font-medium`}>Featured</h2>
                            <div
                                className={`project-slider--wrapper`}> {/* Mihail, it's swiper wrapper, just add class to it */}
                                <div
                                    className={`project-slider--item border border-outline shadow-cards rounded-xl`}> {/* Mihail, it's swiper item wrapper, just add class to it */}
                                    <div className="grid md:grid-cols-2">
                                        <div
                                            className={`order-1 md:order-0 project-slider--item__info bg-bgSecondary p-4 md:p-8 rounded-b-xl md:rounded-b-none md:rounded-l-xl flex flex-col`}>
                                            <div className={`project-header__info mb-4`}>
                                                <img src="https://picsum.photos/id/2/56/56"
                                                     className={`hidden md:block info--header__avatar mb-4`} alt=""/>
                                                <h3 className={`info--header__title flex align-center`}>
                                                    Example Project
                                                    <Tooltip
                                                        text={`This is an official project that has an agreement between the project owners and Contribo.`}/>
                                                </h3>
                                                <p className={`info--header__subtitle`}>DeFi</p>
                                            </div>
                                            <ProgressBar label="Donations" currentAmount={41324} goalAmount={50000} withMarginAuto />
                                        </div>
                                        <figure className={`order-0 md:order-1 h-[225px] md:h-[332px] rounded-t-xl md:rounded-tl-none md:rounded-r-xl overflow-hidden border-outline border-b md:border-b-0 md:border-l flex items-center justify-center`}>
                                            {/*<img src="https://picsum.photos/id/0/754/664" width={377}*/}
                                            {/*     className={`object-cover size-full`}*/}
                                            {/*     alt=""/>*/}
                                            <img src="/images/no-image.png" width={110}
                                                 className={``}
                                                 alt=""/>
                                        </figure>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`page-block mb-10`}>
                            <h2 className={`page-block--title mb-6 font-medium`}>Active</h2>
                            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4`}>
                                <VerticalCard
                                    link="/explore/project/123"
                                    title="Example Project"
                                    category="DeFi"
                                    tooltipText="2This is an official project that has an agreement between the project owners and Contribo."
                                />
                                <VerticalCard
                                    link="/explore/project/123"
                                    title="Example Project"
                                    category="Marketplace"
                                    tooltipText="This is an official project that has an agreement between the project owners and Contribo."
                                />
                                <VerticalCard
                                    link="/explore/project/123"
                                    title="Example Project"
                                    category="Exchange"
                                    tooltipText="3This is an official project that has an agreement between the project owners and Contribo."
                                />
                            </div>
                        </div>

                        <CtaBox
                            title="Refer a Project to Contribo"
                            description="Lorem ipsum dolor sit amet consectetur. Dui lorem diam viverra elementum. Dui faucibus eget enim etiam bibendum vitae pulvinar risus sodales."
                            buttonText="Refer a Project"
                            buttonLink="#"
                        />
                    </div>
                </div>
                <div className="container">
                    <div className={`main-content`}>
                        <div className={`main-content--header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10`}>
                            <h1 className={`main-content--title`}>Market</h1>
                            <div className={`flex items-center gap-3 ml-auto`}>
                                <a href="#" className={`btn btn-secondary`}>My Orders</a>
                                <SortBy/>
                            </div>
                        </div>
                        <CtaBox
                            title="Refer a Project to Contribo"
                            description="Lorem ipsum dolor sit amet consectetur. Dui lorem diam viverra elementum. Dui faucibus eget enim etiam bibendum vitae pulvinar risus sodales."
                        />


                        <div className="responsive-table-wrapper">
                            <table>
                                <thead>
                                <tr>
                                    <th scope="col">Project</th>
                                    <th scope="col">Last Traded Price</th>
                                    <th scope="col">24h Total</th>
                                    <th scope="col">Total</th>
                                    <th scope="col"></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <th scope="row">
                                        <div className="flex items-center">
                                            <img src="https://picsum.photos/id/2/56/56"
                                                 className={`hidden md:flex mr-3 rounded-xl size-[36px]`} alt=""/>
                                            Example Project
                                            <Tooltip
                                                text={`This is an official project that has an agreement between the project owners and Contribo.`}/>
                                        </div>

                                    </th>
                                    <td>$0.00120</td>
                                    <td>$0.00120</td>
                                    <td>$11,000</td>
                                    <td className={`text-right`}><a href="#"
                                                                    className={`btn btn-secondary`}>Trade</a></td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <div className="flex items-center">
                                            <img src="https://picsum.photos/id/2/56/56"
                                                 className={`hidden md:flex mr-3 rounded-xl size-[36px]`} alt=""/>
                                            Example Project
                                            <Tooltip
                                                text={`This is an official project that has an agreement between the project owners and Contribo.`}/>
                                        </div>

                                    </th>
                                    <td>$0.00120</td>
                                    <td>$0.00120</td>
                                    <td>$9,000</td>
                                    <td className={`text-right`}><a href="#"
                                                                    className={`btn btn-secondary`}>Trade</a></td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <div className="flex items-center">
                                            <img src="https://picsum.photos/id/2/56/56"
                                                 className={`hidden md:flex mr-3 rounded-xl size-[36px]`} alt=""/>
                                            Example Project
                                            <Tooltip
                                                text={`This is an official project that has an agreement between the project owners and Contribo.`}/>
                                        </div>

                                    </th>
                                    <td>$0.01120</td>
                                    <td>$0.00120</td>
                                    <td>$25,000</td>
                                    <td className={`text-right`}><a href="#"
                                                                    className={`btn btn-secondary`}>Trade</a></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/*<ProjectsList/>*/}
                <div className="container">
                    <div className={`main-content`}>
                        <div className="project-header mb-8 md:mb-12">
                            <div className={`mb-10`}><a href="#" className={`btn-back`}>Back to Projects</a></div>
                            <div className={`flex justify-between items-start flex-wrap flex-col md:flex-row`}>
                                <div className={`flex items-center project-header__info mb-4 md:mb-0`}>
                                    <img src="https://picsum.photos/id/2/56/56"
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
                        <div
                            className={`border border-outline bg-bgSecondary p-2 text-center text-secondary text-sm mb-12 rounded-xl`}>This
                            project is now complete. Token compensation has been finalised.
                        </div>
                        <div className={`md:grid md:grid-cols-[auto_348px] gap-5 md:gap-12`}>
                            <div>
                                <picture className={`border border-outline rounded-xl overflow-hidden block mb-10`}>
                                    <img src={`https://picsum.photos/id/24/628/360`}
                                         srcSet={`https://picsum.photos/id/24/1256/720 2x`}
                                         width="628" alt=""/>
                                </picture>
                                <div
                                    className={`border border-outline bg-bgSecondary p-6 pt-5  rounded-xl mb-10`}>
                                    <div className={`md:grid md:grid-cols-[1fr_1px_1fr] md:gap-x-6`}>
                                        <ProgressBar label="Funding" currentAmount={41324} goalAmount={50000} />
                                        <span className={`border-outline border-r hidden md:block`}></span>
                                        <hr className={`my-4 md:hidden`}/>
                                        <div className={`project--steps`}>
                                            <div className={`flex justify-between`}>
                                                <span className={`label`}>Stage</span>
                                                <span className={`value`}>Active</span>
                                            </div>
                                            <div className={`steps`}>
                                                <span className={`active`}></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={`bg-background border border-outline mt-7 p-4 rounded-xl flex justify-between items-center flex-col md:flex-row`}>
                                        <div className={`mb-4 md:mb-0`}>
                                            <h3 className={`tracking-largeSpace font-medium`}>Total Token Compensation</h3>
                                            <p className={`text-secondary text-sm`}>Based upon the contributions</p>
                                        </div>
                                        <div>
                                            <p className={`price flex items-center gap-2`}>
                                                <img src="/images/jito-logo.svg" alt=""/>1,000,000</p>
                                        </div>
                                    </div>
                                    <div className={`md:grid md:grid-cols-[1fr_1px_1fr] md:gap-x-6`}>
                                        <ProgressBar label="Canceled Funding" currentAmount={41324} goalAmount={50000} canceled />
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
                                    </div>
                                </div>


                                <div className={`tabs-list--wrapper`}>
                                    <ul className="tabs-list overflow-x-auto whitespace-nowrap">
                                        <li>
                                            <a href="#" data-id={`contribution-tab`}>Contributions</a>
                                        </li>
                                        <li>
                                            <a href="#" data-id={`vote-tab`} aria-current="page">Vote</a>
                                        </li>
                                        <li>
                                            <a href="#" data-id={`tasks-tab`}>Tasks</a>
                                        </li>
                                        <li>
                                            <a href="#" data-id={`about-tab`}>About</a>
                                        </li>
                                        <li>
                                            <a href="#" data-id={`invest-tab`}>Investment Rounds</a>
                                        </li>
                                    </ul>
                                </div>
                                <div className={`tabs-content--wrapper`}>
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
                                </div>

                            </div>
                            <div className={`sidebar-block mb-10 md:mb-0`}>
                                <div className={`bg-bgSecondary border border-outline rounded-xl p-4 mb-10`}>
                                    <h3 className={`sidebar-title mb-2`}>Contribution</h3>
                                    <p className={`price mb-2`}>$0</p>
                                    <p className={`currency`}>US Dollars</p>
                                    <hr className={`my-4 -mx-4`}/>
                                    <h3 className={`sidebar-title mb-4 flex justify-between`}>
                                        <span>Deposit</span>
                                        <small>Balance: 100 USDC</small>
                                    </h3>
                                    <div className={`currency-dropdown relative mb-4`}>
                                        <button type={`button`} id="depositField"
                                                className={`btn btn-secondary w-full flex justify-between items-center`}
                                                aria-expanded="false" aria-haspopup="true">
                                            <span>10,000</span>
                                            <span className={`flex items-center gap-[10px]`}>
                                                <img src="/images/usdc.png" width={24} alt=""/>
                                                <img src="/images/chevron-down.svg" width={10} alt=""/>
                                            </span>
                                        </button>
                                        <ul className={`dropdown-menu w-48`} role="menu" aria-orientation="vertical"
                                            aria-labelledby="depositField" tabIndex={-1}>
                                            <li className={`active bg-bgSecondary rounded-lg`}><a href="#"
                                                                                                  className={`items-center gap-2`}><img
                                                src="/images/usdc.png" width={24} alt=""/>USDC</a>
                                            </li>
                                            <li><a href="#" className={`px-1 py-3 flex items-center gap-2`}><img
                                                src="/images/usdt.png" width={24} alt=""/>USDT</a></li>
                                        </ul>
                                    </div>
                                    <input type="submit" className={`btn btn-primary w-full`} value={`Contribute`}/>
                                </div>
                                <div className={`bg-bgSecondary border border-outline rounded-xl p-4 mb-10`}>
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
                                </div>
                                <div className={`bg-bgSecondary border border-outline rounded-xl p-4 mb-10`}>
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
                                </div>
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
                        <div
                            className={`border border-outline bg-bgSecondary grid sm:grid-cols-2 md:grid-cols-4 rounded-xl mb-12`}>
                            <div className={`flex flex-col px-5 py-4`}>
                                <small className={`text-secondary text-sm mb-[6px]`}>Last Traded
                                    Price</small>
                                <span className={`text-[17px] font-medium`}>$5.10</span>
                            </div>
                            <div className={`flex flex-col px-5 py-4 sm:border-l sm:border-outline`}>
                                <small className={`text-secondary text-sm mb-[6px]`}>Floor
                                    Price</small>
                                <span className={`text-[17px] font-medium`}>$4.96</span>
                            </div>
                            <div className={`flex flex-col px-5 py-4 md:border-l md:border-outline`}>
                                <small className={`text-secondary text-sm mb-[6px]`}>Highest
                                    Bid</small>
                                <span className={`text-[17px] font-medium`}>$4.96</span>
                            </div>
                            <div className={`flex flex-col px-5 py-4 sm:border-l sm:border-outline`}>
                                <small className={`text-secondary text-sm mb-[6px]`}>Average
                                    Price</small>
                                <span className={`text-[17px] font-medium`}>$4.96</span>
                            </div>
                        </div>
                        <div className="page-block">
                            <div className={`flex justify-between mb-6`}>
                                <div className={`flex items-center`}>
                                    <a href="#" className={`py-2 px-3 bg-bgSecondary rounded`}>Buy</a>
                                    <a href="#" className={`py-2 px-3`}>Sell</a>
                                </div>
                                <div>
                                    <a href="#" className={`btn btn-primary`}>New Order</a>
                                </div>
                            </div>
                            <div className="responsive-table-wrapper">
                                <table>
                                    <thead>
                                    <tr>
                                        <th scope="col">Seller</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Amount</th>
                                        <th scope="col">Limit</th>
                                        <th scope="col"></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <th scope="row">
                                            2jdY...Wi8s
                                        </th>
                                        <td>$0.00120</td>
                                        <td>$0.00120</td>
                                        <td>$11,000.00</td>
                                        <td className={`text-right`}>
                                            <div className={`flex justify-end items-center gap-3`}>
                                                <a href="#" className={`btn btn-secondary`}>Buy</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            2jdY...Wi8s
                                        </th>
                                        <td>$0.00120</td>
                                        <td>$0.00120</td>
                                        <td>$11,000.00</td>
                                        <td className={`text-right`}>
                                            <div className={`flex justify-end items-center gap-3`}>
                                                <a href="#" className={`btn btn-secondary`}>Buy</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            2jdY...Wi8s
                                        </th>
                                        <td>$0.00120</td>
                                        <td>$0.00120</td>
                                        <td>$11,000.00</td>
                                        <td className={`text-right`}>
                                            <div className={`flex justify-end items-center gap-3`}>
                                                <a href="#" className={`btn btn-secondary`}>Buy</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            2jdY...Wi8s
                                        </th>
                                        <td>$0.00120</td>
                                        <td>$0.00120</td>
                                        <td>$11,000.00</td>
                                        <td className={`text-right`}>
                                            <div className={`flex justify-end items-center gap-3`}>
                                                <a href="#" className={`btn btn-secondary`}>Buy</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            2jdY...Wi8s
                                        </th>
                                        <td>$0.00120</td>
                                        <td>$0.00120</td>
                                        <td>$11,000.00</td>
                                        <td className={`text-right`}>
                                            <div className={`flex justify-end items-center gap-3`}>
                                                <a href="#" className={`btn btn-secondary`}>Buy</a>
                                            </div>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container md:grid md:grid-cols-[224px_1fr] md:gap-x-10">
                    <aside>
                        <nav role={`navigation`} className={`secondary-nav`}>
                            <a href="#" className={`flex justify-between`}><span>All</span><small>1</small></a>
                            <a href="#" className={`flex justify-between`}><span>Active</span><small>1</small></a>
                            <a href="#"
                               className={`flex justify-between active`}><span>In Progress</span><small>0</small></a>
                            <a href="#" className={`flex justify-between`}><span>Complete</span><small>0</small></a>
                        </nav>
                    </aside>
                    <div className={`main-content`}>
                        <div className={`main-content--header flex justify-between items-center mb-10`}>
                            <h1 className={`main-content--title`}>In Progress</h1>
                            <SortBy/>
                        </div>

                        <div className={`page-block mb-10`}>
                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6`}>
                                <div
                                    className={`flex flex-col rounded-xl border border-outline shadow-cards`}>
                                    <figure className={`h-[170px]`}>
                                        <img src="https://picsum.photos/id/35/235/170"
                                             className={`rounded-t-xl object-cover size-full`} alt=""/>
                                    </figure>
                                    <div className={`bg-bgSecondary p-5 rounded-b-xl flex-1`}>
                                        <h3 className={`flex align-middle dark:text-white mb-1`}>
                                            Example Project
                                        </h3>
                                        <ul className={`text-sm`}>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-[-0.13px]`}>Funding</span>
                                                <span className={`text-right font-medium`}>$25,000</span>
                                            </li>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-[-0.13px]`}>Contribution</span>
                                                <span className={`text-right font-medium`}>$1,000</span>
                                            </li>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-[-0.13px]`}>Pending Tasks</span>
                                                <span className={`text-right font-medium`}>12</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div
                                    className={`flex flex-col rounded-xl border border-outline shadow-cards`}>
                                    <figure className={`h-[170px]`}>
                                        <img src="https://picsum.photos/id/55/235/170"
                                             className={`rounded-t-xl object-cover size-full`} alt=""/>
                                    </figure>
                                    <div className={`bg-bgSecondary p-5 rounded-b-xl flex-1`}>
                                        <h3 className={`flex align-middle mb-1`}>
                                            Example Project
                                        </h3>
                                        <ul className={`text-sm`}>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-[-0.13px]`}>Funding</span>
                                                <span className={`text-right font-medium`}>$25,000</span>
                                            </li>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-[-0.13px]`}>Contribution</span>
                                                <span className={`text-right font-medium`}>$1,000</span>
                                            </li>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-[-0.13px]`}>Pending Tasks</span>
                                                <span className={`text-right font-medium`}>12</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="container md:grid md:grid-cols-[224px_1fr] md:gap-x-10">
                    <aside>
                        <nav role={`navigation`} className={`secondary-nav`}>
                            <a href="#" className={`flex justify-between`}><span>All</span><small>1</small></a>
                            <a href="#" className={`flex justify-between`}><span>Active</span><small>1</small></a>
                            <a href="#"
                               className={`flex justify-between`}><span>In Progress</span><small>0</small></a>
                            <a href="#" className={`flex justify-between`}><span>Complete</span><small>0</small></a>
                            <a href="#" className={`flex justify-between active`}><span>Canceled</span><small>0</small></a>
                        </nav>
                    </aside>
                    <div className={`main-content`}>
                        <div className={`main-content--header flex justify-between items-center mb-10`}>
                            <h1 className={`main-content--title`}>Cancelled</h1>
                            <SortBy/>
                        </div>
                        <CtaBox
                            title="What are completed projects?"
                            description="Lorem ipsum dolor sit amet consectetur. Dui lorem diam viverra elementum. Dui faucibus eget enim etiam bibendum vitae pulvinar risus sodales."
                        />

                        <div className={`page-block mb-10`}>
                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6`}>
                                <div
                                    className={`flex flex-col rounded-xl border border-outline shadow-cards`}>
                                    <figure className={`h-[170px]`}>
                                        <img src="https://picsum.photos/id/35/235/170"
                                             className={`rounded-t-xl object-cover size-full`} alt=""/>
                                    </figure>
                                    <div className={`bg-bgSecondary p-5 rounded-b-xl flex-1`}>
                                        <h3 className={`flex align-middle dark:text-white mb-1`}>
                                            Example Project
                                        </h3>
                                        <ul className={`text-sm`}>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-[-0.13px]`}>Funding</span>
                                                <span className={`text-right font-medium`}>$25,000</span>
                                            </li>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-[-0.13px]`}>Contribution</span>
                                                <span className={`text-right font-medium`}>$1,000</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div
                                    className={`flex flex-col rounded-xl border border-outline shadow-cards`}>
                                    <figure className={`h-[170px]`}>
                                        <img src="https://picsum.photos/id/55/235/170"
                                             className={`rounded-t-xl object-cover size-full`} alt=""/>
                                    </figure>
                                    <div className={`bg-bgSecondary p-5 rounded-b-xl flex-1`}>
                                        <h3 className={`flex align-middle mb-1`}>
                                            Example Project
                                        </h3>
                                        <ul className={`text-sm`}>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-[-0.13px]`}>Funding</span>
                                                <span className={`text-right font-medium`}>$25,000</span>
                                            </li>
                                            <li className={`flex justify-between items-center py-2`}>
                                                <span
                                                    className={`text-secondary dark:text-white/50 tracking-[-0.13px]`}>Contribution</span>
                                                <span className={`text-right font-medium`}>$1,000</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className={`container`}>
                    <div className={`main-content`}>
                        <div className={`page-block mb-12 grid grid-cols-1 md:grid-cols-2 gap-6`}>
                            <div className={`bg-bgSecondary border border-outline px-5 py-4 rounded-xl`}>
                                <h2 className={`tracking-largeSpace font-medium mb-2`}>Deposits</h2>
                                <span className={`text-[28px] tracking-largeSpace font-medium mb-[6px]`}>$0</span>
                                <p className={`text-sm text-secondary`}>0 Projects</p>
                            </div>
                            <div className={`bg-bgSecondary border border-outline px-5 py-4 rounded-xl`}>
                                <h2 className={`tracking-largeSpace font-medium mb-2`}>Claimable</h2>
                                <span className={`text-[28px] tracking-largeSpace font-medium mb-[6px]`}>0</span>
                                <p className={`text-sm text-secondary`}>Next Claim Date: n/a</p>
                            </div>
                        </div>
                        <div className={`page-block mb-12`}>
                            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6`}>
                                <h2 className={`mb-3 sm:mb-0`}>Your Contributions</h2>
                                <div className={`flex gap-3 ml-auto`}>
                                    <SortBy/>
                                    <div className={`switch-view`}>
                                        <button type="button" className={`grid-btn active`} aria-label={`Grid view`}>
                                            <svg width="17" height="18" viewBox="0 0 17 18" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <rect y="0.5" width="7" height="7" rx="2" fill="#988B71"/>
                                                <rect x="10" y="0.5" width="7" height="7" rx="2" fill="#988B71"/>
                                                <rect y="10.5" width="7" height="7" rx="2" fill="#988B71"/>
                                                <rect x="10" y="10.5" width="7" height="7" rx="2" fill="#988B71"/>
                                            </svg>
                                        </button>
                                        <button type="button" className={`list-btn`} aria-label={`List view`}>
                                            <svg width="20" height="14" viewBox="0 0 20 14" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <rect width="20" height="2" rx="1" fill="#988B71"/>
                                                <rect y="6" width="20" height="2" rx="1" fill="#988B71"/>
                                                <rect y="12" width="20" height="2" rx="1" fill="#988B71"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <NoItems text={`You haven't made any contributions yet.`}/>
                            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6`}>
                                <VerticalCard
                                    variant="detailed"
                                    title="Example Project"
                                    status="active"
                                    contribution="$1,250"
                                    nextClaimDate="Feb 5, 2025"
                                />
                                <VerticalCard
                                    variant="detailed"
                                    imageSrc="https://picsum.photos/id/35/235/170"
                                    title="Example Project"
                                    status="active"
                                    contribution="$1,500"
                                    nextClaimDate="Apr 5, 2025"
                                />
                                <VerticalCard
                                    variant="detailed"
                                    imageSrc="https://picsum.photos/id/35/235/170"
                                    title="Example Project"
                                    status="completed"
                                    contribution="$2,500"
                                    nextClaimDate="Jan 25, 2025"
                                />
                                <VerticalCard
                                    variant="detailed"
                                    title="Example Project"
                                    status="active"
                                    contribution="$2,500"
                                    nextClaimDate="Jan 25, 2025"
                                />
                                <VerticalCard
                                    variant="detailed"
                                    imageSrc="https://picsum.photos/id/35/235/170"
                                    title="Example Project"
                                    status="active"
                                    contribution="$2,500"
                                />
                            </div>
                            <div className="responsive-table-wrapper">
                                <table>
                                    <thead>
                                    <tr>
                                        <th scope="col">Project</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Contribution</th>
                                        <th scope="col">Next Claim Date</th>
                                        <th scope="col"></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <th scope="row">
                                            <div className="flex items-center">
                                                <img src="https://picsum.photos/id/80/56/56"
                                                     className={`hidden md:flex mr-3 rounded-xl size-[36px]`} alt=""/>
                                                Example Project
                                            </div>

                                        </th>
                                        <td className={`text-highlight-orange`}>Active</td>
                                        <td>$10,000</td>
                                        <td>12 Feb 2025</td>
                                        <td className={`text-right`}>
                                            <div className={`flex justify-end items-center gap-3`}>
                                                <a href="#" className={`btn btn-primary`}>Claim</a>
                                                <div className="custom-dropdown inline-flex">
                                                    <div>
                                                        <button type="button" className="custom-dropdown--toggle_v2"
                                                                id="menu-button"
                                                                aria-expanded="true" aria-haspopup="true">
                                                            <svg width="15" height="4" viewBox="0 0 15 4" fill="none"
                                                                 xmlns="http://www.w3.org/2000/svg">
                                                                <rect y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="6" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="12" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="dropdown-menu" role="menu"
                                                         aria-orientation="vertical"
                                                         aria-labelledby="menu-button" tabIndex={-1}>
                                                        <div className="py-1" role="none">
                                                            <a href="#" role="menuitem" tabIndex={-1} id="menu-item-0">Open
                                                                Project</a>
                                                            <a href="#" role="menuitem" tabIndex={-1}
                                                               id="menu-item-1">Transaction</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            <div className="flex items-center">
                                                <img src="https://picsum.photos/id/80/56/56"
                                                     className={`hidden md:flex mr-3 rounded-xl size-[36px]`} alt=""/>
                                                Example Project
                                            </div>

                                        </th>
                                        <td className={`text-highlight-orange`}>In Progress</td>
                                        <td>$10,000</td>
                                        <td>25 Feb 2025</td>
                                        <td className={`text-right`}>
                                            <div className={`flex justify-end items-center gap-3`}>
                                                <a href="#" className={`btn btn-primary`}>Claim</a>
                                                <div className="custom-dropdown inline-flex">
                                                    <div>
                                                        <button type="button" className="custom-dropdown--toggle_v2"
                                                                id="menu-button"
                                                                aria-expanded="true" aria-haspopup="true">
                                                            <svg width="15" height="4" viewBox="0 0 15 4" fill="none"
                                                                 xmlns="http://www.w3.org/2000/svg">
                                                                <rect y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="6" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="12" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="dropdown-menu" role="menu"
                                                         aria-orientation="vertical"
                                                         aria-labelledby="menu-button" tabIndex={-1}>
                                                        <div className="py-1" role="none">
                                                            <a href="#" role="menuitem" tabIndex={-1} id="menu-item-0">Open
                                                                Project</a>
                                                            <a href="#" role="menuitem" tabIndex={-1}
                                                               id="menu-item-1">Transaction</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            <div className="flex items-center">
                                                <img src="https://picsum.photos/id/80/56/56"
                                                     className={`hidden md:flex mr-3 rounded-xl size-[36px]`} alt=""/>
                                                Example Project
                                            </div>

                                        </th>
                                        <td className={`text-secondary`}>Complete</td>
                                        <td>$10,000</td>
                                        <td>25 Feb 2025</td>
                                        <td className={`text-right`}>
                                            <div className={`flex justify-end items-center gap-3`}>
                                                <div className="custom-dropdown inline-flex">
                                                    <div>
                                                        <button type="button" className="custom-dropdown--toggle_v2"
                                                                id="menu-button"
                                                                aria-expanded="true" aria-haspopup="true">
                                                            <svg width="15" height="4" viewBox="0 0 15 4" fill="none"
                                                                 xmlns="http://www.w3.org/2000/svg">
                                                                <rect y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="6" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="12" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="dropdown-menu" role="menu"
                                                         aria-orientation="vertical"
                                                         aria-labelledby="menu-button" tabIndex={-1}>
                                                        <div className="py-1" role="none">
                                                            <a href="#" role="menuitem" tabIndex={-1} id="menu-item-0">Open
                                                                Project</a>
                                                            <a href="#" role="menuitem" tabIndex={-1}
                                                               id="menu-item-1">Transaction</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            <div className="flex items-center">
                                                <img src="https://picsum.photos/id/80/56/56"
                                                     className={`hidden md:flex mr-3 rounded-xl size-[36px]`} alt=""/>
                                                Example Project
                                            </div>

                                        </th>
                                        <td className={`text-secondary`}>Cancelled</td>
                                        <td>$10,000</td>
                                        <td>25 Feb 2025</td>
                                        <td className={`text-right`}>
                                            <div className={`flex justify-end items-center gap-3`}>
                                                <a href="#" className={`btn btn-primary`}>Refund</a>
                                                <div className="custom-dropdown inline-flex">
                                                    <div>
                                                        <button type="button" className="custom-dropdown--toggle_v2"
                                                                id="menu-button"
                                                                aria-expanded="true" aria-haspopup="true">
                                                            <svg width="15" height="4" viewBox="0 0 15 4" fill="none"
                                                                 xmlns="http://www.w3.org/2000/svg">
                                                                <rect y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="6" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="12" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="dropdown-menu" role="menu"
                                                         aria-orientation="vertical"
                                                         aria-labelledby="menu-button" tabIndex={-1}>
                                                        <div className="py-1" role="none">
                                                            <a href="#" role="menuitem" tabIndex={-1} id="menu-item-0">Open
                                                                Project</a>
                                                            <a href="#" role="menuitem" tabIndex={-1}
                                                               id="menu-item-1">Transaction</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            <div className="flex items-center">
                                                <img src="https://picsum.photos/id/80/56/56"
                                                     className={`hidden md:flex mr-3 rounded-xl size-[36px]`} alt=""/>
                                                Example Project
                                            </div>

                                        </th>
                                        <td className={`text-secondary`}>Upcoming</td>
                                        <td>$10,000</td>
                                        <td>25 Feb 2025</td>
                                        <td className={`text-right`}>
                                            <div className={`flex justify-end items-center gap-3`}>
                                                <div className="custom-dropdown inline-flex">
                                                    <div>
                                                        <button type="button" className="custom-dropdown--toggle_v2"
                                                                id="menu-button"
                                                                aria-expanded="true" aria-haspopup="true">
                                                            <svg width="15" height="4" viewBox="0 0 15 4" fill="none"
                                                                 xmlns="http://www.w3.org/2000/svg">
                                                                <rect y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="6" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="12" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="dropdown-menu" role="menu"
                                                         aria-orientation="vertical"
                                                         aria-labelledby="menu-button" tabIndex={-1}>
                                                        <div className="py-1" role="none">
                                                            <a href="#" role="menuitem" tabIndex={-1} id="menu-item-0">Open
                                                                Project</a>
                                                            <a href="#" role="menuitem" tabIndex={-1}
                                                               id="menu-item-1">Transaction</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className={`page-block mb-12`}>
                            <div className={`flex justify-between items-center mb-6`}>
                                <h2>My Orders</h2>
                                <SortBy/>
                            </div>
                            <NoItems text={`You haven’t created any orders yet.`}/>
                            <div className="responsive-table-wrapper">
                                <table>
                                    <thead>
                                    <tr>
                                        <th scope="col">Project</th>
                                        <th scope="col">Type</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Amount</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Limit</th>
                                        <th scope="col"></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <th scope="row">
                                            <div className="flex items-center">
                                                <img src="https://picsum.photos/id/80/56/56"
                                                     className={`hidden md:flex mr-3 rounded-xl size-[36px]`} alt=""/>
                                                Example Project
                                            </div>

                                        </th>
                                        <td>Sell</td>
                                        <td className={`text-highlight-orange`}>Pending</td>
                                        <td>$10,000</td>
                                        <td>$0.00120</td>
                                        <td>$0.00120</td>
                                        <td className={`text-right`}>
                                            <div className={`flex justify-end items-center gap-3`}>
                                                <a href="#" className={`btn btn-secondary`}>Manage Order</a>
                                                <div className="custom-dropdown inline-flex">
                                                    <div>
                                                        <button type="button" className="custom-dropdown--toggle_v2"
                                                                id="menu-button"
                                                                aria-expanded="true" aria-haspopup="true">
                                                            <svg width="15" height="4" viewBox="0 0 15 4" fill="none"
                                                                 xmlns="http://www.w3.org/2000/svg">
                                                                <rect y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="6" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="12" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="dropdown-menu" role="menu"
                                                         aria-orientation="vertical"
                                                         aria-labelledby="menu-button" tabIndex={-1}>
                                                        <div className="py-1" role="none">
                                                            <a href="#" role="menuitem" tabIndex={-1} id="menu-item-0">Open
                                                                Project</a>
                                                            <a href="#" role="menuitem" tabIndex={-1}
                                                               id="menu-item-1">Transaction</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            <div className="flex items-center">
                                                <img src="https://picsum.photos/id/80/56/56"
                                                     className={`hidden md:flex mr-3 rounded-xl size-[36px]`} alt=""/>
                                                Example Project
                                            </div>

                                        </th>
                                        <td>Buy</td>
                                        <td className={`text-secondary`}>Filled</td>
                                        <td>$10,000</td>
                                        <td>$0.00120</td>
                                        <td>$0.00120</td>
                                        <td className={`text-right`}>
                                            <div className={`flex justify-end items-center gap-3`}>
                                                <div className="custom-dropdown inline-flex">
                                                    <div>
                                                        <button type="button" className="custom-dropdown--toggle_v2"
                                                                id="menu-button"
                                                                aria-expanded="true" aria-haspopup="true">
                                                            <svg width="15" height="4" viewBox="0 0 15 4" fill="none"
                                                                 xmlns="http://www.w3.org/2000/svg">
                                                                <rect y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="6" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                                <rect x="12" y="0.5" width="3" height="3" rx="1.5"
                                                                      fill="#988B71"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="dropdown-menu" role="menu"
                                                         aria-orientation="vertical"
                                                         aria-labelledby="menu-button" tabIndex={-1}>
                                                        <div className="py-1" role="none">
                                                            <a href="#" role="menuitem" tabIndex={-1} id="menu-item-0">Open
                                                                Project</a>
                                                            <a href="#" role="menuitem" tabIndex={-1}
                                                               id="menu-item-1">Transaction</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

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

                <div className="container md:grid md:grid-cols-[224px_1fr] md:gap-x-10">
                    <aside>
                        <nav role={`navigation`} className={`secondary-nav`}>
                            <a href="#" className={`flex justify-between active`}><span>All</span><small>1</small></a>
                            <a href="#" className={`flex justify-between`}><span>Rust</span><small>1</small></a>
                            <a href="#"
                               className={`flex justify-between`}><span>Language #2</span><small>0</small></a>
                            <a href="#" className={`flex justify-between`}><span>Language #3</span><small>0</small></a>
                            <a href="#" className={`flex justify-between`}><span>Language #4</span><small>0</small></a>
                            <a href="#" className={`flex justify-between`}><span>Language #5</span><small>0</small></a>
                            <a href="#" className={`flex justify-between`}><span>Language #6</span><small>0</small></a>
                        </nav>
                    </aside>
                    <div className={`main-content`}>
                        <div className={`main-content--header flex justify-between items-center mb-10`}>
                            <h1 className={`main-content--title`}>Tasks</h1>
                            <SortBy/>
                        </div>
                        <CtaBox
                            title="Complete tasks to earn Money"
                            description="Lorem ipsum dolor sit amet consectetur. Dui lorem diam viverra elementum. Dui faucibus eget enim etiam bibendum vitae pulvinar risus sodales."
                        />

                        <div className={`page-block mb-10`}>
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
                                <div className={`border border-outline bg-bgSecondary p-4 rounded-xl`}>
                                    <div className={`flex items-center justify-between mb-4`}>
                                        <div>
                                            <h3 className={`flex align-middle mb-1`}>
                                                Title of the Task
                                            </h3>
                                            <p className={`text-secondary text-sm`}>Added 3 days ago</p>
                                        </div>
                                        <div>
                                            <img src="https://picsum.photos/id/2/80/80" width={40}
                                                 className={`rounded-lg border border-outline`} alt=""/>
                                        </div>
                                    </div>
                                    <ul className={`tags-list mb-4`}>
                                        <li><a href="#">Backend Development</a></li>
                                        <li><span>Rust</span></li>
                                        <li><a href="#" className={`text-secondary`}>+3</a></li>
                                    </ul>
                                    <p className={`tracking-largeSpace mb-4`}>Lorem ipsum dolor sit amet consectetur.
                                        Molestie tortor sit massa dictum enim. Facilisis vulputate elit tempus nunc enim
                                        est. Ipsum ut massa massa congue nisl. </p>
                                    <div className={`flex flex-col sm:flex-row gap-3`}>
                                        <a href="#" className={`flex-1 btn btn-secondary`}>View Project</a>
                                        <a href="#" className={`flex-1 btn btn-secondary`}>Bid for Task</a>
                                    </div>
                                </div>
                                <div className={`border border-outline bg-bgSecondary p-4 rounded-xl`}>
                                    <div className={`flex items-center justify-between mb-4`}>
                                        <div>
                                            <h3 className={`flex align-middle mb-1`}>
                                                Title of the Task 2
                                            </h3>
                                            <p className={`text-secondary text-sm`}>Added 4 days ago</p>
                                        </div>
                                        <div>
                                            <img src="https://picsum.photos/id/2/80/80" width={40}
                                                 className={`rounded-lg border border-outline`} alt=""/>
                                        </div>
                                    </div>
                                    <ul className={`tags-list mb-4`}>
                                        <li><a href="#">Backend Development</a></li>
                                        <li><span>Rust</span></li>
                                        <li><a href="#" className={`text-secondary`}>+3</a></li>
                                    </ul>
                                    <p className={`tracking-largeSpace mb-4`}>Lorem ipsum dolor sit amet consectetur.
                                        Molestie tortor sit massa dictum enim. Facilisis vulputate elit tempus nunc enim
                                        est. Ipsum ut massa massa congue nisl. </p>
                                    <div className={`flex flex-col sm:flex-row gap-3`}>
                                        <a href="#" className={`flex-1 btn btn-secondary`}>View Project</a>
                                        <a href="#" className={`flex-1 btn btn-secondary`}>Bid for Task</a>
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
