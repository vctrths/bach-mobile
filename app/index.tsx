import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { router } from "expo-router";
import React from "react";
import { Button, H1, Text, YStack } from "tamagui";

/**
 * DEBUG GATE
 * This screen helps you choose between starting fresh with onboarding
 * or skipping straight to the dashboard.
 * 
 * TODO: Remove this file and rename dashboard.tsx back to index.tsx 
 * when development is complete.
 */
export default function DebugGate() {
  return (
    <ThemedSafeArea>
      <YStack flex={1} justifyContent="center" padding="$6" gap="$4">
        <H1 textAlign="center" color="$primary" fontWeight="bold">
          Debug Mode
        </H1>
        <Text textAlign="center" color="$text_dark" marginBottom="$4">
          Choose your entry point for testing:
        </Text>

        <Button
          size="$6"
          backgroundColor="$primary"
          onPress={() => router.push("/onboarding")}
          pressStyle={{ scale: 0.98, opacity: 0.9 }}
        >
          <Text color="white">Start Onboarding Flow</Text>
        </Button>

        <Button
          size="$6"
          backgroundColor="transparent"
          borderWidth={1}
          borderColor="$primary"
          onPress={() => router.push("/dashboard")}
          pressStyle={{ scale: 0.98, opacity: 0.8 }}
        >
          <Text color="$primary">Skip to Dashboard</Text>
        </Button>

        <YStack marginTop="$10" padding="$4" backgroundColor="$borderColor" borderRadius="$4">
          <Text fontSize="$2" color="$text_dark" textAlign="center">
            Note: This screen is temporary for debugging.
          </Text>
        </YStack>
      </YStack>
    </ThemedSafeArea>
  );
}
