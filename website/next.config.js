/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async  () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'cache-control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  }
}

module.exports = nextConfig
