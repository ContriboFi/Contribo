interface ProgressBarProps {
    label: string;
    currentAmount: number;
    goalAmount: number;
    withMarginAuto?: boolean;
    canceled?: boolean;
}

const ProgressBar = ({
                         label,
                         currentAmount,
                         goalAmount,
                         withMarginAuto = false,
                         canceled = false,
                     }: ProgressBarProps) => {
    const percentage = Math.min((currentAmount / goalAmount) * 100, 100);

    return (
        <div className={`project--progress ${withMarginAuto ? 'mt-auto' : ''}`}>
            <div className="progress-bar--wrapper">
                <div className="flex justify-between">
                    <span className="label">{label}</span>
                    <span className="value">
            ${currentAmount.toLocaleString()} <mark className="text-stone-500">of</mark> ${goalAmount.toLocaleString()}
          </span>
                </div>
                <div className="bar">
                    <span className={canceled ? 'canceled' : ''} style={{ width: `${percentage}%` }}></span>
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
