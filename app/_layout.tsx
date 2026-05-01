import tamaConfig from "@/tamagui.config";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { TamaguiProvider } from "tamagui";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Satoshi: require("../assets/fonts/Satoshi-Regular.otf"),
    SatoshiLight: require("../assets/fonts/Satoshi-Light.otf"),
    SatoshiMedium: require("../assets/fonts/Satoshi-Medium.otf"),
    SatoshiBold: require("../assets/fonts/Satoshi-Bold.otf"),
    SatoshiBlack: require("../assets/fonts/Satoshi-Black.otf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <TamaguiProvider config={tamaConfig} defaultTheme="groenevingers">
      <Stack screenOptions={{ headerShown: false }} />
    </TamaguiProvider>
  );
}
