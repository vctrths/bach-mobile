import PageContainer from "@/components/ui/PageContainer";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { YStack, H1, Text, Button } from "tamagui";

export default function SuccesverzoekScreen() {
  return (
    <PageContainer showTopNav={false}>
      <YStack flex={1} justifyContent="center" alignItems="center" gap="$6">
        <YStack backgroundColor="rgba(34, 197, 94, 0.1)" width={100} height={100} borderRadius={50} justifyContent="center" alignItems="center">
          <Ionicons name="checkmark-circle" size={56} color="#22c55e" />
        </YStack>
        <YStack alignItems="center" gap="$2">
          <H1 color="$text_dark" fontWeight="bold" textAlign="center">Aanvraag verstuurd!</H1>
          <Text color="$secondary" fontSize="$3" textAlign="center" maxWidth={280}>Je aanvraag is succesvol verstuurd naar de tuineigenaar. Je ontvangt een melding zodra deze wordt beantwoord.</Text>
        </YStack>
        <YStack gap="$3" width="100%">
          <Button size="$5" backgroundColor="rgba(23, 51, 0, 0.1)" onPress={() => router.push("/messages")}>
            <Text color="#173300" fontWeight="600">Bekijk berichten</Text>
          </Button>
          <Button size="$5" backgroundColor="transparent" borderWidth={1} borderColor="rgba(23, 51, 0, 0.2)" onPress={() => router.push("/dashboard")}>
            <Text color="#173300" fontWeight="600">Terug naar dashboard</Text>
          </Button>
        </YStack>
      </YStack>
    </PageContainer>
  );
}
