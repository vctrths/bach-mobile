import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Card, Text, XStack, YStack } from "tamagui";

export default function RequestAcceptedScreen() {
  return (
    <ThemedSafeArea>
      <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
        <TopNavPill
          title="Verzoek geaccepteerd"
          onBackPress={() => router.push("/owner/dashboard")}
        />

        <YStack alignItems="center" gap="$4" padding="$6">
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
          <Text fontSize="$5" fontWeight="bold" color="" textAlign="center">
            Verzoek geaccepteerd!
          </Text>
          <Text fontSize="$4" color="$secondary" textAlign="center">
            Je hebt de aanvraag goedgekeurd. Start nu een gesprek met de tuinzoeker.
          </Text>
        </YStack>

        <YStack gap="$3">
          <Card
            elevation={2}
            backgroundColor="rgba(227, 236, 215, 0.5)"
            borderColor="rgba(227, 236, 215, 0.85)"
            borderWidth={1}
            borderRadius="$6"
            padding="$4"
            gap="$2"
          >
            <Text fontSize="$3" color="$secondary" fontWeight="500">
              Tuinzoeker
            </Text>
            <Text fontSize="$4" color="$text_dark" fontWeight="600">
              Anna De Vries
            </Text>
            <Text fontSize="$3" color="$secondary">
              Wil graag helpen met de moestuin elke zaterdag.
            </Text>
          </Card>
        </YStack>

        <YStack gap="$3" marginTop="auto" paddingBottom="$6">
          <Button
            label="Ga naar chat"
            backgroundColor="rgba(23, 51, 0, 0.85)"
            color="white"
            onPress={() => router.push("/messages" as any)}
          />
          <Button
            label="Terug naar dashboard"
            backgroundColor="transparent"
            color="#173300"
            onPress={() => router.push("/owner/dashboard")}
          />
        </YStack>
      </YStack>
    </ThemedSafeArea>
  );
}
