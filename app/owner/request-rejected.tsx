import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TextArea, XStack, YStack } from "tamagui";
import { useState } from "react";

export default function RequestRejectedScreen() {
  const [reason, setReason] = useState("");

  return (
    <ThemedSafeArea>
      <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
        <TopNavPill
          title="Verzoek geweigerd"
          onBackPress={() => router.push("/owner/dashboard")}
        />

        <YStack alignItems="center" gap="$4" padding="$6">
          <XStack
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor="rgba(239, 68, 68, 0.15)"
            justifyContent="center"
            alignItems="center"
          >
            <Ionicons name="close" size={44} color="#ef4444" />
          </XStack>
          <Text fontSize="$5" fontWeight="bold" color="" textAlign="center">
            Verzoek geweigerd
          </Text>
          <Text fontSize="$4" color="$secondary" textAlign="center">
            Je hebt de aanvraag afgewezen.
          </Text>
        </YStack>

        <YStack gap="$2">
          <Text fontSize="$3" color="$secondary" fontWeight="500">
            Reden (optioneel)
          </Text>
          <TextArea
            placeholder="Laat weten waarom je de aanvraag hebt afgewezen..."
            value={reason}
            onChangeText={setReason}
            minHeight={100}
            backgroundColor="white"
            borderColor="rgba(23, 51, 0, 0.1)"
            borderWidth={1}
            borderRadius="$6"
            padding="$4"
            fontSize="$4"
            color="$text_dark"
          />
        </YStack>

        <YStack marginTop="auto" paddingBottom="$6">
          <Button
            label="Terug naar dashboard"
            backgroundColor="rgba(239, 68, 68, 0.85)"
            color="white"
            onPress={() => router.push("/owner/dashboard")}
          />
        </YStack>
      </YStack>
    </ThemedSafeArea>
  );
}
