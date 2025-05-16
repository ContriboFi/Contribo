import Link from 'next/link';

interface CtaBoxProps {
    title: string;
    description: string;
    buttonText?: string;
    buttonLink?: string;
}

const CtaBox = ({ title, description, buttonText, buttonLink }: CtaBoxProps) => {
    return (
        <div className="cta-block mb-10 bg-bgSecondary border border-outline md:flex md:items-center p-6 rounded-xl gap-4 text-secondary dark:text-white/50">
            <div className="mb-4 md:mb-0">
                <h2 className="mb-1 text-text dark:text-white">{title}</h2>
                <p>{description}</p>
            </div>

            {buttonText && buttonLink && (
                <div>
                    <Link href={buttonLink} className="btn btn-primary w-full md:w-auto">
                        {buttonText}
                    </Link>
                </div>
            )}
        </div>
    );
};

export default CtaBox;
