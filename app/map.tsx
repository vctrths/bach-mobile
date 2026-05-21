import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, YStack } from "tamagui";

export default function MapScreen() {
  return (
    <ThemedSafeArea>
      <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
        <TopNavPill title="Map" onBackPress={() => router.back()} />

        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Ionicons name="map-outline" size={64} color="#57594D" />
          <Text fontSize="$5" fontWeight="bold" color="$text_dark" textAlign="center">
            Kaartweergave
          </Text>
          <Text fontSize="$4" color="$secondary" textAlign="center" maxWidth={280}>
            De kaart is beschikbaar in de mobiele app. Open de app op je telefoon om tuinen in de buurt te ontdekken.
          </Text>
        </YStack>
      </YStack>
    </ThemedSafeArea>
  );
}
