import styles from "@/styles/modal.module.scss";
import React from "react";

export default function AmountInput() {
    return (
        <div className="flex w-full">
            <input type={'number'} className={`${styles.inputNumber} w-full`}
                   placeholder={'Enter amount'} onChange={(e) => {
                console.log(e.target.value);
                // setAmount(parseInt(e.target.value));
            }}/>
            <div className={`${styles.inputMaxDiv} p-2`}>{'/'}&nbsp;Max</div>
        </div>
    );
}