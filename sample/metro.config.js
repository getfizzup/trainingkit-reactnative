const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const sampleNodeModules = path.resolve(__dirname, 'node_modules');
const linkedPackageRoot = path.resolve(__dirname, 'node_modules/trainingkit-reactnative');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [repoRoot],
  resolver: {
    extraNodeModules: {
      'trainingkit-reactnative': linkedPackageRoot,
      react: path.join(sampleNodeModules, 'react'),
      'react-native': path.join(sampleNodeModules, 'react-native'),
    },
    // Prevent Metro from processing the nested node_modules inside the
    // locally-linked package copy, which would cause duplicate module errors.
    blockList: /node_modules\/trainingkit-reactnative\/node_modules\/.*/,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
