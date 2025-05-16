'use client';

import React, { useEffect, useRef, useState } from 'react';

interface BecomePartnerModalProps {
    /** Control whether the modal is visible */
    open: boolean;
    /** Fired when the user clicks ×, the overlay, or successfully submits the form */
    onClose: () => void;
}

/**
 * Responsive "Become a Partner" modal.
 * Tailwind‑CSS‑powered, works seamlessly on mobile and desktop.
 */
const BecomePartnerModal: React.FC<BecomePartnerModalProps> = ({ open, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [info, setInfo] = useState('');
    const [associated, setAssociated] = useState(false);

    const overlayRef = useRef<HTMLDivElement>(null);

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = "https://script.google.com/macros/s/AKfycbz_Sofk4_a9nsO8lMhCVM4YzCReUjk8S6ncRkFscvvEuJQ4EwmXa_X8QF6XwfFrWQUyiA/exec";
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                name,
                email,
                info,
                associated
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        onClose();
        setName('');
        setEmail('');
        setInfo('');
        setAssociated(false);
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            ref={overlayRef}
            onClick={handleOverlayClick}
        >
            <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl sm:max-h-[90vh] sm:overflow-y-auto">
                {/* Close */}
                <button
                    aria-label="Close"
                    className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
                    onClick={onClose}
                >
                    &#10005;
                </button>

                <h2 className="mb-6 text-center text-xl font-semibold">Become a Partner</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-700">
                            Your Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 outline-none ring-orange-500 focus:border-orange-500 focus:ring-2 text-black"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="email" className="mb-1 text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 outline-none ring-orange-500 focus:border-orange-500 focus:ring-2 text-black"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="info" className="mb-1 text-sm font-medium text-gray-700">
                            Project Information <span className="text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            id="info"
                            rows={4}
                            value={info}
                            onChange={(e) => setInfo(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 outline-none ring-orange-500 focus:border-orange-500 focus:ring-2 text-black"
                        />
                    </div>

                    <label className="flex cursor-pointer items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={associated}
                            onChange={(e) => setAssociated(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">I am associated or own this project</span>
                    </label>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 px-4 py-2 font-medium text-white transition hover:brightness-110"
                    >
                        Submit Project
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BecomePartnerModal;
