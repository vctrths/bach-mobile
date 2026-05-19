import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { supabase } from "@/utils/supabase";
import { Image as ExpoImage } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Card, Circle, H2, Spinner, Text, XStack, YStack } from "tamagui";

const MONTHS_NL = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

const DAYS_SHORT = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

type RecentLog = {
  id: string;
  date: string;
  description: string;
  image_url?: string | null;
};

export default function LogbookCalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [logs, setLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);
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
  const followUpDays = [12, 20];

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("garden_logs")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching logs:", error);
        return;
      }

      const formattedLogs = (data || []).map((log) => ({
        id: log.id,
        date: new Date(log.created_at).toLocaleDateString("nl-BE"),
        description: log.title || "",
        image_url: null,
      }));

      setLogs(formattedLogs);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDayPress = (day: number) => {
    setSelectedDate(day);
    router.push(`/logbook/${day}` as any);
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
          <TopNavPill
            title="Log Kalender"
            onBackPress={() => router.back()}
          />

          <XStack justifyContent="space-between" alignItems="center">
            <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
              {MONTHS_NL[currentMonth]} {currentYear}
            </H2>
            <XStack gap="$2">
              <Circle
                size={36}
                backgroundColor="rgba(23, 51, 0, 0.08)"
                justifyContent="center"
                alignItems="center"
              >
                <Ionicons name="chevron-back" size={18} color="#173300" />
              </Circle>
              <Circle
                size={36}
                backgroundColor="rgba(23, 51, 0, 0.08)"
                justifyContent="center"
                alignItems="center"
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
              <Text fontSize="$2" color="$secondary">Gelogd</Text>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <XStack
                width={10}
                height={10}
                borderRadius={5}
                backgroundColor="#ef4444"
              />
              <Text fontSize="$2" color="$secondary">Opvolging</Text>
            </XStack>
          </XStack>

          {/* Recente Activiteit */}
          <YStack gap="$4">
            <H2 color="$text_dark" fontWeight="bold">
              Recente Activiteit
            </H2>

            {loading ? (
              <YStack padding="$6" justifyContent="center" alignItems="center">
                <Spinner size="large" color="$primary" />
              </YStack>
            ) : logs.length === 0 ? (
              <YStack
                padding="$4"
                alignItems="center"
                gap="$2"
                backgroundColor="rgba(23, 51, 0, 0.03)"
                borderRadius="$6"
              >
                <Text color="$secondary" fontSize="$3">
                  Nog geen activiteit deze maand
                </Text>
              </YStack>
            ) : (
              <YStack gap="$3">
                {logs.map((log) => (
                  <Card
                    key={log.id}
                    elevation={2}
                    backgroundColor="white"
                    borderColor="rgba(23, 51, 0, 0.1)"
                    borderWidth={1}
                    borderRadius="$6"
                    overflow="hidden"
                    flexDirection="row"
                    onPress={() => router.push(`/logbook/${log.id}` as any)}
                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                  >
                    <XStack flex={1} alignItems="center">
                      <ExpoImage
                        source={require("@/assets/images/hero.png")}
                        style={{
                          width: 80,
                          height: 80,
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                        }}
                        contentFit="cover"
                      />
                      <YStack flex={1} padding="$3" gap="$1">
                        <Text fontSize="$3" color="$secondary" fontWeight="500">
                          {log.date}
                        </Text>
                        <Text fontSize="$4" color="$text_dark" numberOfLines={2}>
                          {log.description}
                        </Text>
                      </YStack>
                      <XStack
                        width={40}
                        height={40}
                        borderRadius={20}
                        backgroundColor="rgba(23, 51, 0, 0.06)"
                        justifyContent="center"
                        alignItems="center"
                        marginRight="$3"
                      >
                        <MaterialCommunityIcons
                          name="arrow-right"
                          size={20}
                          color="#173300"
                        />
                      </XStack>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            )}
          </YStack>
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
