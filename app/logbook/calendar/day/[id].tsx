import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import ScreenContent from "@/components/ui/ScreenContent";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import { Card, H2, Text, XStack, YStack } from "tamagui";

const MONTHS_NL = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

const DAYS_SHORT = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

const MOCK_TASKS = [
  "Onkruid verwijderd rond tomaten en sla",
  "Tomatenplanten opgebonden en onderste bladeren gesnoeid",
  "Compost toegevoegd aan kruidenbed",
  "Sla geoogst (± 6 kroppen)",
  "Bedden licht losgemaakt en bewaterd",
];

const MOCK_OBSERVATIONS =
  "De tomatenplanten groeien voorspoedig en beginnen de eerste vruchten te vormen. De sla heeft goed aangeslagen en kan binnenkort opnieuw geoogst worden. Wel opgemerkt dat er wat slakkenactiviteit is rond de jonge planten.";

const MOCK_FOLLOW_UPS = [
  "Slakkenval plaatsen bij volgende bezoek",
  "Sla bladeren inspecteren op ziekte",
];

export default function CalendarDayDetailScreen() {
  const { id } = useLocalSearchParams();
  const dayNumber = typeof id === "string" ? parseInt(id, 10) : 1;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const loggedDays = [3, 5, 8, 12, 15, 18, 20, 22, 25, 28];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const isLogged = loggedDays.includes(dayNumber);

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenContent>
          <TopNavPill title="Log Kalender" onBackPress={() => router.back()} />

          {/* Calendar (condensed) */}
          <YStack gap="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                {MONTHS_NL[currentMonth]} {currentYear}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#57594D" />
            </XStack>

            <XStack justifyContent="space-around" paddingBottom="$2">
              {DAYS_SHORT.map((day) => (
                <Text
                  key={day}
                  fontSize="$3"
                  color="$secondary"
                  fontWeight="600"
                  width={36}
                  textAlign="center"
                >
                  {day}
                </Text>
              ))}
            </XStack>

            {Array.from({ length: Math.ceil(days.length / 7) }).map(
              (_, weekIndex) => (
                <XStack key={weekIndex} justifyContent="space-around">
                  {days
                    .slice(weekIndex * 7, weekIndex * 7 + 7)
                    .map((day, dayIndex) => {
                      const dayIsLogged = day !== null && loggedDays.includes(day);
                      const isSelected = day === dayNumber;

                      return (
                        <YStack
                          key={dayIndex}
                          width={36}
                          height={44}
                          justifyContent="center"
                          alignItems="center"
                          gap="$1"
                        >
                          {day !== null ? (
                            <>
                              <XStack
                                width={36}
                                height={36}
                                borderRadius={18}
                                backgroundColor={
                                  isSelected
                                    ? "#173300"
                                    : dayIsLogged
                                    ? "rgba(34, 197, 94, 0.1)"
                                    : "transparent"
                                }
                                justifyContent="center"
                                alignItems="center"
                              >
                                <Text
                                  fontSize="$3"
                                  color={
                                    isSelected
                                      ? "white"
                                      : dayIsLogged
                                      ? "#22c55e"
                                      : "$text_dark"
                                  }
                                  fontWeight={
                                    isSelected || dayIsLogged ? "bold" : "400"
                                  }
                                >
                                  {day}
                                </Text>
                              </XStack>
                              {dayIsLogged && (
                                <XStack
                                  width={4}
                                  height={4}
                                  borderRadius={2}
                                  backgroundColor="#22c55e"
                                />
                              )}
                            </>
                          ) : (
                            <YStack width={36} height={36} />
                          )}
                        </YStack>
                      );
                    })}
                </XStack>
              )
            )}
          </YStack>

          {/* Day content */}
          {isLogged ? (
            <YStack gap="$6">
              {/* Date + Image */}
              <YStack alignItems="center" gap="$3">
                <Text fontSize="$4" color="$secondary" fontWeight="500">
                  {dayNumber}/{String(currentMonth + 1).padStart(2, "0")}/{currentYear}
                </Text>
                <Card
                  elevation={2}
                  borderRadius="$6"
                  overflow="hidden"
                  height={160}
                  width="100%"
                >
                  <ExpoImage
                    source={require("@/assets/images/hero.png")}
                    style={{ width: "100%", height: 160 }}
                    contentFit="cover"
                  />
                </Card>
              </YStack>

              {/* Uitgevoerde taken */}
              <YStack gap="$3">
                <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
                  Uitgevoerde taken
                </H2>
                <Card
                  elevation={2}
                  backgroundColor="white"
                  borderColor="rgba(23, 51, 0, 0.1)"
                  borderWidth={1}
                  borderRadius="$6"
                  padding="$4"
                  gap="$3"
                >
                  <YStack gap="$3">
                    {MOCK_TASKS.map((task, index) => (
                      <XStack key={index} gap="$3" alignItems="flex-start">
                        <XStack
                          width={20}
                          height={20}
                          borderRadius={6}
                          backgroundColor="rgba(23, 51, 0, 0.08)"
                          justifyContent="center"
                          alignItems="center"
                          marginTop={2}
                        >
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#173300"
                          />
                        </XStack>
                        <Text
                          fontSize="$4"
                          color="$text_dark"
                          flex={1}
                          lineHeight={22}
                        >
                          {task}
                        </Text>
                      </XStack>
                    ))}
                  </YStack>
                </Card>
              </YStack>

              {/* Observaties */}
              <YStack gap="$3">
                <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
                  Observaties
                </H2>
                <Card
                  elevation={2}
                  backgroundColor="white"
                  borderColor="rgba(23, 51, 0, 0.1)"
                  borderWidth={1}
                  borderRadius="$6"
                  padding="$4"
                >
                  <Text fontSize="$4" color="$text_dark" lineHeight={22}>
                    {MOCK_OBSERVATIONS}
                  </Text>
                </Card>
              </YStack>

              {/* Opvolgingen */}
              <YStack gap="$3">
                <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
                  Opvolgingen
                </H2>
                <YStack gap="$2">
                  {MOCK_FOLLOW_UPS.map((item, index) => (
                    <Card
                      key={index}
                      elevation={2}
                      backgroundColor="white"
                      borderColor="rgba(239, 68, 68, 0.2)"
                      borderWidth={1}
                      borderRadius="$6"
                      padding="$4"
                    >
                      <XStack gap="$3" alignItems="center">
                        <XStack
                          width={20}
                          height={20}
                          borderRadius={10}
                          borderWidth={2}
                          borderColor="#ef4444"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Ionicons
                            name="alert-circle"
                            size={12}
                            color="#ef4444"
                          />
                        </XStack>
                        <Text
                          fontSize="$4"
                          color="$text_dark"
                          flex={1}
                          lineHeight={22}
                        >
                          {item}
                        </Text>
                      </XStack>
                    </Card>
                  ))}
                </YStack>
              </YStack>
            </YStack>
          ) : (
            <YStack
              padding="$10"
              alignItems="center"
              gap="$3"
            >
              <Ionicons name="calendar-outline" size={48} color="#57594D" />
              <Text fontSize="$4" color="$secondary" textAlign="center">
                Geen log gevonden voor deze dag.
              </Text>
              <Text fontSize="$3" color="$secondary" textAlign="center">
                Kies een andere dag of voeg een nieuwe log toe.
              </Text>
            </YStack>
          )}
        </ScreenContent>
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
