import type { NextConfig } from 'next'
import path from 'path'

const CMS_HOSTNAME = 'app-wipf02saastp45ent001.cms.optimizely.com'

const nextConfig: NextConfig = {
  // Prevent Next.js from using the parent C:\Users\koris as workspace root
  turbopack: {
    root: path.resolve(__dirname),
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: CMS_HOSTNAME },
      { protocol: 'https', hostname: '*.cms.optimizely.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' https://${CMS_HOSTNAME} https://*.cms.optimizely.com`,
          },
        ],
      },
    ]
  },
}

export default nextConfig
