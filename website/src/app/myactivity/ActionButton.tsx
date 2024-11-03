'use client';

export type ActionButtonProps = {
    text: string;
    onClick: () => void;
    state: "active"|"not active";
    isClaim?: boolean;
}

export default function ActionButton({text, onClick, state, isClaim}: ActionButtonProps) {
    const buttonActive = state === "active" ? "buttonActive" : "buttonInactive";
    const claimActive = isClaim ? (state === "active" ?"claimActive" : "claimInactive"):"";
    const claimDotColor = isClaim ? (state === "active" ?"#56C07F" : "#B0B0B0"):"";

    return (
        <div className={`buttonBackground rounded-xl pt-1.5 pb-1.5 pl-3 pr-3 ${buttonActive} ${claimActive}`} onClick={()=>onClick()}>{isClaim && (
            <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-1">
                <circle cx="3" cy="3" r="3" fill={`${claimDotColor}`}/>
            </svg>
        )}{text}</div>
    )
}