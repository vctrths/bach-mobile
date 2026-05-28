import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import Button from "@/components/ui/Button";
import { Image } from "@/lib/image";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useEffect } from "react";
import { H1, Spinner, YStack } from "tamagui";

const HeroImage = require("@/assets/images/hero.png");

export default function SplashRouteScreen() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      router.replace("/");
    }
  }, [loading, session]);

  if (loading) {
    return (
      <ThemedSafeArea>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Spinner size="large" color="$primary" />
        </YStack>
      </ThemedSafeArea>
    );
  }

  return (
    <ThemedSafeArea>
      <YStack flex={1} padding="$4" justifyContent="space-between">
        <YStack flex={1} justifyContent="center" alignItems="center" marginTop="$8">
          <Image
            source={HeroImage}
            style={{ width: "100%", height: 450 }}
            contentFit="contain"
          />
        </YStack>

        <YStack gap="$4" marginBottom="$6">
          <H1 textAlign="center" color="$primary" fontWeight="bold">
            Welkom bij{"\n"}Groene Vingers
          </H1>
          <Button
            label="Leer bij over onze app"
            onPress={() => router.push("/onboarding")}
          />
          <Button
            label="Ga rechtstreeks naar login"
            variant="secondary"
            onPress={() => router.push("/login")}
          />
        </YStack>
      </YStack>
    </ThemedSafeArea>
  );
}
