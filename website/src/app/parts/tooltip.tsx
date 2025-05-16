import React from "react";

export interface TooltipProps {
    text: string;
}
export default function Tooltip(props: TooltipProps)
{
    if(props.text) {
        return (
            <div className="tooltip ml-1">
                <button data-popover-target="popover-description"
                        data-popover-placement="bottom-end" type="button">
                    <img src="/images/company-icon.svg" alt=""/>
                    <span className="sr-only">Show information</span></button>
                <div data-popover id="popover-description" role="tooltip"
                     className="tooltip-box">
                    <p className={`m-0`} dangerouslySetInnerHTML={{__html: props.text}}></p>
                    <div data-popper-arrow></div>
                </div>
            </div>
        )
    }
}