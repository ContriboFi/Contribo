import Link from 'next/link';
import Tooltip from "@/app/parts/tooltip";

interface VerticalCardProps {
    link?: string;
    imageSrc?: string;
    title: string;
    category?: string;
    tooltipText?: string;
    variant?: 'default' | 'detailed';
    status?: 'active' | 'completed';
    contribution?: string;
    nextClaimDate?: string;
}

const CardContent = ({
                         imageSrc,
                         title,
                         category,
                         tooltipText,
                         variant,
                         status,
                         contribution,
                         nextClaimDate
                     }: Omit<VerticalCardProps, 'link'>) => (
    <>
        <figure className="h-[170px] rounded-t-xl border-b border-outline flex items-center justify-center overflow-hidden">
            <img
                src={imageSrc}
                width={imageSrc === '/images/no-image.png' ? 72 : 235}
                className={imageSrc === '/images/no-image.png' ? '' : 'object-cover size-full'}
                alt={title}
            />
        </figure>

        <div className={`bg-bgSecondary p-5 rounded-b-xl ${variant === 'detailed' ? 'flex-1' : ''}`}>
            <h3 className="flex items-center dark:text-white mb-1">
                {title}
                {tooltipText && <Tooltip text={tooltipText} />}
            </h3>

            {variant === 'default' && category && (
                <p className="text-secondary dark:text-white/50 text-sm">{category}</p>
            )}

            {variant === 'detailed' && (
                <ul className="text-sm">
                    <li className="flex justify-between items-center py-2">
                        <span className="text-secondary dark:text-white/50 tracking-[-0.13px]">Status</span>
                        {status === 'active' && (
                            <span className="text-right font-medium text-highlight-orange">Active</span>
                        )}
                        {status === 'completed' && (
                            <span className="text-right font-medium text-secondary dark:text-white/50">Completed</span>
                        )}
                    </li>
                    <li className="flex justify-between items-center py-2">
                        <span className="text-secondary dark:text-white/50 tracking-[-0.13px]">Contribution</span>
                        <span className="text-right font-medium">{contribution}</span>
                    </li>
                    <li className="flex justify-between items-center py-2">
                        <span className="text-secondary dark:text-white/50 tracking-[-0.13px]">Next Claim Date</span>
                        {nextClaimDate ? (
                            <span className="text-right font-medium">{nextClaimDate}</span>
                        ) : (
                            <span className="text-right font-medium text-secondary dark:text-white/50">n/a</span>
                        )}
                    </li>
                </ul>
            )}
        </div>
    </>
);


const VerticalCard = ({
                          link,
                          imageSrc = '/images/no-image.png',
                          title,
                          category,
                          tooltipText,
                          variant = 'default',
                          status,
                          contribution,
                          nextClaimDate,
                      }: VerticalCardProps) => {

    return (
        <div className="flex flex-col rounded-xl border border-outline shadow-cards">
            {link ? (
                <Link href={link}>
                    <CardContent
                        imageSrc={imageSrc}
                        title={title}
                        category={category}
                        tooltipText={tooltipText}
                        variant={variant}
                        status={status}
                        contribution={contribution}
                        nextClaimDate={nextClaimDate}
                    />
                </Link>
            ) : (
                <CardContent
                    imageSrc={imageSrc}
                    title={title}
                    category={category}
                    tooltipText={tooltipText}
                    variant={variant}
                    status={status}
                    contribution={contribution}
                    nextClaimDate={nextClaimDate}
                />
            )}
        </div>
    );
};

export default VerticalCard;