/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/explore/all',
                permanent: true,
            },
        ]
    },
};

export default nextConfig;
