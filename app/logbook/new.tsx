import PageContainer from "@/components/ui/PageContainer";
import ScreenContent from "@/components/ui/ScreenContent";
import { supabase } from "@/utils/supabase";
import { uploadImageAsset, validatePickedImage } from "@/utils/uploadImage";
import * as ImagePicker from "expo-image-picker";
import type { ImagePickerAsset } from "expo-image-picker";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons } from "@expo/vector-icons";
import { safeBack } from "@/utils/navigation";
import React, { useState } from "react";
import { Platform } from "react-native";
import { Spinner, Text, TextArea, XStack, YStack } from "tamagui";
import { useAlerts } from "@/context/AlertContext";

export default function NewLogScreen() {
  const { alert } = useAlerts();
  const [tasks, setTasks] = useState("");
  const [observations, setObservations] = useState("");
  const [followUps, setFollowUps] = useState("");
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert(
          "Toestemming nodig",
          "We hebben toegang tot je foto's nodig om een logfoto te kunnen kiezen.",
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      ...(Platform.OS !== "web" && {
        allowsEditing: true,
        aspect: [4, 3] as [number, number],
      }),
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      const validationError = validatePickedImage(selectedImage);
      if (validationError) {
        alert("Fout", validationError);
        return;
      }

      setImage(selectedImage);
    }
  };

  const handleSave = async () => {
    if (!tasks.trim()) {
      alert("Fout", "Vul ten minste één uitgevoerde taak in.");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Fout", "Log eerst in om een log op te slaan");
        return;
      }

      const taskList = tasks
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);

      let imageUrl: string | null = null;
      if (image) {
        const upload = await uploadImageAsset({
          asset: image,
          folder: "logs",
          userId: user.id,
        });
        imageUrl = upload.publicUrl;
      }

      const { error } = await supabase.from("garden_logs").insert({
        user_id: user.id,
        title: taskList[0] || "Log",
        ...(imageUrl && { image_url: imageUrl }),
        status: {
          tasks: taskList,
          observations: observations.trim(),
          followUps: followUps
            .split("\n")
            .map((f) => f.trim())
            .filter(Boolean),
        },
      });

      if (error) {
        alert("Fout", error.message);
      } else {
        alert("Succes", "Log opgeslagen!", [
          { text: "OK", onPress: () => safeBack() },
        ]);
      }
    } catch (error) {
      alert(
        "Fout",
        error instanceof Error
          ? error.message
          : "Er is iets misgegaan. Probeer het opnieuw.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer
      topNavTitle="Nieuwe log"
      activeTab="home"
    >
      <ScreenContent>
        <YStack gap="$5">
          {/* Taken die je hebt uitgevoerd */}
          <YStack gap="$2">
            <Text color="$text_dark" fontSize="$4" fontWeight="600">
              Taken die je hebt uitgevoerd:
            </Text>
            <TextArea
              placeholder="Typ hier je taken..."
              value={tasks}
              onChangeText={setTasks}
              minHeight={100}
              backgroundColor="white"
              borderColor="rgba(23, 51, 0, 0.1)"
              borderWidth={1}
              borderRadius="$6"
              padding="$4"
              fontSize="$4"
              color="$text_dark"
            />
          </YStack>

          {/* Observaties */}
          <YStack gap="$2">
            <Text color="$text_dark" fontSize="$4" fontWeight="600">
              Observaties
            </Text>
            <TextArea
              placeholder="Typ hier je observaties..."
              value={observations}
              onChangeText={setObservations}
              minHeight={80}
              backgroundColor="white"
              borderColor="rgba(23, 51, 0, 0.1)"
              borderWidth={1}
              borderRadius="$6"
              padding="$4"
              fontSize="$4"
              color="$text_dark"
            />
          </YStack>

          {/* Opvolgingen toevoegen */}
          <YStack gap="$2">
            <Text color="$text_dark" fontSize="$4" fontWeight="600">
              Opvolgingen toevoegen:
            </Text>
            <TextArea
              placeholder="Typ hier je opvolgingen..."
              value={followUps}
              onChangeText={setFollowUps}
              minHeight={80}
              backgroundColor="white"
              borderColor="rgba(23, 51, 0, 0.1)"
              borderWidth={1}
              borderRadius="$6"
              padding="$4"
              fontSize="$4"
              color="$text_dark"
            />
          </YStack>

          {/* Upload image */}
          <XStack
            backgroundColor="transparent"
            borderRadius="$6"
            borderWidth={2}
            borderStyle="dotted"
            borderColor="rgba(23, 51, 0, 0.35)"
            overflow="hidden"
            height={180}
            justifyContent="center"
            alignItems="center"
            onPress={pickImage}
            pressStyle={{ scale: 0.98, opacity: 0.75 }}
          >
            {image ? (
              <>
                <ExpoImage
                  source={{ uri: image.uri }}
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
                    setImage(null);
                  }}
                >
                  <Ionicons name="close" size={16} color="white" />
                </YStack>
              </>
            ) : (
              <YStack alignItems="center" gap="$2">
                <Ionicons name="cloud-upload-outline" size={30} color="#173300" />
                <Text fontSize="$4" fontWeight="700" color="#173300">
                  Upload image
                </Text>
                <Text fontSize="$2" color="rgba(23, 51, 0, 0.65)">
                  JPG, PNG of WebP
                </Text>
              </YStack>
            )}
          </XStack>

          {/* Log opslaan */}
          <XStack
            backgroundColor="#173300"
            borderRadius="$10"
            paddingVertical="$4"
            paddingHorizontal="$5"
            justifyContent="center"
            alignItems="center"
            marginTop="$2"
            gap="$2"
            opacity={saving ? 0.7 : 1}
            onPress={saving ? undefined : handleSave}
            pressStyle={{ scale: 0.96, opacity: 0.9 }}
          >
            {saving && <Spinner size="small" color="white" />}
            <Text fontSize="$4" fontWeight="700" color="white">
              {saving ? "Bezig..." : "Log opslaan"}
            </Text>
          </XStack>
        </YStack>
      </ScreenContent>
    </PageContainer>
  );
}
