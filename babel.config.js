// babel.config.js
// Babel Configuration for Mead - The Global Luxury Super App
// Optimized for Expo, TypeScript, React Native, and modern features

/* eslint-env node */
module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Enable new architecture support (future-proof)
          jsxRuntime: 'automatic',
        },
      ],
    ],

    plugins: [
      // Path aliases (must match tsconfig.json and metro.config.js)
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@utils': './src/utils',
            '@services': './src/services',
            '@hooks': './src/hooks',
            '@constants': './src/constants',
            '@assets': './assets',
          },
        },
      ],

      // React Native Reanimated (important for animations)
      'react-native-reanimated/plugin',

      // Optional: If you use NativeWind in the future
      // 'nativewind/babel',
    ],

    // Environment-specific settings
    env: {
      production: {
        plugins: [
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ],
      },
    },
  };
};