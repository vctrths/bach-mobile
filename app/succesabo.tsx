import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { YStack, H1, Text } from "tamagui";

export default function SuccesaboScreen() {
  const { profile, refreshProfile } = useAuth();
  const [checkingPremium, setCheckingPremium] = useState(true);
  const [premiumConfirmed, setPremiumConfirmed] = useState(!!profile?.isPremium);

  useEffect(() => {
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    const pollPremiumStatus = async () => {
      if (!active) return;

      const latestProfile = await refreshProfile();
      attempts += 1;

      if (!active) return;

      if (latestProfile?.isPremium) {
        setPremiumConfirmed(true);
        setCheckingPremium(false);
        return;
      }

      if (attempts >= 6) {
        setCheckingPremium(false);
        return;
      }

      timeoutId = setTimeout(() => {
        void pollPremiumStatus();
      }, 2000);
    };

    void pollPremiumStatus();

    return () => {
      active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [refreshProfile]);

  return (
    <PageContainer showTopNav={false} showBottomNav={false} scrollable={false}>
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        gap="$6"
        paddingHorizontal="$4"
      >
        <YStack
          backgroundColor="rgba(34, 197, 94, 0.1)"
          width={100}
          height={100}
          borderRadius={50}
          justifyContent="center"
          alignItems="center"
        >
          <Ionicons name="checkmark-circle" size={56} color="#22c55e" />
        </YStack>
        <YStack alignItems="center" gap="$2">
          <H1 color="$text_dark" fontWeight="bold" textAlign="center">
            Welkom bij Pro!
          </H1>
          <Text color="$secondary" fontSize="$3" textAlign="center" maxWidth={320}>
            Je Pro-abonnement is succesvol geactiveerd. Je kunt nu onbeperkt
            aanvragen versturen en genieten van alle premium functies.
          </Text>
          {!premiumConfirmed && checkingPremium && (
            <Text color="$secondary" fontSize="$3" textAlign="center" maxWidth={280}>
              We controleren je betaling nog even, dat kan enkele seconden duren.
            </Text>
          )}
        </YStack>
        <YStack gap="$3" width="100%">
          <Button
            label="Ontdek tuinen"
            variant="secondary"
            onPress={() => router.push("/")}
          />
          <Button
            label="Bekijk mijn profiel"
            variant="secondary"
            onPress={() => router.push("/profile")}
          />
        </YStack>
      </YStack>
    </PageContainer>
  );
}
