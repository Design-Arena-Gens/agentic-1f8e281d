/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    },
    serverComponentsExternalPackages: ['@napi-rs/canvas', 'fluent-ffmpeg', 'ffmpeg-static']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@napi-rs/canvas');
    }

    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader'
    });

    return config;
  }
};

export default nextConfig;
