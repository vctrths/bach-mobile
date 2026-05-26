import PageContainer from "@/components/ui/PageContainer";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Card, H2, Text, XStack, YStack } from "tamagui";

export default function ExploreScreen() {
  return (
    <PageContainer
      topNavTitle="Ontdekken"
      activeTab="home"
    >
      <YStack paddingHorizontal="$5" gap="$5">
        {/* Explorer Hero Card */}
        <Card
          backgroundColor="$background_secondary"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$6"
          padding="$4"
          gap="$2"
          marginTop="$2"
        >
          <H2 color="$text_dark" fontWeight="bold">
            Groene Oases in jouw buurt
          </H2>
          <Text color="$text_dark" fontSize="$3">
            Ontdek prachtige privétuinen die openstaan voor jouw groene vingers.
          </Text>
        </Card>

        {/* Placeholder for results */}
        <YStack gap="$3" marginTop="$2">
          <XStack gap="$3" alignItems="center">
            <Ionicons name="compass-outline" size={24} color="#172211" />
            <Text fontSize="$4" color="$text_dark" fontWeight="bold">
              Aanbevolen resultaten
            </Text>
          </XStack>
          <Text color="$secondary" fontSize="$3">
            Er zijn momenteel geen andere tuinen beschikbaar. Kom later terug voor nieuwe oases!
          </Text>
        </YStack>
      </YStack>
    </PageContainer>
  );
}