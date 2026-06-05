const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Prevent Metro from processing the nested node_modules inside the
    // locally-linked package copy, which would cause duplicate module errors.
    blockList: /node_modules\/@getfizzup\/trainingkit-reactnative\/node_modules\/.*/,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
