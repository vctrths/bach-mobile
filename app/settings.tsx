import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
import { Alert, ScrollView } from "react-native";
import { Card, Circle, Text, XStack, YStack } from "tamagui";

export default function SettingsScreen() {
  const accountItems = [
    {
      id: "persoonlijk",
      label: "Persoonlijke gegevens",
      onPress: () => router.push("/personal_details"),
    },
    {
      id: "abonnement",
      label: "Abonnement",
      onPress: () => router.push("/pro"),
    },
    {
      id: "verifieer",
      label: "Account verifiëren",
      onPress: () => Alert.alert("Account verifiëren", "Je account is geverifieerd."),
    },
    {
      id: "notificaties",
      label: "Notificaties",
      onPress: () => Alert.alert("Notificaties", "Hier kun je je notificaties instellen."),
    },
  ];

  const meerItems = [
    {
      id: "verwijder",
      label: "Account verwijderen",
      icon: (
        <Circle
          size={38}
          backgroundColor="rgba(211, 47, 47, 0.08)"
          justifyContent="center"
          alignItems="center"
        >
          <Ionicons name="trash-outline" size={20} color="#D32F2F" />
        </Circle>
      ),
      onPress: () =>
        Alert.alert(
          "Account verwijderen",
          "Weet je zeker dat je je account wilt verwijderen?",
          [
            { text: "Annuleren", style: "cancel" },
            {
              text: "Verwijderen",
              style: "destructive",
              onPress: () => router.replace("/login"),
            },
          ]
        ),
    },
    {
      id: "uitloggen",
      label: "Uitloggen",
      icon: (
        <Circle
          size={38}
          backgroundColor="rgba(211, 47, 47, 0.08)"
          justifyContent="center"
          alignItems="center"
        >
          <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
        </Circle>
      ),
      onPress: () =>
        Alert.alert("Uitloggen", "Weet je zeker dat je wilt uitloggen?", [
          { text: "Annuleren", style: "cancel" },
          { text: "Uitloggen", style: "destructive", onPress: () => router.replace("/login") },
        ]),
    },
  ];

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        <YStack paddingHorizontal="$5" paddingTop="$5" gap="$5">
          {/* Header Block */}
          <TopNavPill title="Instellingen" />

          {/* Pro Banner */}
          <Card
            backgroundColor="rgba(227, 236, 215, 0.5)"
            borderColor="rgba(227, 236, 215, 0.85)"
            borderWidth={1}
            borderRadius="$10"
            paddingVertical="$3.5"
            paddingHorizontal="$4"
            alignItems="center"
            justifyContent="center"
            onPress={() => router.push("/pro")}
            pressStyle={{ scale: 0.98, opacity: 0.9 }}
          >
            <Text fontSize="$4" color="$text_dark" fontWeight="500" opacity={0.85}>
              Upgrade naar Pro voor onbeperkte aanvragen
            </Text>
          </Card>

          {/* Section: Account */}
          <YStack gap="$2.5">
            <Text color="$secondary" fontSize="$3" fontWeight="500" marginLeft="$1">
              Account
            </Text>
            {accountItems.map((item) => (
              <Card
                key={item.id}
                flexDirection="row"
                backgroundColor="white"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$6"
                paddingHorizontal="$4"
                paddingVertical="$3.5"
                justifyContent="space-between"
                alignItems="center"
                onPress={item.onPress}
                pressStyle={{ scale: 0.98, opacity: 0.85 }}
              >
                <Text color="$text_dark" fontSize="$4" fontWeight="500">
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#57594D" />
              </Card>
            ))}
          </YStack>

          {/* Section: Meer */}
          <YStack gap="$2.5">
            <Text color="$secondary" fontSize="$3" fontWeight="500" marginLeft="$1">
              Meer
            </Text>
            {meerItems.map((item) => (
              <Card
                key={item.id}
                flexDirection="row"
                backgroundColor="white"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$6"
                paddingHorizontal="$4"
                paddingVertical="$3"
                justifyContent="space-between"
                alignItems="center"
                onPress={item.onPress}
                pressStyle={{ scale: 0.98, opacity: 0.85 }}
              >
                <Text color="$text_dark" fontSize="$4" fontWeight="500">
                  {item.label}
                </Text>
                {item.icon}
              </Card>
            ))}
          </YStack>
        </YStack>
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNav
        activeTab="profile"
        onHomePress={() => router.push("/")}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
