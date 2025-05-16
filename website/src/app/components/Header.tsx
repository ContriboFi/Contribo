"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";

import styles from "@/styles/header.module.scss";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {EnumTabs} from "@/app/type/EnumTabs";

export type HeaderProps = {
    activeTab: EnumTabs;
}

export default function Header(props: HeaderProps)  {
    const [menuClass, setMenuClass] = React.useState("");
    const toggleBurgerMenu = () => {
        if(menuClass === ""){
            setMenuClass("open-nav");
        }else{
            setMenuClass("");
        }
    }

    return (
        <header className={`sticky z-50 top-0 bg-background w-full py-4 px-2 ${styles.header}`}>
            <div className="container flex items-center">
                <div className="mr-6">
                    <Link href="#">
                        <Image
                            src="/images/logo.svg"
                            alt="Contribo"
                            width={32}
                            height={32}
                        />
                    </Link>
                </div>
                <div className={`hidden flex-1 md:flex items-center justify-between p-2 md:p-0 ${menuClass}`}>
                    <nav className={`flex flex-col md:flex-row items-start md:items-center ${styles.main_nav}`} role="navigation">
                        <Link href="/explore/all"
                              className={`px-2 py-3 md:px-3 md:py-2 md:mr-1 max-md:w-full rounded-lg ${props.activeTab === EnumTabs.EXPLORE ? 'menu_items__active' : ''}`}>
                            Explore
                        </Link>
                        <Link href="/portfolio"
                              className={`px-2 py-3 md:px-3 md:py-2 md:mr-1 max-md:w-full rounded-lg ${props.activeTab === EnumTabs.CAMPAIGNS ? 'menu_items__active' : ''}`}>
                            Portfolio
                        </Link>
                        <Link href="/market"
                              className={`px-2 py-3 md:px-3 md:py-2 md:mr-1 max-md:w-full rounded-lg ${props.activeTab === EnumTabs.MARKET ? 'menu_items__active' : ''}`}>
                            Market
                        </Link>
                        <Link href="/myactivity"
                              className={`px-2 py-3 md:px-3 md:py-2 md:mr-1 max-md:w-full rounded-lg ${props.activeTab === EnumTabs.MY_ACTIVITY ? 'menu_items__active' : ''}`}>
                            Tasks
                        </Link>
                        <Link href="/hub"
                              className={`px-2 py-3 md:px-3 md:py-2 md:mr-1 max-md:w-full rounded-lg ${props.activeTab === EnumTabs.PARTNER_HUB ? 'menu_items__active' : ''}`}>
                            Partner Hub
                        </Link>
                    </nav>
                    <div className="hidden md:flex items-end right_menu">
                        {/*<Link href="/">*/}
                        {/*    <div className="right_menu__circle mr-2">*/}
                        {/*        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19"*/}
                        {/*             fill="none" className="right_menu__circle__svg">*/}
                        {/*            <path*/}
                        {/*                d="M3.00073 14.8587V13.3587H4.50073V8.10867C4.50073 7.07117 4.81323 6.1493 5.43823 5.34305C6.06323 4.5368 6.87573 4.00867 7.87573 3.75867V3.23367C7.87573 2.92117 7.98511 2.65555 8.20386 2.4368C8.42261 2.21805 8.68823 2.10867 9.00073 2.10867C9.31323 2.10867 9.57886 2.21805 9.79761 2.4368C10.0164 2.65555 10.1257 2.92117 10.1257 3.23367V3.75867C11.1257 4.00867 11.9382 4.5368 12.5632 5.34305C13.1882 6.1493 13.5007 7.07117 13.5007 8.10867V13.3587H15.0007V14.8587H3.00073ZM9.00073 17.1087C8.58823 17.1087 8.23511 16.9618 7.94136 16.668C7.64761 16.3743 7.50073 16.0212 7.50073 15.6087H10.5007C10.5007 16.0212 10.3539 16.3743 10.0601 16.668C9.76636 16.9618 9.41323 17.1087 9.00073 17.1087ZM6.00073 13.3587H12.0007V8.10867C12.0007 7.28367 11.707 6.57742 11.1195 5.98992C10.532 5.40242 9.82573 5.10867 9.00073 5.10867C8.17573 5.10867 7.46948 5.40242 6.88198 5.98992C6.29448 6.57742 6.00073 7.28367 6.00073 8.10867V13.3587Z"*/}
                        {/*                fill="white"/>*/}
                        {/*        </svg>*/}
                        {/*    </div>*/}
                        {/*</Link>*/}
                        <form>
                            <div className="flex relative">
                                <div className={`mr-3`}>
                                    <label className="sr-only" htmlFor="search">Search</label>
                                    <input type="text" className={`search-input`} name={"s"} placeholder="Search" id="search"/>
                                </div>
                                <button type="submit" className={`search-btn absolute`} aria-label={"Search"}></button>
                            </div>
                        </form>
                        {/*<Link href={"/"} className={`btn btn-primary`}>Connect</Link>*/}
                        <WalletMultiButton
                            style={{
                                background: "var(--color-highlight-gradient)",
                                boxShadow: "0 1px 4px 0 rgba(230, 108, 36, 0.2)",
                                border: "1px solid rgba(0, 0, 0, 0.04)",
                                color: "#fff",
                                fontWeight: "500",
                                lineHeight: "1",
                                letterSpacing: "-0.13px",
                                textAlign: "center",
                                padding: "10px 12px 9px",
                                borderRadius: "8px",
                                whiteSpace: "nowrap",
                                transition: "all 0.25s ease-in-out",
                                fontSize: "0.9375rem",
                                display: "inline-flex",
                                cursor: "pointer"
                            }}
                        />
                        {/*<Link href="/">*/}
                        {/*    <div className="right_menu__circle right_menu__circle_grey">*/}
                        {/*        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"*/}
                        {/*             fill="none" className="right_menu__circle__svg">*/}
                        {/*            <path*/}
                        {/*                d="M9.63511 16.915C7.68135 16.915 6.02065 16.2312 4.65302 14.8636C3.28538 13.4959 2.60156 11.8352 2.60156 9.88145C2.60156 7.92769 3.28538 6.26699 4.65302 4.89935C6.02065 3.53172 7.68135 2.8479 9.63511 2.8479C9.81747 2.8479 9.99656 2.85441 10.1724 2.86744C10.3482 2.88046 10.5208 2.9 10.6901 2.92605C10.1561 3.30378 9.72955 3.79548 9.41043 4.40114C9.09132 5.00681 8.93176 5.66132 8.93176 6.36468C8.93176 7.53693 9.34205 8.53335 10.1626 9.35394C10.9832 10.1745 11.9796 10.5848 13.1519 10.5848C13.8683 10.5848 14.526 10.4253 15.1252 10.1061C15.7243 9.78702 16.2128 9.36045 16.5905 8.82642C16.6166 8.99575 16.6361 9.16833 16.6491 9.34417C16.6622 9.52001 16.6687 9.6991 16.6687 9.88145C16.6687 11.8352 15.9848 13.4959 14.6172 14.8636C13.2496 16.2312 11.5889 16.915 9.63511 16.915ZM9.63511 15.352C10.7813 15.352 11.8103 15.0361 12.7221 14.4044C13.6338 13.7727 14.2981 12.9489 14.7149 11.9329C14.4544 11.998 14.1939 12.0501 13.9334 12.0892C13.6729 12.1283 13.4124 12.1478 13.1519 12.1478C11.5498 12.1478 10.1854 11.5845 9.05875 10.4578C7.93208 9.33114 7.36875 7.96676 7.36875 6.36468C7.36875 6.10417 7.38829 5.84367 7.42736 5.58317C7.46644 5.32267 7.51854 5.06217 7.58366 4.80166C6.5677 5.21847 5.74387 5.88275 5.11215 6.7945C4.48043 7.70626 4.16457 8.73524 4.16457 9.88145C4.16457 11.3924 4.6986 12.6818 5.76666 13.7499C6.83472 14.818 8.1242 15.352 9.63511 15.352Z"*/}
                        {/*                fill="white"/>*/}
                        {/*        </svg>*/}
                        {/*    </div>*/}
                        {/*</Link>*/}
                    </div>
                    <nav className={`flex flex-col md:hidden ${styles.main_nav}`}>
                        <hr className={`mx-2 my-4`}/>
                        <Link href="" target={`_blank`}
                              className={`px-2 py-3 md:px-3 md:py-2 max-md:w-full rounded-lg`}>
                            X (Twitter)
                        </Link>
                        <Link href="" target={`_blank`}
                              className={`px-2 py-3 md:px-3 md:py-2 max-md:w-full rounded-lg`}>
                            Contact
                        </Link>
                    </nav>
                </div>
                <div className={`flex items-center ml-auto md:hidden gap-3`}>
                    <a href="#" className={`btn btn-primary`}>Connect</a>
                    <button type="button" onClick={toggleBurgerMenu} className={`nav-toggle-btn ${menuClass}`}>
                        <svg className={`show`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" fill="white"/>
                            <rect x="9" y="11" width="14" height="2" rx="1" fill="#2B323B"/>
                            <rect x="9" y="19" width="14" height="2" rx="1" fill="#2B323B"/>
                        </svg>

                        <svg className={`close`} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" fill="white"/>
                            <rect x="11.7578" y="11.3433" width="14" height="2" rx="1"
                                  transform="rotate(45 11.7578 11.3433)" fill="#2B323B"/>
                            <rect x="21.6572" y="12.7573" width="14" height="2" rx="1"
                                  transform="rotate(135 21.6572 12.7573)" fill="#2B323B"/>
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}