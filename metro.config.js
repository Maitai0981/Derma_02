/**
 * Metro config para React Native (modo CommonJS).
 * Compatível com Windows + Node 18/20.
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'pte', 'ptl'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
