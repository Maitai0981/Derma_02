module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    '@babel/plugin-transform-export-namespace-from',
    ['@babel/plugin-transform-typescript', { allowDeclareFields: true }],
  ],
};
