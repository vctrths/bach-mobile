import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { OnboardingContext } from "@/context/OnboardingContext";
import { router } from "expo-router";
import React, { useContext, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { Input, Text, TextArea, YStack } from "tamagui";

export default function PersonalDetailsScreen() {
  const { data, updateData } = useContext(OnboardingContext);

  const [firstName, setFirstName] = useState(data.firstName || "Victor");
  const [lastName, setLastName] = useState(data.lastName || "Thys");
  const [email, setEmail] = useState(data.email || "victor.thys@gmail.com");
  const [description, setDescription] = useState(
    data.description ||
      "Ik woon in hartje Leuven en heb altijd gedroomd van een eigen tuin. Helaas heb ik zelf geen groene vingers of buitenruimte. Daarom ben ik op zoek naar een plek waar ik mijn passie voor planten en bloemen kan uitleven.",
  );

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Fout", "Vul je voornaam en achternaam in.");
      return;
    }
    updateData({ firstName, lastName, email, description });
    Alert.alert("Succes", "Je persoonlijke gegevens zijn bijgewerkt!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <ThemedSafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        <YStack paddingHorizontal="$5" paddingTop="$5" gap="$5">
          {/* Header Block */}
          <TopNavPill title="Persoonlijke gegevens" />

          {/* Form */}
          <YStack gap="$4">
            <YStack gap="$1.5">
              <Text
                color="$secondary"
                fontSize="$3"
                fontWeight="500"
                marginLeft="$1"
              >
                Voornaam
              </Text>
              <Input
                value={firstName}
                onChangeText={setFirstName}
                backgroundColor="white"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$6"
                paddingHorizontal="$4"
                paddingVertical="$3"
                fontSize="$4"
                color="$text_dark"
                focusStyle={{ borderColor: "$primary" }}
              />
            </YStack>

            <YStack gap="$1.5">
              <Text
                color="$secondary"
                fontSize="$3"
                fontWeight="500"
                marginLeft="$1"
              >
                Achternaam
              </Text>
              <Input
                value={lastName}
                onChangeText={setLastName}
                backgroundColor="white"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$6"
                paddingHorizontal="$4"
                paddingVertical="$3"
                fontSize="$4"
                color="$text_dark"
                focusStyle={{ borderColor: "$primary" }}
              />
            </YStack>

            <YStack gap="$1.5">
              <Text
                color="$secondary"
                fontSize="$3"
                fontWeight="500"
                marginLeft="$1"
              >
                E-mailadres
              </Text>
              <Input
                value={email}
                onChangeText={setEmail}
                backgroundColor="white"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$6"
                paddingHorizontal="$4"
                paddingVertical="$3"
                fontSize="$4"
                color="$text_dark"
                keyboardType="email-address"
                autoCapitalize="none"
                focusStyle={{ borderColor: "$primary" }}
              />
            </YStack>

            <YStack gap="$1.5">
              <Text
                color="$secondary"
                fontSize="$3"
                fontWeight="500"
                marginLeft="$1"
              >
                Beschrijving / Bio
              </Text>
              <TextArea
                value={description}
                onChangeText={setDescription}
                backgroundColor="white"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$6"
                paddingHorizontal="$4"
                paddingVertical="$3"
                fontSize="$4"
                color="$text_dark"
                minHeight={110}
                focusStyle={{ borderColor: "$primary" }}
              />
            </YStack>
          </YStack>

          {/* Save Button */}
          <Button
            backgroundColor="$background"
            color="white"
            label="Opslaan"
            onPress={handleSave}
            marginTop="$2"
          />
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
