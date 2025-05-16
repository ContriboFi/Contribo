// components/LandingPage.tsx
'use client';

import Head from 'next/head'
import Link from 'next/link'
import {useState} from 'react'
import Image from 'next/image'
import progress from '../landing/icon/progress.svg';
import code from '../landing/icon/code.svg';
import structure from '../landing/icon/structure.svg';
import BecomePartnerModal from "@/app/landing/BecomePartnerModal";

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [open, setOpen] = useState(false);


    return (
        <>
            <Head>
                <title>Contribo - Bringing Investors & Developers Together</title>
                <meta name="description"
                      content="A bridge for non-technical users to financially support the development of Web3 projects."/>
            </Head>

            <div className="bg-white min-h-screen w-full">

                <div
                    className="min-h-screen flex flex-col md:flex-row bg-white text-gray-900 font-sans max-w-[1200px] mx-auto relative">

                    {/* Sidebar or Top Navigation */}
                    <aside
                        className="w-full md:w-56 md:min-h-screen border-b md:border-b-0  border-gray-200 p-6 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start sticky top-0 bg-white z-10 md:pt-16">

                        {/* Logo */}
                        <div className="text-orange-600 font-bold text-2xl"><Image  className="-ml-3.5" src={'/images/landing/label.png'} width={176} height={85} alt={''}/></div>

                        {/* Desktop Menu */}
                        <nav className="hidden md:flex flex-col space-y-6 mt-12 text-sm text-gray-600">
                            <NavLinks/>
                        </nav>

                        {/* Mobile Hamburger */}
                        <div className="flex md:hidden items-center">
                            <button
                                className="text-3xl text-orange-600 focus:outline-none"
                                onClick={() => setMenuOpen(true)}
                            >
                                ≡
                            </button>
                        </div>

                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 p-8 md:p-16 z-0">

                        {/* Your Main Sections (hero, process, faq...) */}
                        <LandingContent setOpen={setOpen}/>

                    </main>

                    {/* Mobile Fullscreen Menu Overlay */}
                    {menuOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white w-11/12 max-w-sm p-8 rounded-lg text-center space-y-6">
                                <button
                                    className="absolute top-6 right-6 text-3xl text-orange-600"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    ×
                                </button>
                                <nav className="flex flex-col space-y-6 text-gray-700 text-lg font-semibold">
                                    <Link href="#" onClick={() => setMenuOpen(false)}
                                          className="hover:text-orange-600">About</Link>
                                    <Link href="#" onClick={() => setMenuOpen(false)}
                                          className="hover:text-orange-600">Process</Link>
                                    <Link href="#" onClick={() => setMenuOpen(false)}
                                          className="hover:text-orange-600">Developers</Link>
                                    <Link href="#" onClick={() => setMenuOpen(false)}
                                          className="hover:text-orange-600">FAQs</Link>
                                </nav>
                            </div>
                        </div>
                    )}

                </div>
            </div>
            <BecomePartnerModal open={open} onClose={() => setOpen(false)} />
        </>
    )
}

