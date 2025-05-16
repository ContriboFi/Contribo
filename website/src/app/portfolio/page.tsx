'use client';

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {EnumTabs} from "@/app/type/EnumTabs";
import NoItems from "@/app/parts/NoItems";
import SortBy from "@/app/parts/sortBy";
import VerticalCard from "@/app/parts/VerticalCard";
import React from "react";


export default function Home() {
    const [contibutionView, setContibutionView] = React.useState('grid');
    return (
        <div className="grid grid-rows-[72px_1fr_40px] gap-y-12 justify-items-center min-h-screen">
            <Header activeTab={EnumTabs.CAMPAIGNS}/>
            <main className="w-full" id="main">


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
                                        <button type="button" className={`grid-btn ${contibutionView === 'grid'?'active':''}`} aria-label={`Grid view`} onClick={() => setContibutionView('grid')}>
                                            <svg width="17" height="18" viewBox="0 0 17 18" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <rect y="0.5" width="7" height="7" rx="2" fill="#988B71"/>
                                                <rect x="10" y="0.5" width="7" height="7" rx="2" fill="#988B71"/>
                                                <rect y="10.5" width="7" height="7" rx="2" fill="#988B71"/>
                                                <rect x="10" y="10.5" width="7" height="7" rx="2" fill="#988B71"/>
                                            </svg>
                                        </button>
                                        <button type="button" className={`list-btn ${contibutionView === 'list'?'active':''}`} aria-label={`List view`} onClick={() => setContibutionView('list')}>
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
                            {contibutionView === 'grid' && (
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
                                    title="Example Project"
                                    status="active"
                                    contribution="$1,500"
                                    nextClaimDate="Apr 5, 2025"
                                />
                                <VerticalCard
                                    variant="detailed"
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
                                )}
                            {contibutionView === 'list' && (
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
                                )}
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


            </main>
            <Footer/>
        </div>
    );
}
