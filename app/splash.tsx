import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { useAuth } from "@/context/AuthContext";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { Spinner, YStack } from "tamagui";

export default function SplashScreen() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [loading, session]);

  return (
    <ThemedSafeArea>
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        gap="$4"
      >
        <ExpoImage
          source={require("@/assets/images/logo.svg")}
          style={{ width: 120, height: 120 }}
          contentFit="contain"
        />
        <Spinner size="large" color="$primary" />
      </YStack>
    </ThemedSafeArea>
  );
}
