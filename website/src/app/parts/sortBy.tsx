"use client";
import React from "react";

export default function SortBy()
{
    const [dropClass, setDropClass] = React.useState("");
    const toggleSortDrop = () => {
        if(dropClass === ""){
            setDropClass("open-dropdown");
        }else{
            setDropClass("");
        }
    }
    return (
        <div className={`custom-dropdown ${dropClass}`}>
            <div>
                <button type="button" className="custom-dropdown--toggle" id="menu-button"
                        aria-expanded="true" aria-haspopup="true" onClick={toggleSortDrop}>
                    <span className={`hidden sm:block`}>Sort by</span>
                    <span className={`sm:hidden`}>Sort</span>
                </button>
            </div>
            <div className="dropdown-menu" role="menu" aria-orientation="vertical"
                 aria-labelledby="menu-button" tabIndex={-1}>
                <div className="py-1 text-nowrap" role="none">
                    <a href="#" role="menuitem" tabIndex={-1} id="menu-item-0"
                       className={`active`}>Alphabetical</a>
                    <a href="#" role="menuitem" tabIndex={-1} id="menu-item-1">Highest Value</a>
                    <a href="#" role="menuitem" tabIndex={-1} id="menu-item-2">Lowest Value</a>
                    <a href="#" role="menuitem" tabIndex={-1} id="menu-item-3">Deposit Amount</a>
                    <a href="#" role="menuitem" tabIndex={-1} id="menu-item-4">Next Claim Date</a>
                    <a href="#" role="menuitem" tabIndex={-1} id="menu-item-5">Status</a>
                </div>
            </div>
        </div>
    )
}