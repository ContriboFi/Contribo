import React from "react";

export interface NoItemsProps {
    text: string;
}
export default function NoItems(props: NoItemsProps)
{
    if(props.text) {
        return (
            <div
                className={`border border-outline text-secondary rounded-xl px-3 py-6 text-center text-sm`}>
                <p className={`m-0`} dangerouslySetInnerHTML={{__html: props.text}}></p>
            </div>
        )
    }
}