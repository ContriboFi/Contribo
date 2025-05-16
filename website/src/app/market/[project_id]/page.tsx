'use client';

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {EnumTabs} from "@/app/type/EnumTabs";
import React, {useState} from "react";
import NewOrderModal from "@/app/market/[project_id]/NewOrderModal";


export default function Home() {

    const [open, setOpen] = useState(false);

    return (
        <div className="grid grid-rows-[72px_1fr_40px] gap-y-12 justify-items-center min-h-screen">
            <Header activeTab={EnumTabs.MARKET}/>
            <main className="w-full" id="main">

                <div className="container">
                    <div className={`main-content`}>


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
                                    <a onClick={()=>setOpen(true)} className={`btn btn-primary`}>New Order</a>
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
                <NewOrderModal open={open} onClose={()=>setOpen(false)} />

            </main>
            <Footer/>
        </div>
    );
}
