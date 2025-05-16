import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {EnumTabs} from "@/app/type/EnumTabs";
import SortBy from "@/app/parts/sortBy";
import Tooltip from "@/app/parts/tooltip";
import React from "react";
import CtaBox from "@/app/parts/CtaBox";


export default function Home() {
    return (
        <div className="grid grid-rows-[72px_1fr_40px] gap-y-12 justify-items-center min-h-screen">
            <Header activeTab={EnumTabs.MARKET}/>
            <main className="w-full" id="main">
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
                                            <a href="/market/123">Example Project</a>
                                            <Tooltip
                                                text={`This is an official project that has an agreement between the project owners and Contribo.`}/>

                                        </div>

                                    </th>
                                    <td>$0.00120</td>
                                    <td>$0.00120</td>
                                    <td>$11,000</td>
                                    <td className={`text-right`}><a href="/market/123"
                                                                    className={`btn btn-secondary`}>Trade</a></td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <div className="flex items-center">
                                            <img src="https://picsum.photos/id/2/56/56"
                                                 className={`hidden md:flex mr-3 rounded-xl size-[36px]`} alt=""/>
                                            <a href="/market/123">Example Project</a>
                                            <Tooltip
                                                text={`This is an official project that has an agreement between the project owners and Contribo.`}/>
                                        </div>

                                    </th>
                                    <td>$0.00120</td>
                                    <td>$0.00120</td>
                                    <td>$9,000</td>
                                    <td className={`text-right`}><a href="/market/123"
                                                                    className={`btn btn-secondary`}>Trade</a></td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <div className="flex items-center">
                                            <img src="https://picsum.photos/id/2/56/56"
                                                 className={`hidden md:flex mr-3 rounded-xl size-[36px]`} alt=""/>
                                            <a href="/market/123">Example Project</a>
                                            <Tooltip
                                                text={`This is an official project that has an agreement between the project owners and Contribo.`}/>
                                        </div>

                                    </th>
                                    <td>$0.01120</td>
                                    <td>$0.00120</td>
                                    <td>$25,000</td>
                                    <td className={`text-right`}><a href="/market/123"
                                                                    className={`btn btn-secondary`}>Trade</a></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
