import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { supabase } from "@/utils/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Circle, Text, TextArea, Input, XStack, YStack } from "tamagui";
import { z } from "zod";

const DAYS = [
  { key: "M", label: "M" },
  { key: "D", label: "D" },
  { key: "W", label: "W" },
  { key: "Do", label: "D" },
  { key: "V", label: "V" },
  { key: "Za", label: "Z" },
  { key: "Zo", label: "Z" },
];

const requestSchema = z.object({
  motivation: z
    .string()
    .min(1, "Vul een motivatie in")
    .max(300, "Max 300 tekens"),
  collaborationType: z.string().min(1, "Selecteer een type samenwerking"),
  days: z.array(z.string()).min(1, "Selecteer minstens één dag"),
  startDate: z.custom<Date>((val) => val instanceof Date && !isNaN(val.getTime()), {
    message: "Selecteer een startdatum",
  }),
});

export default function GardenRequestScreen() {
  const { id } = useLocalSearchParams();
  const [motivation, setMotivation] = useState("");
  const [collabType, setCollabType] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const toggleDay = (dayKey: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey)
        ? prev.filter((d) => d !== dayKey)
        : [...prev, dayKey]
    );
    setErrors((e) => ({ ...e, days: "" }));
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      setStartDate(selectedDate);
      setErrors((e) => ({ ...e, startDate: "" }));
    }
  };

  const handleSubmit = async () => {
    const result = requestSchema.safeParse({
      motivation,
      collaborationType: collabType,
      days: selectedDays,
      startDate: startDate || undefined,
    });

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Fout", "Log eerst in om een aanvraag te sturen");
        return;
      }

      const { error } = await supabase.from("garden_requests").insert({
        garden_id: id,
        user_id: user.id,
        motivation,
        collaboration_type: collabType,
        days: selectedDays,
        start_date: startDate?.toISOString().split("T")[0],
      });

      if (error) {
        Alert.alert("Fout", error.message);
      } else {
        router.push("/succesverzoek");
      }
    } catch (error) {
      Alert.alert("Fout", "Er is iets misgegaan. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$4" paddingTop="$6" gap="$6" paddingBottom={200}>
          {/* Top Navigation */}
          <TopNavPill
            title="Aanvraag"
            onBackPress={() => router.back()}
          />

          {/* Main Form Container */}
          <YStack
            backgroundColor="rgba(255, 255, 255, 0.4)"
            borderRadius="$10"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.45)"
            padding="$4"
            gap="$6"
            overflow="hidden"
            shadowColor="#0f1a0f"
            shadowOpacity={0.08}
            shadowRadius={16}
            shadowOffset={{ width: 0, height: 4 }}
            elevation={4}
          >
            <BlurView
              intensity={45}
              tint="light"
              experimentalBlurMethod="dimezisBlurView"
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Motivation Section */}
            <YStack gap="$3">
              <Text color="$text_dark" fontSize="$3" fontWeight="500">
                Motivatie (max 300 tekens):
              </Text>
              <TextArea
                placeholder="Typ hier je motivatie..."
                value={motivation}
                onChangeText={(val) => {
                  setMotivation(val.slice(0, 300));
                  setErrors((e) => ({ ...e, motivation: "" }));
                }}
                minHeight={100}
                backgroundColor="$canvas"
                borderColor={errors.motivation ? "$error" : "$borderColor"}
                focusStyle={{
                  borderColor: errors.motivation ? "$error" : "$background",
                }}
                maxLength={300}
              />
              <XStack justifyContent="flex-end">
                <Text fontSize="$2" color="$text_light">
                  {motivation.length}/300
                </Text>
              </XStack>
              {errors.motivation && (
                <Text color="$error" fontSize="$2">
                  {errors.motivation}
                </Text>
              )}
            </YStack>

            {/* Collaboration Type Section */}
            <YStack gap="$3">
              <Text color="$text_dark" fontSize="$3" fontWeight="500">
                Type samenwerking:
              </Text>
              <XStack
                backgroundColor="$canvas"
                borderWidth={1}
                borderColor={errors.collaborationType ? "$error" : "$borderColor"}
                borderRadius="$4"
                padding="$3"
                alignItems="center"
                justifyContent="space-between"
                focusStyle={{
                  borderColor: errors.collaborationType ? "$error" : "$background",
                }}
              >
                <Input
                  flex={1}
                  placeholder="Typ hier je samenwerkingstype..."
                  value={collabType}
                  onChangeText={(val) => {
                    setCollabType(val);
                    setErrors((e) => ({ ...e, collaborationType: "" }));
                  }}
                  backgroundColor="transparent"
                  borderWidth={0}
                  padding={0}
                />
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color="$text_dark"
                />
              </XStack>
              {errors.collaborationType && (
                <Text color="$error" fontSize="$2">
                  {errors.collaborationType}
                </Text>
              )}
            </YStack>

            {/* Days Selection Section */}
            <YStack gap="$3">
              <Text color="$text_dark" fontSize="$3" fontWeight="500">
                Percelen
              </Text>
              <XStack justifyContent="space-between" paddingHorizontal="$2">
                {DAYS.map((day) => (
                  <YStack key={day.key} alignItems="center" gap="$2">
                    <Circle
                      size={44}
                      backgroundColor={
                        selectedDays.includes(day.key)
                          ? "rgba(55, 57, 43, 0.1)"
                          : "rgba(255, 255, 255, 0.4)"
                      }
                      borderWidth={1}
                      borderColor={
                        selectedDays.includes(day.key)
                          ? "$primary"
                          : "rgba(0, 0, 0, 0.1)"
                      }
                      justifyContent="center"
                      alignItems="center"
                      onPress={() => toggleDay(day.key)}
                      pressStyle={{ scale: 0.94, opacity: 0.85 }}
                    >
                      <Text
                        color={
                          selectedDays.includes(day.key)
                            ? "$primary"
                            : "$text_dark"
                        }
                        fontSize="$4"
                        fontWeight="500"
                      >
                        {day.label}
                      </Text>
                    </Circle>
                    <Circle
                      size={8}
                      backgroundColor={
                        selectedDays.includes(day.key)
                          ? "$primary"
                          : "rgba(0, 0, 0, 0.1)"
                      }
                    />
                  </YStack>
                ))}
              </XStack>
              {errors.days && (
                <Text color="$error" fontSize="$2">
                  {errors.days}
                </Text>
              )}
            </YStack>

            {/* Start Date Section */}
            <YStack gap="$3">
              <Text color="$text_dark" fontSize="$3" fontWeight="500">
                Gewenste start datum:
              </Text>
              <XStack gap="$3">
                <XStack
                  flex={1}
                  backgroundColor="$canvas"
                  borderWidth={1}
                  borderColor={errors.startDate ? "$error" : "$borderColor"}
                  borderRadius="$6"
                  padding="$3"
                  alignItems="center"
                  justifyContent="center"
                  gap="$2"
                  onPress={() => setShowPicker(true)}
                  pressStyle={{
                    scale: 0.98,
                    opacity: 0.9,
                  }}
                >
                  <Text
                    color={startDate ? "$text_dark" : "$text_light"}
                    fontSize="$4"
                    fontWeight="500"
                  >
                    {startDate
                      ? `${startDate.getDate().toString().padStart(2, "0")}`
                      : "DD"}
                  </Text>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color="$text_dark"
                  />
                </XStack>
                <XStack
                  flex={1}
                  backgroundColor="$canvas"
                  borderWidth={1}
                  borderColor={errors.startDate ? "$error" : "$borderColor"}
                  borderRadius="$6"
                  padding="$3"
                  alignItems="center"
                  justifyContent="center"
                  gap="$2"
                  onPress={() => setShowPicker(true)}
                  pressStyle={{
                    scale: 0.98,
                    opacity: 0.9,
                  }}
                >
                  <Text
                    color={startDate ? "$text_dark" : "$text_light"}
                    fontSize="$4"
                    fontWeight="500"
                  >
                    {startDate
                      ? `${(startDate.getMonth() + 1).toString().padStart(2, "0")}`
                      : "MM"}
                  </Text>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color="$text_dark"
                  />
                </XStack>
                <XStack
                  flex={1}
                  backgroundColor="$canvas"
                  borderWidth={1}
                  borderColor={errors.startDate ? "$error" : "$borderColor"}
                  borderRadius="$6"
                  padding="$3"
                  alignItems="center"
                  justifyContent="center"
                  gap="$2"
                  onPress={() => setShowPicker(true)}
                  pressStyle={{
                    scale: 0.98,
                    opacity: 0.9,
                  }}
                >
                  <Text
                    color={startDate ? "$text_dark" : "$text_light"}
                    fontSize="$4"
                    fontWeight="500"
                  >
                    {startDate ? `${startDate.getFullYear()}` : "YYYY"}
                  </Text>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color="$text_dark"
                  />
                </XStack>
              </XStack>
              {errors.startDate && (
                <Text color="$error" fontSize="$2">
                  {errors.startDate}
                </Text>
              )}
            </YStack>
          </YStack>

          {showPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          {/* Submit Button */}
          <Button
            label={loading ? "Bezig..." : "Verzoek sturen"}
            backgroundColor="$background"
            color="$white"
            onPress={handleSubmit}
            disabled={loading}
            opacity={loading ? 0.7 : 1}
          />
        </YStack>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="home"
        onMessagePress={() => router.push("/messages" as any)}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
