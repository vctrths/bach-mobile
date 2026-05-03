import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import { Card, H2, Text, XStack, YStack } from "tamagui";

export default function ExploreScreen() {
  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        <YStack paddingHorizontal="$5" paddingTop="$5" gap="$5">
          <TopNavPill title="Ontdekken" />

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
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNav
        activeTab="home"
        onHomePress={() => router.push("/")}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
