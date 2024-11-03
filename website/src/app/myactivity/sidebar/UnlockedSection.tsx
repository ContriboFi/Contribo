import styles from "@/styles/unlocked.module.scss";
import React from "react";

export type UnlockedSectionProps = {
    unlocked: number;
}


export default function UnlockedSection({unlocked}: UnlockedSectionProps) {
    return(
        <div className="flex w-full flex-col">
            <div className={`${styles.progressLabel}`}>Unlocked: <span className={`${styles.unlockLabel}`}>{unlocked}%</span></div>
            <div className="flex flex-row pt-2">
                {unlocked !== 100 && (
                    <div className={`w-full ${styles.progressContainer}`}>
                        <div className={`${styles.progressFill}`} style={{width: `${unlocked}%`}}>
                        </div>
                    </div>
                )}
                {unlocked === 100 && (
                    <div className={`w-full ${styles.progressCompleted}`}>
                        Completed
                    </div>
                )}
            </div>
        </div>
    );
}