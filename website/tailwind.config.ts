import { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    // darkMode: 'class', // Enables dark mode using 'class' method
    theme: {
        extend: {
            colors: {
                background: 'var(--color-background)',
                foreground: 'var(--color-foreground)',
                outline: 'var(--color-outline)',
                secondary: 'var(--color-secondary)',
                text: 'var(--color-text)',
                highlight: {
                    orange: 'var(--color-highlight-orange)',
                    gradient: 'var(--color-highlight-gradient)',
                },
                bgSecondary: 'var(--color-bg-secondary)', // Used for cards, tables, active nav
            },
            boxShadow: {
                'cards': 'var(--cards-shadow)',
            },
            letterSpacing: {
                'largeSpace': 'var(--ls-large)'
            }
        },
    },
    plugins: [
        plugin(({ addBase }) => {
            addBase({
                ':root': {
                    '--color-background': '#ffffff',
                    '--color-foreground': '#201C13',
                    '--color-outline': '#F0ECE5',
                    '--color-secondary': '#988B71',
                    '--color-text': '#201C13',
                    '--color-highlight-orange': '#EF8013',
                    '--color-highlight-gradient': 'linear-gradient(180deg, #FF8A00 0%, #FF6400 100%)',
                    '--color-bg-secondary': '#FBFAF8', // Used for cards, tables, active nav, etc.
                    '--cards-shadow': '0 1px 4px 0 rgba(224,221,214,0.2)',
                    '--text-base': '15px',
                    '--ls-large': '-0.13px'
                },
                '@media (prefers-color-scheme: dark)': {
                    ':root': {
                        '--color-background': '#161616',
                        '--color-foreground': '#ffffff',
                        '--color-outline': 'rgba(255, 255, 255, 0.05)',
                        '--color-text': '#ffffff',
                        '--color-bg-secondary': '#242424',
                        '--cards-shadow': '0 1px 4px 0 rgba(0,0,0,0.2)',
                    },
                },
            });
        }),
    ],
};
export default config;
