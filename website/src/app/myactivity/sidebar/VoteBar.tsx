export type VoteBarProps = {
    left: number;
    right: number;
}

export default function VoteBar({left, right}: VoteBarProps) {
    return (

        <div className="flex flex-col w-full">
            <div className="flex flex-row">
                <div className=" text-green-500 text-[10px]">{left}%</div>
                <div className="text-right w-full text-red-500 text-[10px]">{right}%</div>
            </div>
            <div className="flex flex-row w-full h-[5px]">
                <div className={`flex h-full bg-green-500 basis-[${left}%]`} style={{width: `${left}%`}}></div>
                <div className={`flex h-full bg-red-500 basis-[${right}%]`} style={{width: `${right}%`}}></div>
            </div>
        </div>
    );
}