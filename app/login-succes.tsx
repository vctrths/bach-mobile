import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { useAuth } from "@/context/AuthContext";
import { getHomeRoute } from "@/utils/role-routing";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";

export default function LoginSuccessScreen() {
  const { profile } = useAuth();

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

        <Button
          label="Ga naar dashboard"
          backgroundColor="$background"
          color="$white"
          onPress={handleGoToDashboard}
        />
      </YStack>
    </ThemedSafeArea>
  );
}
