"use client";

import styles from "@/styles/modal.module.scss";
import Image from "next/image";
import React from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";

export type ModalProps = {
    title: string;
    image: string;
    deadline: string;
    total: number;
    imageBackground: string;
    onClose: () => void;
}

export default function Modal(props: ModalProps) {
    const [amount, setAmount] = React.useState(0);

    const {publicKey} = useWallet();

    return (
        <>
            <div className={`absolute flex z-10 w-full h-full justify-center  ${styles.modal}`} onClick={(e) => {
                e.stopPropagation();
                props.onClose();
            }}>
                <div className={`${styles.content} z-11`}>
                    <div style={{backgroundColor: '#FFFFFF'}} className={"rounded-t-xl relative"}>
                        <div style={{backgroundColor: props.imageBackground}}
                             className={`w-full rounded-xl ${styles.mainImage} flex justify-center items-center`}>
                            <Image src={props.image} alt={props.title} width={136} height={149} className={''}/>
                        </div>
                        <div className={"absolute z-12 top-0 right-0"}>
                            <button type="button"
                                    className="text-white font-medium rounded-full text-xs p-2 text-center inline-flex items-center -mr-1 -mt-1" style={{backgroundColor: '#FEA31B'}}>
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col p-4 relative" style={{backgroundColor: '#FFFFFF'}} onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}>
                        <div className="flex flex-row pb-4">
                            <div className={`basis-1/4 ${styles.stepLabel}`}>Pledge live</div>
                            <div className={`basis-1/4 ${styles.stepLabel}`}>Contributors</div>
                            <div className={`basis-1/4 ${styles.stepLabel}`}>Research</div>
                            <div className={`basis-1/4 ${styles.stepLabel}`}>Goals</div>
                        </div>
                        <div className="flex flex-row pb-4 justify-center">
                            <Image src={'/images/progress-step.png'} alt={'progress step'} width={299} height={22}/>
                        </div>
                        <div className="flex flex-row pb-4 justify-center">
                            <p className={styles.detailsText}>The best decentralized trading platform & largest DAO
                                in
                                crypto. Let’s accelerate the meta
                                together . . .</p>
                        </div>
                        <div className="flex flex-row pb-4 justify-center">
                            <a className={styles.linkText}>read full</a>
                        </div>
                        <div className="flex flex-row pb-4 justify-center">
                            <input type={'number'} className={`${styles.inputNumber} w-full`}
                                   placeholder={'Enter amount'} onChange={(e) => {
                                setAmount(parseInt(e.target.value));
                            }}/>
                        </div>
                        <div className={`flex flex-row pb-4 justify-center ${styles.detailsText}`}>
                            <input type={'checkbox'} className={`${styles.inputCheckbox} mr-4`}/> By clicking, I
                            agree
                            to the rules and conditions
                        </div>
                        <div className="flex flex-row">
                            <div
                                className={`${styles.pledgeButton} w-full`}>{amount ? 'Not real money - only for demo' : 'Pledge'}</div>
                        </div>
                        {!publicKey && (
                            <div className={`flex justify-center items-center absolute z-12 w-full h-full top-0 left-0 p-20 ${styles.overlay} backdrop-blur`}>

                                <WalletMultiButton
                                    style={{
                                        borderRadius: "5px",
                                        background: "#FEA31B",
                                        height: "38px",
                                        color: "#FFF",
                                        fontFamily: "Inter, serif",
                                        fontSize: "12px",
                                        fontStyle: "normal",
                                        fontWeight: 600,
                                        lineHeight: "38px",
                                        textAlign: "center",
                                        cursor: "pointer",
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div id='overlay' className={'absolute w-full h-full '}></div>
        </>
    );
}