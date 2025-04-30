/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: [
            "components",
            "constants",
            "enums",
            "interfaces",
            "layouts",
            "pages",
            "server",
            "store",
            "types",
            "ui",
            "utils",
            "providers",            
    ]
  },
  reactStrictMode: false,
  transpilePackages: [
    '@polkadot/types-known',
    '@solana/spl-token',
    '@privy-io/react-auth'
  ],
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };

    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false
      }
    });

    return config;
  },
  images: {
    domains: ["api.universalprofile.cloud","firebasestorage.googleapis.com", "nftstorage.link", "gateway.pinata.cloud", "lukso.mypinata.cloud", "ipfs.io","universal.page"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lipsum.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      },
      
    ]
  }
}


module.exports = nextConfig
