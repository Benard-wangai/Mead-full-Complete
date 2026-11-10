// metro.config.js
// Production-ready Metro configuration for Mead Super App
// Optimized for large TypeScript project, path aliases, assets, and Windows compatibility

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,

  // Asset extensions
  assetExts: [
    ...config.resolver.assetExts,
    'ttf', 'otf', 'woff', 'woff2',     // Fonts
    'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', // Images
    'mp4', 'mp3', 'wav', 'm4a', 'aac', // Audio & Video
  ],

  // Source extensions
  sourceExts: [
    ...config.resolver.sourceExts,
    'ts', 'tsx', 'js', 'jsx', 'json', 'cjs', 'mjs',
  ],

  unstable_enablePackageExports: true,

  // Modern Path Aliases (replaces deprecated extraNodeModules)
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@screens': path.resolve(__dirname, 'src/screens'),
    '@navigation': path.resolve(__dirname, 'src/navigation'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@services': path.resolve(__dirname, 'src/services'),
    '@hooks': path.resolve(__dirname, 'src/hooks'),
    '@constants': path.resolve(__dirname, 'src/constants'),
    '@assets': path.resolve(__dirname, 'assets'),
    ws: path.resolve(__dirname, 'shims/ws.js'),
  },

  // Watchman is often unavailable on Windows; disable to avoid Metro startup issues
  useWatchman: process.platform !== 'win32',

  // Prefer React Native–compatible Supabase builds (avoids Node `ws` / `stream` on device)
  resolveRequest: (function (defaultResolveRequest) {
    const supabaseModuleEntries = {
      '@supabase/supabase-js': path.resolve(
        __dirname,
        'node_modules/@supabase/supabase-js/dist/module/index.js'
      ),
      '@supabase/realtime-js': path.resolve(
        __dirname,
        'node_modules/@supabase/realtime-js/dist/module/index.js'
      ),
    };

    return function (context, moduleName, platform) {
      if (platform !== 'web') {
        if (moduleName === 'ws') {
          return { type: 'sourceFile', filePath: path.resolve(__dirname, 'shims/ws.js') };
        }
        if (supabaseModuleEntries[moduleName]) {
          return { type: 'sourceFile', filePath: supabaseModuleEntries[moduleName] };
        }
      }

      if (defaultResolveRequest) {
        return defaultResolveRequest(context, moduleName, platform);
      }

      return context.resolveRequest(context, moduleName, platform);
    };
  })(config.resolver.resolveRequest),
};

config.transformer = {
  ...config.transformer,
  inlineRequires: true,
  minify: process.env.NODE_ENV === 'production',
  unstable_allowRequireContext: true,
};

// Watch folders
config.watchFolders = [__dirname];

// Do NOT set resetCache: true in normal use (only use -c flag when needed)
config.resetCache = false;

module.exports = config;
