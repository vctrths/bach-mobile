const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };

  const defaultResolveRequest = resolver.resolveRequest;

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
    resolveRequest: (context, moduleName, platform) => {
      if (
        (moduleName === "react-native-maps" ||
          moduleName === "@react-native-community/datetimepicker" ||
          moduleName === "expo-notifications" ||
          moduleName.startsWith("expo-notifications/")) &&
        platform === "web"
      ) {
        return { type: "empty" };
      }
      if (typeof defaultResolveRequest === "function") {
        return defaultResolveRequest(context, moduleName, platform);
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  };

  return config;
})();
