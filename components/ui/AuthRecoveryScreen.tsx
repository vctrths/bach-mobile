import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import { H1, Paragraph, Spinner, Text, YStack } from "tamagui";

import Button from "./Button";
import ThemedSafeArea from "./ThemedSafeArea";

export default function AuthRecoveryScreen() {
  const { authError, retryAuth, resetAuthSession } = useAuth();
  const [action, setAction] = useState<"retry" | "reset" | null>(null);

  const handleRetry = async () => {
    setAction("retry");
    await retryAuth();
    setAction(null);
  };

  const handleReset = async () => {
    setAction("reset");
    await resetAuthSession();
    setAction(null);
    router.replace("/login");
  };

  return (
    <ThemedSafeArea>
      <YStack
        flex={1}
        justifyContent="center"
        paddingHorizontal="$6"
        gap="$6"
      >
        <YStack gap="$3">
          <Text color="$primary" fontSize="$2" fontWeight="700">
            Sessie herstellen
          </Text>
          <H1 color="$text_dark" fontWeight="bold">
            We kunnen je niet automatisch inloggen
          </H1>
          <Paragraph color="$secondary" fontSize="$4" lineHeight={24}>
            {authError ??
              "Je sessie kon niet worden hersteld. Probeer opnieuw of log opnieuw in."}
          </Paragraph>
        </YStack>

        <YStack gap="$3">
          <Button
            label={action === "retry" ? "Opnieuw proberen..." : "Probeer opnieuw"}
            onPress={handleRetry}
            disabled={!!action}
            icon={action === "retry" ? <Spinner color="$white" /> : undefined}
          />
          <Button
            label={action === "reset" ? "Sessie wissen..." : "Log opnieuw in"}
            variant="secondary"
            onPress={handleReset}
            disabled={!!action}
            icon={action === "reset" ? <Spinner color="$primary" /> : undefined}
          />
        </YStack>
      </YStack>
    </ThemedSafeArea>
  );
}
