"use client";

import Link from "next/link";

import styles from "@/styles/header.module.scss";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {EnumTabs} from "@/app/type/EnumTabs";

export type HeaderProps = {
    activeTab: EnumTabs;
}

export default function Header(props: HeaderProps) {
    return (
        <header
            className={`sticky top-0 bg-white w-full ${styles.header} rounded-md`}
        >
            <div className="container-lg">
                <div className={`flex items-center justify-between pl-3 `}>
                    <div className={`flex items-center menu_items`}>
                        <Link href="/home" className={`p-3  ${props.activeTab === EnumTabs.HOME?'menu_items__active':''}`}>
                            Home
                        </Link>
                        <Link href="/" className={`p-3 pl-4 ${props.activeTab === EnumTabs.CAMPAIGNS?'menu_items__active':''}`}>
                            Active campaigns
                        </Link>
                        <Link href="/myactivity" className={`p-3 pl-4 ${props.activeTab === EnumTabs.MY_ACTIVITY?'menu_items__active':''}`}>
                            My activities
                        </Link>
                        <Link href="/feed" className={`p-3 pl-4 ${props.activeTab === EnumTabs.FEED?'menu_items__active':''}`}>
                            Feed
                        </Link>
                    </div>
                    <div className="flex items-end right_menu">
                        <Link href="/">
                            <div className="right_menu__circle mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19"
                                     fill="none" className="right_menu__circle__svg">
                                    <path
                                        d="M3.00073 14.8587V13.3587H4.50073V8.10867C4.50073 7.07117 4.81323 6.1493 5.43823 5.34305C6.06323 4.5368 6.87573 4.00867 7.87573 3.75867V3.23367C7.87573 2.92117 7.98511 2.65555 8.20386 2.4368C8.42261 2.21805 8.68823 2.10867 9.00073 2.10867C9.31323 2.10867 9.57886 2.21805 9.79761 2.4368C10.0164 2.65555 10.1257 2.92117 10.1257 3.23367V3.75867C11.1257 4.00867 11.9382 4.5368 12.5632 5.34305C13.1882 6.1493 13.5007 7.07117 13.5007 8.10867V13.3587H15.0007V14.8587H3.00073ZM9.00073 17.1087C8.58823 17.1087 8.23511 16.9618 7.94136 16.668C7.64761 16.3743 7.50073 16.0212 7.50073 15.6087H10.5007C10.5007 16.0212 10.3539 16.3743 10.0601 16.668C9.76636 16.9618 9.41323 17.1087 9.00073 17.1087ZM6.00073 13.3587H12.0007V8.10867C12.0007 7.28367 11.707 6.57742 11.1195 5.98992C10.532 5.40242 9.82573 5.10867 9.00073 5.10867C8.17573 5.10867 7.46948 5.40242 6.88198 5.98992C6.29448 6.57742 6.00073 7.28367 6.00073 8.10867V13.3587Z"
                                        fill="white"/>
                                </svg>
                            </div>
                        </Link>
                        <Link href={"/"}>
                            <WalletMultiButton style={{
                                borderRadius: "6px",
                                background: "#FEA31B",
                                height: "28px",
                                color: "#FFF",
                                fontFamily: "Inter, serif",
                                fontSize: "12px",
                                fontStyle: "normal",
                                fontWeight: 600,
                                lineHeight: "28px",
                                letterSpacing: "0.24px"
                            }} />
                        </Link>
                        <Link href="/">
                            <div className="right_menu__circle right_menu__circle_grey">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
                                     fill="none" className="right_menu__circle__svg">
                                    <path
                                        d="M9.63511 16.915C7.68135 16.915 6.02065 16.2312 4.65302 14.8636C3.28538 13.4959 2.60156 11.8352 2.60156 9.88145C2.60156 7.92769 3.28538 6.26699 4.65302 4.89935C6.02065 3.53172 7.68135 2.8479 9.63511 2.8479C9.81747 2.8479 9.99656 2.85441 10.1724 2.86744C10.3482 2.88046 10.5208 2.9 10.6901 2.92605C10.1561 3.30378 9.72955 3.79548 9.41043 4.40114C9.09132 5.00681 8.93176 5.66132 8.93176 6.36468C8.93176 7.53693 9.34205 8.53335 10.1626 9.35394C10.9832 10.1745 11.9796 10.5848 13.1519 10.5848C13.8683 10.5848 14.526 10.4253 15.1252 10.1061C15.7243 9.78702 16.2128 9.36045 16.5905 8.82642C16.6166 8.99575 16.6361 9.16833 16.6491 9.34417C16.6622 9.52001 16.6687 9.6991 16.6687 9.88145C16.6687 11.8352 15.9848 13.4959 14.6172 14.8636C13.2496 16.2312 11.5889 16.915 9.63511 16.915ZM9.63511 15.352C10.7813 15.352 11.8103 15.0361 12.7221 14.4044C13.6338 13.7727 14.2981 12.9489 14.7149 11.9329C14.4544 11.998 14.1939 12.0501 13.9334 12.0892C13.6729 12.1283 13.4124 12.1478 13.1519 12.1478C11.5498 12.1478 10.1854 11.5845 9.05875 10.4578C7.93208 9.33114 7.36875 7.96676 7.36875 6.36468C7.36875 6.10417 7.38829 5.84367 7.42736 5.58317C7.46644 5.32267 7.51854 5.06217 7.58366 4.80166C6.5677 5.21847 5.74387 5.88275 5.11215 6.7945C4.48043 7.70626 4.16457 8.73524 4.16457 9.88145C4.16457 11.3924 4.6986 12.6818 5.76666 13.7499C6.83472 14.818 8.1242 15.352 9.63511 15.352Z"
                                        fill="white"/>
                                </svg>
                            </div>
                        </Link>
                        <Link href="/" className={'pr-4'}>
                            <div className="right_menu__circle ">
                                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19"
                                     fill="none" className="right_menu__circle__svg">
                                    <rect x="1.60958" y="1.37911" width="16.2553" height="16.2553" stroke="#FEA31B"
                                          strokeWidth="1.25041"/>
                                    <path
                                        d="M15.2771 16.0707L10.6818 11.4754C10.3171 11.7672 9.89771 11.9982 9.4236 12.1684C8.94948 12.3386 8.44498 12.4237 7.91008 12.4237C6.58499 12.4237 5.46353 11.9648 4.5457 11.0469C3.62786 10.1291 3.16895 9.00763 3.16895 7.68254C3.16895 6.35745 3.62786 5.23599 4.5457 4.31816C5.46353 3.40032 6.58499 2.94141 7.91008 2.94141C9.23517 2.94141 10.3566 3.40032 11.2745 4.31816C12.1923 5.23599 12.6512 6.35745 12.6512 7.68254C12.6512 8.21744 12.5661 8.72194 12.3959 9.19606C12.2257 9.67017 11.9948 10.0896 11.703 10.4543L16.2982 15.0495L15.2771 16.0707ZM7.91008 10.9649C8.82184 10.9649 9.59683 10.6458 10.2351 10.0075C10.8733 9.36929 11.1924 8.5943 11.1924 7.68254C11.1924 6.77078 10.8733 5.99579 10.2351 5.35756C9.59683 4.71933 8.82184 4.40022 7.91008 4.40022C6.99832 4.40022 6.22333 4.71933 5.5851 5.35756C4.94687 5.99579 4.62776 6.77078 4.62776 7.68254C4.62776 8.5943 4.94687 9.36929 5.5851 10.0075C6.22333 10.6458 6.99832 10.9649 7.91008 10.9649Z"
                                        fill="white"/>
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}