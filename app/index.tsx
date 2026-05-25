import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { OnboardingContext } from "@/context/OnboardingContext";
import { router } from "expo-router";
import React, { useContext } from "react";
import { H1, Text, XStack, YStack } from "tamagui";
import { UserRole } from "@/utils/role";

/**
 * DEBUG GATE
 * This screen helps you choose between starting fresh with onboarding
 * or skipping straight to the dashboard.
 * 
 * TODO: Remove this file and rename dashboard.tsx back to index.tsx 
 * when development is complete.
 */
export default function DebugGate() {
  const { updateData } = useContext(OnboardingContext);

  const startAsRole = (role: UserRole) => {
    updateData({ role });
    router.push("/dashboard");
  };

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
          label="Start Onboarding Flow"
          size="$6"
          backgroundColor="$primary"
          onPress={() => router.push("/onboarding")}
          pressStyle={{ scale: 0.98, opacity: 0.9 }}
        />

        <XStack gap="$3">
          <Button
            label="Tuineigenaar"
            flex={1}
            size="$6"
            backgroundColor="$primary"
            onPress={() => startAsRole(UserRole.TUIN_EIGENAAR)}
            pressStyle={{ scale: 0.98, opacity: 0.9 }}
          />
          <Button
            label="Tuinzoeker"
            flex={1}
            size="$6"
            backgroundColor="$accent"
            onPress={() => startAsRole(UserRole.TUIN_ZOEKER)}
            pressStyle={{ scale: 0.98, opacity: 0.9 }}
          />
        </XStack>

        <Button
          label="Tuinzoeker (met tuin)"
          size="$6"
          backgroundColor="$accent"
          onPress={() => startAsRole(UserRole.TUIN_ZOEKER_MET_TUIN)}
          pressStyle={{ scale: 0.98, opacity: 0.9 }}
        />

        <Button
          label="Skip to Dashboard (no role)"
          size="$6"
          backgroundColor="transparent"
          borderWidth={1}
          borderColor="$primary"
          onPress={() => router.push("/dashboard")}
          pressStyle={{ scale: 0.98, opacity: 0.8 }}
          color="$primary"
        />

        <Button
          label="Login / Sign Up"
          size="$6"
          backgroundColor="$accent"
          onPress={() => router.push("/login")}
          pressStyle={{ scale: 0.98, opacity: 0.9 }}
        />

        <YStack marginTop="$10" padding="$4" backgroundColor="$borderColor" borderRadius="$4">
          <Text fontSize="$2" color="$text_dark" textAlign="center">
            Note: This screen is temporary for debugging.
          </Text>
        </YStack>
      </YStack>
    </ThemedSafeArea>
  );
}
