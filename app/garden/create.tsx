import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import ScreenContent from "@/components/ui/ScreenContent";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { Input, Spinner, Text, TextArea, XStack, YStack } from "tamagui";

async function geocodeLocation(location: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
      { headers: { "User-Agent": "GroeneVingersApp/1.0" } }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
}

export default function GardenCreateScreen() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Fout", "Vul een tuinnaam in.");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Fout", "Vul een locatie in.");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Fout", "Log eerst in om een tuin aan te maken");
        return;
      }

      const coords = await geocodeLocation(location.trim());

      const insertData = {
        owner_id: user.id,
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        ...(coords && {
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      };

      const { error } = await supabase.from("gardens").insert(insertData as any);

      if (error) {
        Alert.alert("Fout", error.message);
      } else {
        Alert.alert("Succes", "Tuin aangemaakt!", [
          { text: "OK", onPress: () => router.push("/owner/dashboard") },
        ]);
      }
    } catch {
      Alert.alert("Fout", "Er is iets misgegaan. Probeer het opnieuw.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenContent>
          <TopNavPill
            title="Tuin aanmaken"
            onBackPress={() => router.back()}
          />

          <YStack gap="$4">
            <YStack gap="$1.5">
              <Text color="$secondary" fontSize="$3" fontWeight="500">
                Tuinnaam
              </Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Bijv. 'Arno's tuin'"
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
              <Text color="$secondary" fontSize="$3" fontWeight="500">
                Locatie
              </Text>
              <Input
                value={location}
                onChangeText={setLocation}
                placeholder="Bijv. 'Leuven, België'"
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
              <Text color="$secondary" fontSize="$3" fontWeight="500">
                Beschrijving
              </Text>
              <TextArea
                value={description}
                onChangeText={setDescription}
                placeholder="Beschrijf je tuin..."
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

          <XStack gap="$2" alignItems="center" justifyContent="center">
            {saving && <Spinner size="small" color="$primary" />}
            <Button
              label={saving ? "Bezig..." : "Tuin aanmaken"}
              backgroundColor="$background"
              color="white"
              onPress={handleCreate}
              disabled={saving}
              opacity={saving ? 0.7 : 1}
              flex={1}
            />
          </XStack>
        </ScreenContent>
      </ScrollView>

      <BottomNav
        activeTab="home"
        onMessagePress={() => router.push("/messages" as any)}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
