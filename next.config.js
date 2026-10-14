/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: false,
    images: {
        unoptimized: true,
        qualities: [75, 80],
    },
}

module.exports = nextConfig