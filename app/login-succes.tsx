import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { useAuth } from "@/context/AuthContext";
import { getHomeRoute } from "@/utils/role-routing";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { Spinner, Text, XStack, YStack } from "tamagui";

export default function LoginSuccessScreen() {
  const { profile, loading } = useAuth();

  // Auto-redirect when profile is loaded
  useEffect(() => {
    if (!loading && profile) {
      router.replace(getHomeRoute(profile.role) as any);
    }
  }, [loading, profile]);

  const handleGoToDashboard = () => {
    router.replace(getHomeRoute(profile?.role) as any);
  };

  return (
    <ThemedSafeArea>
      <YStack flex={1} paddingHorizontal="$6" justifyContent="center" gap="$6">
        <YStack alignItems="center" gap="$4">
          <XStack
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor="rgba(34, 197, 94, 0.15)"
            justifyContent="center"
            alignItems="center"
          >
            <Ionicons name="checkmark" size={44} color="#22c55e" />
          </XStack>
          <Text fontSize="$6" fontWeight="bold" color="$text_dark" textAlign="center">
            Succesvol ingelogd!
          </Text>
          <Text fontSize="$4" color="$secondary" textAlign="center">
            Welkom terug bij Groene Vingers.
          </Text>
        </YStack>

        {loading ? (
          <YStack alignItems="center" gap="$2">
            <Spinner size="large" color="$primary" />
            <Text fontSize="$3" color="$secondary" textAlign="center">
              Profiel laden...
            </Text>
          </YStack>
        ) : (
          <Button
            label="Ga naar dashboard"
            backgroundColor="$background"
            color="$white"
            onPress={handleGoToDashboard}
          />
        )}
      </YStack>
    </ThemedSafeArea>
  );
}
