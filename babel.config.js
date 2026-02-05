module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Needed for UniWind
      "react-native-reanimated/plugin",
    ],
  };
};
