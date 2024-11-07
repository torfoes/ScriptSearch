// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        config.experiments = { ...config.experiments, asyncWebAssembly: true };

        config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';

        config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async',
        });

        if (isServer) {
            config.resolve.fallback = { fs: false };
        }

        return config;
    },
};

module.exports = nextConfig;
