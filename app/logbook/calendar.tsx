import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Card, Circle, H1, Text, XStack, YStack } from "tamagui";

const MONTHS = [
  "Jan", "Feb", "Mrt", "Apr", "Mei", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dec",
];

const DAYS_SHORT = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

export default function LogbookCalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Get days for current month view
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // Mock logged days (randomly select some)
  const loggedDays = [3, 5, 8, 12, 15, 18, 20, 22, 25, 28];
  const followUpDays = [12, 20];

  const handleDayPress = (day: number) => {
    setSelectedDate(day);
    router.push(`/logbook/${day}` as any);
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
          <TopNavPill
            title="Logboek Kalender"
            onBackPress={() => router.back()}
          />

          <XStack justifyContent="space-between" alignItems="center">
            <H1 color="$text_dark" fontWeight="bold" fontSize="$5">
              {MONTHS[currentMonth]} {currentYear}
            </H1>
            <XStack gap="$2">
              <Circle
                size={36}
                backgroundColor="rgba(23, 51, 0, 0.08)"
                justifyContent="center"
                alignItems="center"
                onPress={() => {}}
              >
                <Ionicons name="chevron-back" size={18} color="#173300" />
              </Circle>
              <Circle
                size={36}
                backgroundColor="rgba(23, 51, 0, 0.08)"
                justifyContent="center"
                alignItems="center"
                onPress={() => {}}
              >
                <Ionicons name="chevron-forward" size={18} color="#173300" />
              </Circle>
            </XStack>
          </XStack>

          {/* Calendar Grid */}
          <Card
            elevation={2}
            backgroundColor="white"
            borderColor="rgba(23, 51, 0, 0.1)"
            borderWidth={1}
            borderRadius="$6"
            padding="$4"
            gap="$2"
          >
            {/* Day headers */}
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

            {/* Days grid */}
            {Array.from({ length: Math.ceil(days.length / 7) }).map(
              (_, weekIndex) => (
                <XStack key={weekIndex} justifyContent="space-around">
                  {days
                    .slice(weekIndex * 7, weekIndex * 7 + 7)
                    .map((day, dayIndex) => {
                      const isLogged = day !== null && loggedDays.includes(day);
                      const isFollowUp =
                        day !== null && followUpDays.includes(day);
                      const isSelected = day !== null && selectedDate === day;

                      return (
                        <YStack
                          key={dayIndex}
                          width={36}
                          height={48}
                          justifyContent="center"
                          alignItems="center"
                          gap="$1"
                          onPress={() => day !== null && handleDayPress(day)}
                          pressStyle={day !== null ? { scale: 0.9 } : undefined}
                        >
                          {day !== null ? (
                            <>
                              <Circle
                                size={36}
                                backgroundColor={
                                  isSelected
                                    ? "#173300"
                                    : isFollowUp
                                    ? "rgba(239, 68, 68, 0.1)"
                                    : isLogged
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
                                      : isFollowUp
                                      ? "#ef4444"
                                      : isLogged
                                      ? "#22c55e"
                                      : "$text_dark"
                                  }
                                  fontWeight={
                                    isSelected || isLogged || isFollowUp
                                      ? "bold"
                                      : "400"
                                  }
                                >
                                  {day}
                                </Text>
                              </Circle>
                              {isLogged && !isFollowUp && (
                                <XStack
                                  width={4}
                                  height={4}
                                  borderRadius={2}
                                  backgroundColor="#22c55e"
                                />
                              )}
                              {isFollowUp && (
                                <XStack
                                  width={4}
                                  height={4}
                                  borderRadius={2}
                                  backgroundColor="#ef4444"
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
          </Card>

          {/* Legend */}
          <XStack justifyContent="center" gap="$4">
            <XStack gap="$2" alignItems="center">
              <XStack
                width={10}
                height={10}
                borderRadius={5}
                backgroundColor="#22c55e"
              />
              <Text fontSize="$2" color="$secondary">
                Gelogd
              </Text>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <XStack
                width={10}
                height={10}
                borderRadius={5}
                backgroundColor="#ef4444"
              />
              <Text fontSize="$2" color="$secondary">
                Opvolging
              </Text>
            </XStack>
          </XStack>

          {/* New Log Button */}
          <Button
            label="Nieuwe log toevoegen"
            backgroundColor="rgba(23, 51, 0, 0.1)"
            color="#173300"
            onPress={() => router.push("/logbook/new")}
          />
        </YStack>
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
