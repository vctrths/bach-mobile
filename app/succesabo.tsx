import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { YStack, H1, Text } from "tamagui";

export default function SuccesaboScreen() {
  return (
    <PageContainer showTopNav={false}>
      <YStack flex={1} justifyContent="center" alignItems="center" gap="$6">
        <YStack backgroundColor="rgba(34, 197, 94, 0.1)" width={100} height={100} borderRadius={50} justifyContent="center" alignItems="center">
          <Ionicons name="checkmark-circle" size={56} color="#22c55e" />
        </YStack>
        <YStack alignItems="center" gap="$2">
          <H1 color="$text_dark" fontWeight="bold" textAlign="center">Welkom bij Pro!</H1>
          <Text color="$secondary" fontSize="$3" textAlign="center" maxWidth={280}>Je Pro-abonnement is succesvol geactiveerd. Je kunt nu onbeperkt aanvragen versturen en genieten van alle premium functies.</Text>
        </YStack>
        <YStack gap="$3" width="100%">
          <Button label="Ontdek tuinen" variant="secondary" onPress={() => router.push("/")} />
          <Button label="Bekijk mijn profiel" variant="secondary" onPress={() => router.push("/profile")} />
        </YStack>
      </YStack>
    </PageContainer>
  );
}
