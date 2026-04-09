const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "https://opinoor.com/api"]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  },
  webpack: (config, { isServer }) => {
    // Ignore les binaires problématiques
    config.externals.push({ 
      canvas: 'commonjs canvas',
      bufferutil: 'commonjs bufferutil',
      'utf-8-validate': 'commonjs utf-8-validate'
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;