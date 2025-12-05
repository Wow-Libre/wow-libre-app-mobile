const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // Use a cache directory within the project to avoid permission issues
  cacheStores: [
    {
      get: async () => null,
      set: async () => {},
    },
  ],
};

// Set custom cache directory in project root to avoid permission issues
process.env.METRO_CACHE_DIR = path.join(__dirname, '.metro-cache');

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
