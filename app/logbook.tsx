import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import ScreenContent from "@/components/ui/ScreenContent";
import { supabase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView } from "react-native";
import {
  Card,
  Circle,
  H2,
  Spinner,
  Text,
  XStack,
  YStack,
} from "tamagui";

type RecentLog = {
  id: string;
  date: string;
  description: string;
  image_url?: string | null;
};

const DAYS = [
  { key: "Ma", label: "Ma", date: 1 },
  { key: "Di", label: "Di", date: 2 },
  { key: "Wo", label: "Wo", date: 3 },
  { key: "Do", label: "Do", date: 4 },
  { key: "Vr", label: "Vr", date: 5 },
  { key: "Za", label: "Za", date: 6 },
  { key: "Zo", label: "Zo", date: 7 },
];

export default function LogbookScreen() {
  const [logs, setLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyCount, setWeeklyCount] = useState(0);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("garden_logs")
        .select("id, title, created_at")
        .order("created_at", { ascending: false });

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

      // Count this week's logs
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      const weekLogs = (data || []).filter(
        (log) => new Date(log.created_at) >= startOfWeek
      );
      setWeeklyCount(Math.min(weekLogs.length, 4));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const hasLogs = logs.length > 0;
  const progressAngle = (weeklyCount / 4) * 360;

  return (
    <ThemedSafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ScreenContent>
          <TopNavPill
            hideBack
            title="Victor Thys"
            rightElement={
              <XStack gap="$2">
                <Circle
                  size={44}
                  backgroundColor="white"
                  borderWidth={1}
                  borderColor="rgba(0, 0, 0, 0.04)"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Ionicons name="notifications" size={20} color="#172211" />
                </Circle>
              </XStack>
            }
          />

          {/* Weekly Progress Card */}
          <Card
            elevation={2}
            backgroundColor="rgba(227, 236, 215, 0.5)"
            borderColor="rgba(227, 236, 215, 0.85)"
            borderWidth={1}
            borderRadius="$6"
            padding="$5"
          >
            <XStack alignItems="center" gap="$4">
              {/* Circular Progress */}
              <YStack
                width={72}
                height={72}
                borderRadius={36}
                backgroundColor={hasLogs ? "#173300" : "rgba(23, 51, 0, 0.1)"}
                justifyContent="center"
                alignItems="center"
                position="relative"
              >
                <YStack
                  width={60}
                  height={60}
                  borderRadius={30}
                  backgroundColor="white"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text
                    fontSize="$6"
                    fontWeight="bold"
                    color={hasLogs ? "$text_dark" : "$secondary"}
                  >
                    {weeklyCount}
                  </Text>
                </YStack>
              </YStack>
              <YStack flex={1} gap="$1">
                <Text fontSize="$4" fontWeight="bold" color="$text_dark">
                  Jouw wekelijkse progressie
                </Text>
                <Text fontSize="$3" color="$secondary">
                  probeer wekelijks 4 dagen voor je planten te zorgen
                </Text>
              </YStack>
            </XStack>
          </Card>

          {/* Action Buttons */}
          <XStack gap="$3">
            <XStack
              flex={1}
              backgroundColor="rgba(23, 51, 0, 0.1)"
              borderRadius="$10"
              paddingVertical="$3"
              paddingHorizontal="$4"
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize="$4" fontWeight="600" color="#173300">
                Logboek
              </Text>
            </XStack>
            <XStack
              flex={1}
              backgroundColor="transparent"
              borderRadius="$10"
              borderWidth={1}
              borderColor="rgba(23, 51, 0, 0.2)"
              paddingVertical="$3"
              paddingHorizontal="$4"
              justifyContent="center"
              alignItems="center"
              onPress={() => router.push("/logbook/new" as any)}
              pressStyle={{ scale: 0.96, opacity: 0.8 }}
            >
              <Text fontSize="$4" fontWeight="600" color="#173300">
                Nieuwe log
              </Text>
            </XStack>
          </XStack>

          {/* Mini Calendar */}
          <Card
            elevation={2}
            backgroundColor="white"
            borderColor="rgba(23, 51, 0, 0.1)"
            borderWidth={1}
            borderRadius="$6"
            padding="$4"
            gap="$4"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" fontWeight="bold" color="$text_dark">
                Januari
              </Text>
              <Ionicons name="chevron-down" size={18} color="#57594D" />
            </XStack>

            <XStack justifyContent="space-between">
              {DAYS.map((day) => {
                const isLogged = [1, 3, 5].includes(day.date);
                return (
                  <Pressable
                    key={day.key}
                    onPress={() =>
                      router.push(
                        `/logbook/${day.date}` as any
                      )
                    }
                  >
                    <YStack alignItems="center" gap="$1">
                      <Text fontSize="$3" color="$secondary" fontWeight="500">
                        {day.key}
                      </Text>
                      <XStack
                        width={40}
                        height={40}
                        borderRadius={8}
                        justifyContent="center"
                        alignItems="center"
                        backgroundColor={
                          isLogged
                            ? "rgba(23, 51, 0, 0.08)"
                            : "transparent"
                        }
                      >
                        <Text
                          fontSize="$4"
                          color={isLogged ? "$text_dark" : "$secondary"}
                          fontWeight={isLogged ? "600" : "400"}
                        >
                          {String(day.date).padStart(2, "0")}
                        </Text>
                      </XStack>
                      {isLogged && (
                        <XStack gap="2px">
                          <XStack
                            width={6}
                            height={6}
                            borderRadius={3}
                            backgroundColor="#22c55e"
                          />
                          <XStack
                            width={6}
                            height={6}
                            borderRadius={3}
                            backgroundColor="#eab308"
                          />
                        </XStack>
                      )}
                    </YStack>
                  </Pressable>
                );
              })}
            </XStack>
          </Card>

          {/* Opvolgingen link */}
          <XStack
            backgroundColor="rgba(239, 68, 68, 0.06)"
            borderRadius="$6"
            borderWidth={1}
            borderColor="rgba(239, 68, 68, 0.15)"
            padding="$4"
            justifyContent="space-between"
            alignItems="center"
            onPress={() => router.push("/logbook/opvolgingen" as any)}
            pressStyle={{ scale: 0.98, opacity: 0.9 }}
          >
            <XStack gap="$3" alignItems="center">
              <XStack
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor="rgba(239, 68, 68, 0.1)"
                justifyContent="center"
                alignItems="center"
              >
                <Ionicons name="list" size={18} color="#ef4444" />
              </XStack>
              <YStack>
                <Text fontSize="$4" fontWeight="600" color="$text_dark">
                  Opvolgingen
                </Text>
                <Text fontSize="$3" color="$secondary">
                  Bekijk en beheer je taken
                </Text>
              </YStack>
            </XStack>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#173300" />
          </XStack>

          {/* Recent Logs */}
          <YStack gap="$4">
            <H2 color="$text_dark" fontWeight="bold">
              Recente logs
            </H2>

            {loading ? (
              <YStack padding="$10" justifyContent="center" alignItems="center">
                <Spinner size="large" color="$primary" />
              </YStack>
            ) : !hasLogs ? (
              <YStack
                padding="$6"
                alignItems="center"
                gap="$2"
                backgroundColor="rgba(23, 51, 0, 0.03)"
                borderRadius="$6"
              >
                <Ionicons name="leaf-outline" size={48} color="#57594D" />
                <Text color="$secondary" fontSize="$3" textAlign="center">
                  het is hier nog heel stil...
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
                      <YStack
                        flex={1}
                        padding="$3"
                        gap="$1"
                      >
                        <Text
                          fontSize="$3"
                          color="$secondary"
                          fontWeight="500"
                        >
                          {log.date}
                        </Text>
                        <Text
                          fontSize="$4"
                          color="$text_dark"
                          numberOfLines={2}
                        >
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
