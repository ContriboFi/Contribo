'use client';

export type ListHeaderProps = {
    orderField: string | null;
    orderDirection: string | null;
    setOrderField: (value: string | null) => void;
    setOrderDirection: (value: string | null) => void;
}

export default function ListHeader({orderField, orderDirection, setOrderField, setOrderDirection}: ListHeaderProps) {

    const orderIcon = (orderDirection: string | null) => {
        if (orderDirection === 'desc') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none"
                     className="mr-2 mt-1.5">
                    <path d="M9.5 5.25L6 9.33333L2.5 5.25" stroke="#212121" stroke-width="1.16667"
                          stroke-linecap="round"
                          stroke-linejoin="round"/>
                </svg>);
        }
        if (orderDirection === 'asc') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none"
                     transform="scale(1 -1)" className="mr-2 mt-1.5">
                    <path d="M9.5 5.25L6 9.33333L2.5 5.25" stroke="#212121" stroke-width="1.16667"
                          stroke-linecap="round"
                          stroke-linejoin="round"/>
                </svg>);
        }
    }

    const onTitleClick = (field: string) => {
        if (orderField === field) {
            if (orderDirection === 'asc') {
                setOrderDirection('desc');
            } else {
                setOrderDirection('asc');
            }
        } else {
            setOrderField(field);
            setOrderDirection('asc');
        }
    };

    return (
        <div className="flex flex-row w-full  p-3">
            <div className="flex w-2/12 font-semibold text-xl cursor-pointer"
                 onClick={() => onTitleClick('project')}>{orderField === 'project' && orderIcon(orderDirection)} Project
            </div>
            <div className="flex w-2/12 font-semibold text-xl cursor-pointer"
                 onClick={() => onTitleClick('pledge')}>{orderField === 'pledge' && orderIcon(orderDirection)}Pledge
            </div>
            <div className="flex w-2/12 font-semibold text-xl cursor-pointer"
                 onClick={() => onTitleClick('stage')}>{orderField === 'stage' && orderIcon(orderDirection)} Stage
            </div>
            <div className="flex w-2/12 font-semibold text-xl cursor-pointer"
                 onClick={() => onTitleClick('withdraw')}>{orderField === 'withdraw' && orderIcon(orderDirection)} Withdraw
            </div>
            <div className="flex w-1/12 font-semibold text-xl cursor-pointer"
                 onClick={() => onTitleClick('vote')}>{orderField === 'vote' && orderIcon(orderDirection)} Vote
            </div>
            <div className="flex w-2/12 font-semibold text-xl cursor-pointer"
                 onClick={() => onTitleClick('nextClaim')}>{orderField === 'nextClaim' && orderIcon(orderDirection)} Next
                Claim
            </div>
            <div className="flex w-1/12 font-semibold text-xl cursor-pointer"
                 onClick={() => onTitleClick('claim')}>{orderField === 'claim' && orderIcon(orderDirection)} Claim
            </div>
        </div>
    )
}