import { useFonts } from "@/lib/font-hooks";
import { AuthProvider } from "@/context/AuthContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import tamaConfig from "@/tamagui.config";
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
      <AuthProvider>
        <OnboardingProvider>
          <Stack screenOptions={{ headerShown: false, animation: "none" }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="explore" />
            <Stack.Screen name="pro" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="personal-details" />
            <Stack.Screen name="logbook" />
            <Stack.Screen name="splash" />
            <Stack.Screen name="login" />
            <Stack.Screen name="login-succes" />
            <Stack.Screen name="search" />
            <Stack.Screen name="mail" />
            <Stack.Screen name="owner/request-accepted" />
            <Stack.Screen name="owner/request-rejected" />
            <Stack.Screen name="logbook/calendar/day/[id]" />
            <Stack.Screen name="messages" />
            <Stack.Screen name="messages/[id]" />
            <Stack.Screen name="problock" />
            <Stack.Screen name="succesverzoek" />
            <Stack.Screen name="succesabo" />
            <Stack.Screen name="saved" />
            <Stack.Screen name="owner/dashboard" />
            <Stack.Screen name="pro/payment" />
            <Stack.Screen name="garden/create" />
            <Stack.Screen name="garden/[id]/request" />
            <Stack.Screen name="logbook/new" />
            <Stack.Screen name="logbook/calendar" />
            <Stack.Screen name="logbook/[id]" />
            <Stack.Screen name="logbook/opvolgingen" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="map" />
          </Stack>
        </OnboardingProvider>
      </AuthProvider>
    </TamaguiProvider>
  );
}