// Separate content block
function LandingContent({setOpen}:{setOpen: (arg: boolean)=>void }) {
    return (
        <>
            <section className="pb-16 border-b border-gray-200">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    Bringing Investors &amp; Developers together
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                    A bridge for non-technical users to financially support the development of Web3 projects.
                </p>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <Link href="#"
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg text-center">
                        Join Waitlist
                    </Link>
                    <Link href="#"
                          className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg text-center">
                        Follow for Updates
                    </Link>
                </div>
            </section>

            <section className="py-16 border-b border-gray-200">
                <h2 className="text-2xl font-bold mb-12">Process</h2>
                <div className="space-y-12 max-w-3xl">
                    <ProcessStep icon="progress" title="Pool Funds" topLabel="01"
                                 description="Users deposit stablecoins to project pools to fund technical contributions to a project's codebase."/>
                    <ProcessStep icon="code" title="Contribution" topLabel="02"
                                 description="Developers contribute directly to the project's by completing tasks outlined by the project."/>
                    <ProcessStep icon="structure" title="Reward" topLabel="03"
                                 description="Project allocates tokens for our contribution which then we distribute among pool sponsors."/>
                </div>
            </section>

            <section className="py-16 border-b border-gray-200">
                <h2 className="text-2xl font-bold mb-12">Frequently Asked Questions</h2>
                <div className="max-w-2xl space-y-4">
                    <FaqItem question="Can I withdraw my contribution from the pool before the project reaches TGE?"
                             answer="No. Since your contribution is used to fund developers' work, you cannot withdraw it. However, you will receive ICT, which will be traded on the market, allowing you to sell your share whenever you choose."
                             defaultOpen/>
                    <FaqItem question="Do we guarantee that projects will allocate tokens in return for contributions?"
                             answer="We encourage projects to allocate tokens, but we cannot guarantee it as it depends on each project."/>
                    <FaqItem question="Is Contribo a launchpad?"
                             answer="No, Contribo is a contribution platform that bridges investors and developers, not a traditional launchpad."/>
                    <FaqItem question="I don't see the project I'm interested in."
                             answer="You can suggest a project for inclusion, and we'll review it for eligibility!"/>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-3xl bg-gray-50 p-8 rounded-lg text-center">
                    <h2 className="text-2xl font-bold mb-4">Become a Partner</h2>
                    <p className="text-gray-600 mb-6">
                        Lorem ipsum dolor sit amet consectetur. Dui lorem diam viverra elementum. Dui feugiat pulvinar
                        risus sodales.
                    </p>
                    <Link href="#"
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg"
                          onClick={()=>setOpen(true)}
                    >
                        Become a Partner
                    </Link>
                </div>
            </section>

            <footer className="pt-16 pb-8 text-sm text-gray-500">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div>© Contribo</div>
                    <div className="space-x-6">
                        <Link href="#" className="hover:text-gray-700">Terms</Link>
                        <Link href="#" className="hover:text-gray-700">Partnerships</Link>
                        <Link href="#" className="hover:text-gray-700">X (Twitter)</Link>
                    </div>
                </div>
            </footer>
        </>
    )
}

function NavLinks() {
    return (
        <>
            <Link href="#" className="hover:text-gray-900">About</Link>
            <Link href="#" className="hover:text-gray-900">Process</Link>
            <Link href="#" className="hover:text-gray-900">Developers</Link>
            <Link href="#" className="hover:text-gray-900">FAQs</Link>
        </>
    )
}

interface ProcessStepProps {
    icon: string
    title: string
    description: string
    topLabel: string
}

function ProcessStep({icon, title, description, topLabel}: ProcessStepProps) {
    return (
        <div className="flex items-start space-x-6">
            <div
                className="flex-shrink-0 text-orange-600 font-bold text-lg w-14 h-14 flex items-center justify-center ">
                {icon === 'progress' && (<Image src={progress.src} width={progress.width} height={progress.height} alt={'progress'} />)}
                {icon === 'code' && (<Image src={code.src} width={code.width} height={code.height} alt={'code'} />)}
                {icon === 'structure' && (<Image src={structure.src} width={structure.width} height={structure.height} alt={'structure'} />)}
            </div>
            <div>
                <p className="flex-shrink-0 text-orange-600 font-bold w-14 flex items-left justify-left ">{topLabel}</p>
                <h3 className="text-black-600 font-bold text-sm mb-1">{title}</h3>
                <p className="text-gray-600 text-base">{description}</p>
            </div>
        </div>
    )
}

interface FaqItemProps {
    question: string;
    answer: string;
    defaultOpen?: boolean;
}

function FaqItem({question, answer, defaultOpen = false}: FaqItemProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="border-b border-gray-200 py-4">
            <button
                className="flex justify-between items-center w-full text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
        <span className={`font-semibold ${isOpen ? 'text-orange-600' : 'text-gray-700'}`}>
          {question}
        </span>
                <span className="text-orange-600 text-xl ml-4">
          {isOpen ? '−' : '+'}
        </span>
            </button>

            <div
                className={`mt-2 text-gray-600 text-sm transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                {isOpen && (
                    <p className="mt-2">
                        {answer}
                    </p>
                )}
            </div>
        </div>
    )
}