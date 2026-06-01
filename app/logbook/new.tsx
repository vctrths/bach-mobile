import PageContainer from "@/components/ui/PageContainer";
import ScreenContent from "@/components/ui/ScreenContent";
import { supabase } from "@/utils/supabase";
import { uploadImageAsset, validatePickedImage } from "@/utils/uploadImage";
import * as ImagePicker from "expo-image-picker";
import type { ImagePickerAsset } from "expo-image-picker";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { safeBack } from "@/utils/navigation";
import React, { useState } from "react";
import { Platform } from "react-native";
import { Spinner, Text, TextArea, XStack, YStack } from "tamagui";
import { useAlerts } from "@/context/AlertContext";

type FollowUpDraft = {
  id: string;
  text: string;
  dueDate: Date | null;
};

function createFollowUpDraft(): FollowUpDraft {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: "",
    dueDate: null,
  };
}

function formatDateForInput(date: Date | null) {
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function parseInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateLabel(date: Date | null) {
  if (!date) return "Geen do-datum";
  return date.toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function NewLogScreen() {
  const { alert } = useAlerts();
  const [tasks, setTasks] = useState("");
  const [observations, setObservations] = useState("");
  const [followUps, setFollowUps] = useState<FollowUpDraft[]>([
    createFollowUpDraft(),
  ]);
  const [activeDatePickerId, setActiveDatePickerId] = useState<string | null>(
    null,
  );
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
      const followUpList = followUps
        .map((followUp) => ({
          text: followUp.text.trim(),
          ...(followUp.dueDate && {
            dueDate: formatDateForInput(followUp.dueDate),
          }),
        }))
        .filter((followUp) => followUp.text.length > 0);

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
          followUps: followUpList,
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

  const updateFollowUpText = (id: string, text: string) => {
    setFollowUps((current) =>
      current.map((followUp) =>
        followUp.id === id ? { ...followUp, text } : followUp,
      ),
    );
  };

  const updateFollowUpDueDate = (id: string, dueDate: Date | null) => {
    setFollowUps((current) =>
      current.map((followUp) =>
        followUp.id === id ? { ...followUp, dueDate } : followUp,
      ),
    );
  };

  const removeFollowUp = (id: string) => {
    setFollowUps((current) =>
      current.length === 1
        ? current.map((followUp) =>
            followUp.id === id
              ? { ...followUp, text: "", dueDate: null }
              : followUp,
          )
        : current.filter((followUp) => followUp.id !== id),
    );
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
            <YStack gap="$3">
              {followUps.map((followUp) => (
                <YStack
                  key={followUp.id}
                  backgroundColor="white"
                  borderColor="rgba(23, 51, 0, 0.1)"
                  borderWidth={1}
                  borderRadius="$6"
                  padding="$3"
                  gap="$3"
                >
                  <TextArea
                    placeholder="Typ hier je opvolging..."
                    value={followUp.text}
                    onChangeText={(text) =>
                      updateFollowUpText(followUp.id, text)
                    }
                    minHeight={54}
                    backgroundColor="transparent"
                    borderWidth={0}
                    padding={0}
                    fontSize="$4"
                    color="$text_dark"
                  />

                  <XStack alignItems="center" justifyContent="space-between">
                    <XStack
                      alignItems="center"
                      gap="$2"
                      onPress={() =>
                        setActiveDatePickerId((current) =>
                          current === followUp.id ? null : followUp.id,
                        )
                      }
                      pressStyle={{ scale: 0.98, opacity: 0.8 }}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#173300"
                      />
                      <Text color="#173300" fontSize="$3" fontWeight="600">
                        {formatDateLabel(followUp.dueDate)}
                      </Text>
                    </XStack>

                    <XStack
                      width={32}
                      height={32}
                      borderRadius={16}
                      justifyContent="center"
                      alignItems="center"
                      onPress={() => removeFollowUp(followUp.id)}
                      pressStyle={{ scale: 0.92, opacity: 0.75 }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#57594D" />
                    </XStack>
                  </XStack>

                  {Platform.OS === "web" &&
                    activeDatePickerId === followUp.id && (
                      <input
                        type="date"
                        value={formatDateForInput(followUp.dueDate)}
                        onChange={(e) => {
                          if (!e.target.value) {
                            updateFollowUpDueDate(followUp.id, null);
                            return;
                          }

                          const date = parseInputDate(e.target.value);
                          if (date) {
                            updateFollowUpDueDate(followUp.id, date);
                          }
                        }}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          minHeight: 44,
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E3E3E3",
                          outline: "none",
                          fontSize: "16px",
                          backgroundColor: "#fff",
                          color: "#000",
                        }}
                      />
                    )}

                  {Platform.OS !== "web" &&
                    activeDatePickerId === followUp.id && (
                      <DateTimePicker
                        value={followUp.dueDate || new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(_, selectedDate) => {
                          if (Platform.OS !== "ios") {
                            setActiveDatePickerId(null);
                          }
                          if (selectedDate) {
                            updateFollowUpDueDate(followUp.id, selectedDate);
                          }
                        }}
                      />
                    )}
                </YStack>
              ))}

              <XStack
                borderRadius="$10"
                borderWidth={1}
                borderColor="rgba(23, 51, 0, 0.18)"
                paddingVertical="$3"
                paddingHorizontal="$4"
                justifyContent="center"
                alignItems="center"
                gap="$2"
                onPress={() =>
                  setFollowUps((current) => [...current, createFollowUpDraft()])
                }
                pressStyle={{ scale: 0.96, opacity: 0.85 }}
              >
                <Ionicons name="add" size={18} color="#173300" />
                <Text color="#173300" fontSize="$3" fontWeight="700">
                  Opvolging toevoegen
                </Text>
              </XStack>
            </YStack>
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
                  top={10}
                  right={10}
                  width={32}
                  height={32}
                  backgroundColor="rgba(0,0,0,0.6)"
                  borderRadius={16}
                  justifyContent="center"
                  alignItems="center"
                  zIndex={1}
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
