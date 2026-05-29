import { AlertProvider } from "@/context/AlertContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useFonts } from "@/lib/font-hooks";
import tamaConfig from "@/tamagui.config";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { TamaguiProvider } from "tamagui";

import { PwaHead } from "@/lib/pwa-head";
import { StripeProvider } from "@/lib/stripe";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { user } = useAuth();
  usePushNotifications(user?.id);

  return (
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
      <Stack.Screen name="search" />
      <Stack.Screen name="owner/request-accepted" />
      <Stack.Screen name="owner/request-rejected" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="messages/[id]" />
      <Stack.Screen name="succesabo" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="pro/payment" />
      <Stack.Screen name="garden/create" />
      <Stack.Screen name="garden/[id]" />
      <Stack.Screen name="garden/[id]/request" />
      <Stack.Screen name="collaboration/[id]" />
      <Stack.Screen name="logbook/new" />
      <Stack.Screen name="logbook/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="map" />
    </Stack>
  );
}

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

  useEffect(() => {
    if (Platform.OS === "web") {
      import("@/lib/register-sw").then((m) => m.registerServiceWorker());
    }
  }, []);

  if (!loaded) return null;

  return (
    <TamaguiProvider config={tamaConfig} defaultTheme="groenevingers">
      {Platform.OS === "web" && <PwaHead />}
      <AuthProvider>
        <StripeProvider
          publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""}
          merchantIdentifier="merchant.com.groen" // required for Apple Pay
        >
          <OnboardingProvider>
            <AlertProvider>
              <AppContent />
            </AlertProvider>
          </OnboardingProvider>
        </StripeProvider>
      </AuthProvider>
    </TamaguiProvider>
  );
}
