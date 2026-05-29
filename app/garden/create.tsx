import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import ScreenContent from "@/components/ui/ScreenContent";
import { supabase } from "@/utils/supabase";
import { APPLIANCE_MAP } from "@/components/ui/ApplianceBadges";
import * as ImagePicker from "expo-image-picker";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform } from "react-native";
import { Card, Input, Spinner, Text, TextArea, XStack, YStack } from "tamagui";
import { useAlerts } from "@/context/AlertContext";

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
  const { alert } = useAlerts();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [appliances, setAppliances] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleAppliance = (key: string) => {
    setAppliances((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted" && Platform.OS !== "web") {
      alert(
        "Toestemming nodig",
        "We hebben toegang tot je foto's nodig om een tuinafbeelding te kunnen kiezen."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Fout", "Vul een tuinnaam in.");
      return;
    }
    if (!location.trim()) {
      alert("Fout", "Vul een locatie in.");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Fout", "Log eerst in om een tuin aan te maken");
        return;
      }

      const coords = await geocodeLocation(location.trim());

      let imageUrl: string | null = null;

      // Upload garden image if provided
      if (imageUri) {
        const fileName = `${user.id}_garden_${Date.now()}.jpg`;
        try {
          const response = await fetch(imageUri);
          const arrayBuffer = await response.arrayBuffer();
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("garden-images")
              .upload(fileName, arrayBuffer, {
                contentType: "image/jpeg",
                upsert: true,
              });

          if (uploadError) {
            console.warn("Failed to upload garden image:", uploadError);
          } else if (uploadData) {
            const { data: urlData } = supabase.storage
              .from("garden-images")
              .getPublicUrl(fileName);
            imageUrl = urlData?.publicUrl ?? null;
          }
        } catch (uploadFetchErr) {
          console.warn("Error reading or uploading the local file:", uploadFetchErr);
        }
      }

      const insertData = {
        owner_id: user.id,
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        appliances: appliances,
        ...(imageUrl && { image_url: imageUrl }),
        ...(coords && {
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      };

      const { error } = await supabase.from("gardens").insert(insertData as any);

      if (error) {
        alert("Fout", error.message);
      } else {
        alert("Succes", "Tuin aangemaakt!", [
          { text: "OK", onPress: () => router.push("/") },
        ]);
      }
    } catch {
      alert("Fout", "Er is iets misgegaan. Probeer het opnieuw.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer
      topNavTitle="Tuin aanmaken"
      onBackPress={() => router.back()}
      activeTab="home"
    >
      <ScreenContent>
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

          <YStack gap="$1.5">
            <Text color="$secondary" fontSize="$3" fontWeight="500">
              Voorzieningen
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {Object.entries(APPLIANCE_MAP).map(([key, { label, icon }]) => {
                const isActive = appliances.includes(key);
                return (
                  <XStack
                    key={key}
                    onPress={() => toggleAppliance(key)}
                    backgroundColor={isActive ? "$primary" : "white"}
                    borderColor={isActive ? "$primary" : "$borderColor"}
                    borderWidth={1}
                    borderRadius={32}
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    gap="$2"
                    alignItems="center"
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <MaterialCommunityIcons
                      name={icon}
                      size={16}
                      color={isActive ? "white" : "#172211"}
                    />
                    <Text fontSize="$3" color={isActive ? "white" : "#172211"} fontWeight="500">
                      {label}
                    </Text>
                  </XStack>
                );
              })}
            </XStack>
          </YStack>

          {/* Garden Image Upload */}
          <YStack gap="$1.5">
            <Text color="$secondary" fontSize="$3" fontWeight="500">
              Tuinafbeelding
            </Text>
            <Card
              borderRadius="$6"
              borderWidth={1}
              borderColor="$borderColor"
              overflow="hidden"
              height={200}
              pressStyle={{ scale: 0.98, opacity: 0.9 }}
              onPress={pickImage}
            >
              {imageUri ? (
                <>
                  <ExpoImage
                    source={{ uri: imageUri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <YStack
                    position="absolute"
                    top={8}
                    right={8}
                    backgroundColor="rgba(0,0,0,0.6)"
                    borderRadius={20}
                    padding={6}
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      setImageUri(null);
                    }}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </YStack>
                </>
              ) : (
                <YStack
                  flex={1}
                  justifyContent="center"
                  alignItems="center"
                  gap="$2"
                >
                  <Ionicons name="camera" size={32} color="#57594D" />
                  <Text color="text_light" fontSize="$3">
                    Tik om een afbeelding te selecteren
                  </Text>
                </YStack>
              )}
            </Card>
          </YStack>
        </YStack>

        <XStack gap="$2" alignItems="center" justifyContent="center">
          {saving && <Spinner size="small" color="$primary" />}
          <Button
            label={saving ? "Bezig..." : "Tuin aanmaken"}
            onPress={handleCreate}
            disabled={saving}
            flex={1}
          />
        </XStack>
      </ScreenContent>
    </PageContainer>
  );
}
