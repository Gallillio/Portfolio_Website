/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.icons8.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.jsdelivr.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'registry.npmmirror.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.edureka.co',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.icon-icons.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.pinimg.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.seeklogo.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'd3njjcbhbojbot.cloudfront.net',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     images: {
//         remotePatterns: [
//             {
//                 protocol: 'https',
//                 hostname: 'img.icons8.com',
//                 port: '',
//                 pathname: '/**',
//             },
//         ],
//         domains: [
//             'img.icons8.com',
//             'cdn.jsdelivr.net',
//             'registry.npmmirror.com',
//             'www.edureka.co',
//             'images.icon-icons.com',
//             'i.pinimg.com',
//             'upload.wikimedia.org',
//             'images.seeklogo.com',
//             'd3njjcbhbojbot.cloudfront.net'
//         ],
//     },
// }

// module.exports = nextConfig 