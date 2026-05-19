import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import { Card, H1, Text, XStack, YStack } from "tamagui";

export default function MapScreen() {
  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
          <TopNavPill
            title="Kaart"
            onBackPress={() => router.back()}
          />

          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            gap="$4"
            marginTop="$10"
          >
            <Ionicons name="map-outline" size={64} color="#57594D" />
            <H1 color="$text_dark" fontWeight="bold" textAlign="center" fontSize="$5">
              Binnenkort beschikbaar
            </H1>
            <Text color="$secondary" fontSize="$3" textAlign="center" maxWidth={280}>
              De kaartweergave wordt binnenkort toegevoegd. Blijf op de hoogte!
            </Text>
            <Button
              label="Terug naar dashboard"
              backgroundColor="rgba(23, 51, 0, 0.1)"
              color="#173300"
              onPress={() => router.push("/dashboard")}
            />
          </YStack>
        </YStack>
      </ScrollView>

      <BottomNav
        activeTab="home"
        onHomePress={() => router.push("/dashboard")}
        onMessagePress={() => router.push("/messages" as any)}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
