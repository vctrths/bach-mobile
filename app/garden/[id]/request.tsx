import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import { supabase } from "@/utils/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
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
  startDate: z.custom<Date>((val) => {
    if (!(val instanceof Date) || isNaN(val.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return val >= today;
  }, {
    message: "Startdatum kan niet in het verleden liggen",
  }),
});

export default function GardenRequestScreen() {
  const { id } = useLocalSearchParams();
  const [gardenName, setGardenName] = useState("Aanvraag");
  const [motivation, setMotivation] = useState("");
  const [collabType, setCollabType] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [checkingRequest, setCheckingRequest] = useState(true);

  useEffect(() => {
    async function fetchGarden() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("gardens")
          .select("name")
          .eq("id", id)
          .single();
        if (data && !error) {
          setGardenName((data as any).name);
        }
      } catch {
        // fallback: keep default "Aanvraag"
      }
    }
    fetchGarden();
  }, [id]);

  useEffect(() => {
    async function checkExistingRequest() {
      if (!id) return;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setCheckingRequest(false);
          return;
        }

        const { data, error } = await supabase
          .from("garden_requests")
          .select("id")
          .eq("garden_id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (data && !error) {
          setHasExistingRequest(true);
        }
      } catch (err) {
        console.error("Error checking existing request:", err);
      } finally {
        setCheckingRequest(false);
      }
    }
    checkExistingRequest();
  }, [id]);

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
    if (hasExistingRequest) {
      Alert.alert(
        "Aanvraag bestaat al",
        "Je hebt al een aanvraag verstuurd voor deze tuin."
      );
      return;
    }

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
    <PageContainer
      topNavTitle={gardenName}
      onBackPress={() => router.back()}
      activeTab="home"
    >
      <YStack paddingHorizontal={16} paddingTop="$6" gap={32} paddingBottom={200}>
        {/* Existing Request Warning */}
        {hasExistingRequest && (
          <YStack
            backgroundColor="rgba(239, 68, 68, 0.1)"
            borderColor="#ef4444"
            borderWidth={1}
            borderRadius={12}
            padding={16}
            gap={8}
          >
            <Text color="#ef4444" fontSize={16} fontWeight="600">
              Aanvraag al verstuurd
            </Text>
            <Text color="#ef4444" fontSize={14}>
              Je hebt al een aanvraag voor deze tuin verstuurd. Je kan slechts één aanvraag per tuin indienen.
            </Text>
          </YStack>
        )}

        {/* Form Fields */}
        <YStack gap={16}>
          {/* Motivation Section */}
          <YStack gap={16}>
            <Text color="#000000" fontSize={16} fontWeight="400">
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
              backgroundColor="white"
              borderWidth={1}
              borderColor={errors.motivation ? "$error" : "#EAEAEA"}
              borderRadius={8}
              padding={12}
              focusStyle={{
                borderColor: errors.motivation ? "$error" : "#000000",
              }}
              maxLength={300}
            />
            <XStack justifyContent="flex-end">
              <Text fontSize={14} color="#929292">
                {motivation.length}/300
              </Text>
            </XStack>
            {errors.motivation && (
              <Text color="red" fontSize={14}>
                {errors.motivation}
              </Text>
            )}
          </YStack>

          {/* Collaboration Type Section */}
          <YStack gap={16}>
            <Text color="#000000" fontSize={16} fontWeight="400">
              Type samenwerking:
            </Text>
            <XStack
              backgroundColor="white"
              borderWidth={1}
              borderColor={errors.collaborationType ? "$error" : "#EAEAEA"}
              borderRadius={8}
              padding={12}
              paddingHorizontal={16}
              alignItems="center"
              justifyContent="space-between"
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
                fontSize={14}
                color={collabType ? "#000000" : "#929292"}
              />
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color="#000000"
              />
            </XStack>
            {errors.collaborationType && (
              <Text color="red" fontSize={14}>
                {errors.collaborationType}
              </Text>
            )}
          </YStack>

          {/* Days Selection Section */}
          <YStack gap={8}>
            <XStack gap={4} alignItems="flex-start" padding={10}>
              {/* Labels column */}
              <YStack width={56} gap={12} alignItems="flex-start">
                <Text color="#56594D" fontSize={16} fontWeight="500" opacity={0.4}>
                  Dag
                </Text>
                <Text color="#56594D" fontSize={16} fontWeight="500" opacity={0.4}>
                  Aanw.
                </Text>
              </YStack>

              {/* Day columns */}
              {DAYS.map((day) => (
                <YStack
                  key={day.key}
                  flex={1}
                  alignItems="center"
                  gap={12}
                  onPress={() => toggleDay(day.key)}
                >
                  <Text
                    color={selectedDays.includes(day.key) ? "$primary" : "#36392B"}
                    fontSize={16}
                    fontWeight="500"
                    opacity={selectedDays.includes(day.key) ? 1 : 0.4}
                  >
                    {day.label}
                  </Text>
                  <Circle
                    size={8}
                    backgroundColor={
                      selectedDays.includes(day.key)
                        ? "$primary"
                        : "rgba(0, 0, 0, 0.25)"
                    }
                  />
                </YStack>
              ))}
            </XStack>
            {errors.days && (
              <Text color="red" fontSize={14}>
                {errors.days}
              </Text>
            )}
          </YStack>

          {/* Start Date Section */}
          <YStack gap={16}>
            <Text color="#000000" fontSize={16} fontWeight="400">
              Gewenste start datum:
            </Text>
            <XStack gap={8}>
              <XStack
                flex={1}
                backgroundColor="#F1F1F1"
                borderWidth={1}
                borderColor={errors.startDate ? "red" : "#E3E3E3"}
                borderRadius={50}
                padding={8}
                paddingHorizontal={16}
                alignItems="center"
                justifyContent="center"
                gap={12}
                onPress={() => setShowPicker((prev) => !prev)}
                pressStyle={{
                  scale: 0.98,
                  opacity: 0.9,
                }}
              >
                <Text
                  color={startDate ? "#000000" : "#929292"}
                  fontSize={16}
                  fontWeight="600"
                >
                  {startDate
                    ? `${startDate.getDate().toString().padStart(2, "0")}`
                    : "DD"}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={16}
                  color="#000000"
                />
              </XStack>
              <XStack
                flex={1}
                backgroundColor="#F1F1F1"
                borderWidth={1}
                borderColor={errors.startDate ? "red" : "#E3E3E3"}
                borderRadius={50}
                padding={8}
                paddingHorizontal={16}
                alignItems="center"
                justifyContent="center"
                gap={12}
                onPress={() => setShowPicker((prev) => !prev)}
                pressStyle={{
                  scale: 0.98,
                  opacity: 0.9,
                }}
              >
                <Text
                  color={startDate ? "#000000" : "#929292"}
                  fontSize={16}
                  fontWeight="600"
                >
                  {startDate
                    ? `${(startDate.getMonth() + 1).toString().padStart(2, "0")}`
                    : "MM"}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={16}
                  color="#000000"
                />
              </XStack>
              <XStack
                flex={1}
                backgroundColor="#F1F1F1"
                borderWidth={1}
                borderColor={errors.startDate ? "red" : "#E3E3E3"}
                borderRadius={50}
                padding={8}
                paddingHorizontal={16}
                alignItems="center"
                justifyContent="center"
                gap={12}
                onPress={() => setShowPicker((prev) => !prev)}
                pressStyle={{
                  scale: 0.98,
                  opacity: 0.9,
                }}
              >
                <Text
                  color={startDate ? "#000000" : "#929292"}
                  fontSize={16}
                  fontWeight="600"
                >
                  {startDate ? `${startDate.getFullYear()}` : "YYYY"}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={16}
                  color="#000000"
                />
              </XStack>
            </XStack>
            {errors.startDate && (
              <Text color="red" fontSize={14}>
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
          label={
            checkingRequest
              ? "Laden..."
              : hasExistingRequest
              ? "Aanvraag al verstuurd"
              : loading
              ? "Bezig..."
              : "Verzoek sturen"
          }
          backgroundColor={hasExistingRequest ? "#d1d5db" : "#EAF0D8"}
          color={hasExistingRequest ? "#6b7280" : "#172211"}
          borderWidth={1}
          borderColor={hasExistingRequest ? "#9ca3af" : "#D4E1AE"}
          onPress={handleSubmit}
          disabled={loading || hasExistingRequest || checkingRequest}
          opacity={loading || hasExistingRequest || checkingRequest ? 0.7 : 1}
        />
      </YStack>
    </PageContainer>
  );
}
