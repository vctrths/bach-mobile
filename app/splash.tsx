import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { YStack } from "tamagui";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding" as any);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedSafeArea>
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        onPress={() => router.replace("/onboarding" as any)}
      >
        <ExpoImage
          source={require("@/assets/images/logo.svg")}
          style={{ width: 120, height: 120 }}
          contentFit="contain"
        />
      </YStack>
    </ThemedSafeArea>
  );
}
