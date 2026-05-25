import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import Logo from "@/assets/images/logo.svg";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useEffect } from "react";
import { Spinner, YStack } from "tamagui";

export default function SplashRouteScreen() {
  const { session, loading } = useAuth();

  useEffect(() => {
    console.log("[Splash] state:", { loading, hasSession: !!session });
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
        <Logo width={120} height={120} />
        <Spinner size="large" color="$primary" />
      </YStack>
    </ThemedSafeArea>
  );
}
