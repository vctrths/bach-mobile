import { Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';

import tamaConfig from '@/tamagui.config';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();
import tamaConfig from "@/tamagui.config";
import { Stack } from "expo-router";
import { TamaguiProvider } from "tamagui";

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
