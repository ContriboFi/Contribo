import { X } from "lucide-react";
import { useState, FormEvent } from "react";

interface NewOrderModalProps {
    /** Control whether the modal is visible */
    open: boolean;
    /** Fires when the user clicks the backdrop or X icon */
    onClose: () => void;
}

export default function NewOrderModal({ open, onClose }: NewOrderModalProps) {
    const [side, setSide] = useState<'buy' | 'sell'>('buy');
    const [price, setPrice] = useState<string>('0.10');
    const [amount, setAmount] = useState<string>('1000');

    const feeRate = 0.01; // 1 USDC on every 100 USDC, adjust to taste
    const totalValue = parseFloat(price) * parseFloat(amount || '0') || 0;
    const fee = totalValue * feeRate;
    const totalPayable = totalValue + fee;

    if (!open) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // TODO: hook into your transaction logic here
        console.log({ side, price, amount, totalValue, fee, totalPayable });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40" onClick={onClose}>
            <div
                className="w-[22rem] rounded-2xl bg-white p-6 shadow-xl" // stop propagation so inner clicks don’t close
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">New Order</h2>
                    <button onClick={onClose} className="text-gray-400 transition hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                {/* Side Tabs */}
                <div className="mb-4 flex rounded-lg bg-gray-100 p-1">
                    {(['buy', 'sell'] as const).map(option => (
                        <button
                            key={option}
                            onClick={() => setSide(option)}
                            className={`w-1/2 rounded-md py-2 text-sm font-medium capitalize transition ${
                                side === option
                                    ? 'bg-white text-gray-900 shadow'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Price */}
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-16 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            placeholder="0.00"
                        />
                        {/* Token icon placeholder */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <span className="inline-block h-6 w-6 rounded-full bg-blue-100">$</span>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-14 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            placeholder="0"
                        />
                        {/* Token symbol */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <span className="text-sm font-semibold text-gray-500">LCT</span>
                        </div>
                    </div>

                    {/* Calculated summary */}
                    <div className="space-y-1 pt-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Total Value</span>
                            <span>{totalValue.toFixed(2)} USDC</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Fee</span>
                            <span>{fee.toFixed(2)} USDC</span>
                        </div>
                        <div className="flex justify-between font-medium text-gray-900">
                            <span>Total Payable Amount</span>
                            <span>{totalPayable.toFixed(2)} USDC</span>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="mt-4 w-full rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 py-3 text-center text-sm font-semibold text-white shadow transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    >
                        Submit Order
                    </button>
                </form>
            </div>
        </div>
    );
}
