const config = {
  typescript: {
    enableTypeChecking: true,
  },
  babel: {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            esmodules: true,
            node: '20',
          },
        },
      ],
      '@babel/preset-react',
      '@babel/preset-flow',
      '@babel/typescript',
    ],
    plugins: ['@emotion', '@babel/plugin-transform-runtime', ['@babel/plugin-proposal-decorators', { legacy: true }]],
  },
};

export default config;
