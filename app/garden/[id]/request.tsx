import Button from "@/components/ui/Button";
import PageContainer from "@/components/ui/PageContainer";
import WeekdayPicker from "@/components/ui/WeekdayPicker";
import { useAlerts } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Select, Text, TextArea, XStack, YStack } from "tamagui";
import { z } from "zod";

const REQUEST_TIMEOUT_MS = 12000;

const COLLABORATION_TYPES = [
  { value: "weekly_maintenance", label: "Wekelijks onderhoud" },
  { value: "harvest_help", label: "Oogsthulp" },
  { value: "shared_gardening", label: "Samen tuinieren" },
  { value: "one_time_help", label: "Eenmalige hulp" },
];

const requestSchema = z.object({
  motivation: z
    .string()
    .min(1, "Vul een motivatie in")
    .max(300, "Max 300 tekens"),
  collaborationType: z.string().min(1, "Selecteer een type samenwerking"),
  days: z.array(z.string()).min(1, "Selecteer minstens één dag"),
  startDate: z.custom<Date>(
    (val) => {
      if (!(val instanceof Date) || isNaN(val.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return val >= today;
    },
    {
      message: "Startdatum kan niet in het verleden liggen",
    },
  ),
});

function formatDateForSupabase(date: Date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMessage = "De server reageert niet. Probeer het opnieuw.",
) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, REQUEST_TIMEOUT_MS);

    Promise.resolve(promise)
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

export default function GardenRequestScreen() {
  const { id } = useLocalSearchParams();
  const gardenId = Array.isArray(id) ? id[0] : id;
  const { alert } = useAlerts();
  const { loading: authLoading, profile } = useAuth();
  const [gardenName, setGardenName] = useState("Aanvraag");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [motivation, setMotivation] = useState("");
  const [collabType, setCollabType] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [checkingRequest, setCheckingRequest] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);
  const minDateValue = minDate.toISOString().split("T")[0];

  useEffect(() => {
    async function fetchGarden() {
      if (!gardenId) return;
      try {
        const {
          data: { user },
        } = await withTimeout(supabase.auth.getUser());
        if (user) setCurrentUserId(user.id);

        const { data, error } = await withTimeout(
          supabase
            .from("gardens")
            .select("name, owner_id")
            .eq("id", gardenId)
            .single(),
        );
        if (data && !error) {
          setGardenName((data as any).name);
          setOwnerId((data as any).owner_id);
        }
      } catch {
        // fallback: keep default "Aanvraag"
      }
    }
    fetchGarden();
  }, [gardenId]);

  useEffect(() => {
    async function checkExistingRequest() {
      if (!gardenId) return;
      try {
        const {
          data: { user },
        } = await withTimeout(supabase.auth.getUser());
        if (!user) {
          setCheckingRequest(false);
          return;
        }

        const { data, error } = await withTimeout(
          supabase
            .from("garden_requests")
            .select("id")
            .eq("garden_id", gardenId)
            .eq("user_id", user.id)
            .maybeSingle(),
        );

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
  }, [gardenId]);

  const toggleDay = (dayKey: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey)
        ? prev.filter((d) => d !== dayKey)
        : [...prev, dayKey],
    );
    setErrors((e) => ({ ...e, days: "" }));
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      if (selectedDate < minDate) {
        setStartDate(null);
        setErrors((e) => ({
          ...e,
          startDate: "Startdatum kan niet in het verleden liggen",
        }));
        return;
      }
      setStartDate(selectedDate);
      setErrors((e) => ({ ...e, startDate: "" }));
    }
  };

  const openFallbackSuccess = () => {
    alert(
      "Aanvraag verstuurd",
      "Je aanvraag is verstuurd. Je kan je berichten later openen zodra de chat klaarstaat.",
      [{ text: "OK", onPress: () => router.push(`/garden/${gardenId}`) }],
    );
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!gardenId) {
      alert("Fout", "Deze tuin kon niet gevonden worden.");
      return;
    }

    if (hasExistingRequest) {
      alert(
        "Aanvraag bestaat al",
        "Je hebt al een aanvraag verstuurd voor deze tuin.",
      );
      return;
    }

    if (ownerId && currentUserId && ownerId === currentUserId) {
      alert(
        "Dit is je eigen tuin",
        "Je kan geen aanvraag sturen voor je eigen tuin.",
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
    let requestCreated = false;
    try {
      const {
        data: { user },
        error: userError,
      } = await withTimeout(supabase.auth.getUser());

      if (userError || !user) {
        alert("Fout", "Log eerst in om een aanvraag te sturen");
        return;
      }

      if (!profile?.isPremium) {
        alert(
          "Pro vereist",
          "Je hebt een Pro-abonnement nodig om aanvragen te versturen.",
          [
            {
              text: "Bekijk Pro",
              onPress: () => router.push("/pro"),
            },
          ],
        );
        return;
      }

      const { error } = await withTimeout(
        supabase.from("garden_requests").insert({
          garden_id: gardenId,
          user_id: user.id,
          motivation,
          collaboration_type: collabType,
          days: selectedDays,
          start_date: startDate ? formatDateForSupabase(startDate) : null,
        }),
      );

      if (error) {
        alert("Fout", error.message);
        return;
      }

      requestCreated = true;
      setHasExistingRequest(true);

      const partnerId = ownerId;
      if (!partnerId) {
        openFallbackSuccess();
        return;
      }

      const user1 = user.id < partnerId ? user.id : partnerId;
      const user2 = user.id < partnerId ? partnerId : user.id;

      const { data: existingConv, error: existingConvError } =
        await withTimeout(
          supabase
            .from("conversations")
            .select("id")
            .eq("user1_id", user1)
            .eq("user2_id", user2)
            .maybeSingle(),
        );

      if (existingConvError) {
        throw existingConvError;
      }

      let conversationId = existingConv?.id;

      if (!conversationId) {
        const { data: newConv, error: convError } = await withTimeout(
          supabase
            .from("conversations")
            .insert({ user1_id: user1, user2_id: user2 })
            .select("id")
            .single(),
        );

        if (convError || !newConv) {
          throw convError ?? new Error("Kon geen gesprek aanmaken.");
        }
        conversationId = newConv.id;
      }

      const { error: messageError } = await withTimeout(
        supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: `Hallo! Ik heb zojuist een aanvraag gestuurd voor je tuin ${gardenName}.`,
        }),
      );

      if (messageError) {
        throw messageError;
      }

      router.push(`/messages/${conversationId}`);
    } catch (error) {
      console.error("Garden request submit error:", error);
      if (requestCreated) {
        openFallbackSuccess();
        return;
      }

      alert(
        "Fout",
        error instanceof Error
          ? error.message
          : "Er is iets misgegaan. Probeer het opnieuw.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isOwnGarden = ownerId && currentUserId && ownerId === currentUserId;
  const isDisabled =
    authLoading || loading || hasExistingRequest || checkingRequest || !!isOwnGarden;

  return (
    <PageContainer topNavTitle={gardenName} activeTab="home">
      <YStack
        paddingHorizontal={16}
        paddingTop="$6"
        gap={32}
        paddingBottom={200}
      >
        {isOwnGarden && (
          <YStack
            backgroundColor="rgba(239, 68, 68, 0.1)"
            borderColor="#ef4444"
            borderWidth={1}
            borderRadius={12}
            padding={16}
            gap={8}
          >
            <Text color="#ef4444" fontSize={16} fontWeight="600">
              Dit is je eigen tuin
            </Text>
            <Text color="#ef4444" fontSize={14}>
              Je kan geen aanvraag sturen voor je eigen tuin.
            </Text>
          </YStack>
        )}

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
              Je hebt al een aanvraag voor deze tuin verstuurd. Je kan slechts
              één aanvraag per tuin indienen.
            </Text>
          </YStack>
        )}

        <YStack gap={16}>
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
              <Select
                value={collabType}
                onValueChange={(value) => {
                  setCollabType(value);
                  setErrors((e) => ({ ...e, collaborationType: "" }));
                }}
              >
                <Select.Trigger
                  flex={1}
                  backgroundColor="transparent"
                  borderWidth={0}
                  padding={0}
                  iconAfter={
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={20}
                      color="#000000"
                    />
                  }
                >
                  <Select.Value placeholder="Kies een samenwerkingstype" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Viewport backgroundColor="white" borderRadius={8}>
                    {COLLABORATION_TYPES.map((type, index) => (
                      <Select.Item
                        key={type.value}
                        index={index}
                        value={type.value}
                      >
                        <Select.ItemText>{type.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select>
            </XStack>
            {errors.collaborationType && (
              <Text color="red" fontSize={14}>
                {errors.collaborationType}
              </Text>
            )}
          </YStack>

          <WeekdayPicker
            selectedDays={selectedDays}
            onToggleDay={toggleDay}
            error={errors.days}
          />

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
            <Text color="#929292" fontSize={14}>
              Kies vandaag of later.
            </Text>
            {errors.startDate && (
              <Text color="red" fontSize={14}>
                {errors.startDate}
              </Text>
            )}
          </YStack>
        </YStack>

        {showPicker && Platform.OS !== "web" && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={minDate}
            onChange={handleDateChange}
          />
        )}

        {Platform.OS === "web" && showPicker && (
          <YStack
            gap={8}
            backgroundColor="#F1F1F1"
            padding={16}
            borderRadius={12}
          >
            <Text fontSize={14} color="#929292">
              Selecteer een datum:
            </Text>
            <input
              type="date"
              min={minDateValue}
              value={
                startDate
                  ? `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, "0")}-${startDate.getDate().toString().padStart(2, "0")}`
                  : ""
              }
              onChange={(e) => {
                if (!e.target.value) {
                  setStartDate(null);
                  setErrors((current) => ({
                    ...current,
                    startDate: "",
                  }));
                  return;
                }

                const date = new Date(e.target.value);
                if (isNaN(date.getTime())) {
                  return;
                }

                if (date < minDate) {
                  setStartDate(null);
                  setErrors((current) => ({
                    ...current,
                    startDate: "Startdatum kan niet in het verleden liggen",
                  }));
                  return;
                }

                handleDateChange(null, date);
              }}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #E3E3E3",
                fontSize: "16px",
              }}
            />
          </YStack>
        )}

        <Button
          label={
            checkingRequest
              ? "Laden..."
              : hasExistingRequest
                ? "Aanvraag al verstuurd"
                : isOwnGarden
                  ? "Dit is je eigen tuin"
                  : authLoading || loading
                    ? "Bezig..."
                    : "Verzoek sturen"
          }
          variant="secondary"
          backgroundColor={isDisabled ? "#d1d5db" : undefined}
          color={isDisabled ? "#6b7280" : undefined}
          borderColor={isDisabled ? "#9ca3af" : undefined}
          borderWidth={isDisabled ? 1 : undefined}
          onPress={handleSubmit}
          disabled={isDisabled}
        />
      </YStack>
    </PageContainer>
  );
}
