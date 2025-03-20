/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.icons8.com',
                port: '',
                pathname: '/**',
            },
        ],
        domains: [
            'img.icons8.com',
            'cdn.jsdelivr.net',
            'registry.npmmirror.com',
            'www.edureka.co',
        ],
    },
}

module.exports = nextConfig 