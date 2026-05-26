import GardenCard from "@/components/ui/GardenCard";
import { LogCard, type GardenLog } from "@/components/ui/LogCard";
import { supabase } from "@/utils/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { Card, Circle, Spinner, Text, XStack, YStack } from "tamagui";
import { type Garden } from "@/types/garden";

function getWeekProgress(logs: GardenLog[]) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekLogs = logs.filter((log) => {
    const logDate = new Date(log.created_at || Date.now());
    return logDate >= weekStart && logDate <= weekEnd;
  });

  return Math.min(weekLogs.length, 4);
}

function getWeekDays() {
  const days = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  return days.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label,
      date: d.getDate(),
      isToday: d.toDateString() === now.toDateString(),
    };
  });
}

export default function GardenerView() {
  const [myGardens, setMyGardens] = useState<Garden[]>([]);
  const [recommended, setRecommended] = useState<Garden[]>([]);
  const [logs, setLogs] = useState<GardenLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [myGardensRes, recRes, logsRes] = await Promise.all([
        user
          ? supabase
              .from("gardens")
              .select("id, name, rating, location, image_url")
              .eq("owner_id", user.id)
              .limit(10)
          : Promise.resolve({ data: [] }),
        supabase
          .from("gardens")
          .select("id, name, rating, location, image_url")
          .limit(5),
        supabase
          .from("garden_logs")
          .select("id, title, status, created_at")
          .limit(5),
      ]);

      if (myGardensRes.data) setMyGardens(myGardensRes.data as Garden[]);
      if (recRes.data) setRecommended(recRes.data as Garden[]);
      if (logsRes.data) setLogs(logsRes.data as GardenLog[]);
    } catch (error) {
      console.error("Error fetching gardener dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const weekProgress = getWeekProgress(logs);
  const weekDays = getWeekDays();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <YStack paddingHorizontal="$4" paddingBottom="$4">
        {loading ? (
          <XStack padding="$10" justifyContent="center">
            <Spinner size="large" color="$primary" />
          </XStack>
        ) : (
          <>
            <Card
              marginTop="$4"
              backgroundColor="$primary"
              borderRadius="$6"
              padding="$4"
            >
              <Text fontSize="$4" fontWeight="bold" color="$white" marginBottom="$3">
                Weekvoortgang
              </Text>
              <XStack justifyContent="space-between" alignItems="center">
                {weekDays.map((day, i) => (
                  <YStack key={i} alignItems="center" gap="$1">
                    <Text fontSize="$2" color="$white" opacity={0.7}>
                      {day.label}
                    </Text>
                    <Circle
                      size={28}
                      backgroundColor={i < weekProgress ? "#22c55e" : "rgba(255,255,255,0.2)"}
                    >
                      <Text fontSize="$3" color="$white" fontWeight="bold">
                        {day.date}
                      </Text>
                    </Circle>
                  </YStack>
                ))}
              </XStack>
            </Card>

            <YStack marginTop="$6" paddingHorizontal="$2">
              <Text fontSize="$4" fontWeight="bold" color="$text_dark" marginBottom="$3">
                Mijn tuinen ({myGardens.length})
              </Text>
              {myGardens.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$3">
                    {myGardens.map((garden) => (
                      <GardenCard
                        key={garden.id}
                        garden={garden}
                        onPress={() => router.push(('/garden/' + garden.id) as any)}
                      />
                    ))}
                  </XStack>
                </ScrollView>
              ) : (
                <YStack padding="$6" alignItems="center" gap="$3">
                  <MaterialCommunityIcons name="tree-outline" size={48} color="$text_light" />
                  <Text fontSize="$3" color="$text_dark" textAlign="center">
                    Geen tuinen toegewezen
                  </Text>
                </YStack>
              )}
            </YStack>

            <YStack marginTop="$6" paddingHorizontal="$2">
              <Text fontSize="$4" fontWeight="bold" color="$text_dark" marginBottom="$3">
                Recente logboek entries
              </Text>
              {logs.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$3">
                    {logs.map((log) => (
                      <LogCard key={log.id} log={log} />
                    ))}
                  </XStack>
                </ScrollView>
              ) : (
                <YStack padding="$6" alignItems="center" gap="$3">
                  <MaterialCommunityIcons name="book-outline" size={48} color="$text_light" />
                  <Text fontSize="$3" color="$text_dark" textAlign="center">
                    Nog geen logboek entries
                  </Text>
                </YStack>
              )}
            </YStack>

            <YStack marginTop="$6" paddingHorizontal="$2">
              <Text fontSize="$4" fontWeight="bold" color="$text_dark" marginBottom="$3">
                Ontdek nieuwe tuinen
              </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$3">
                {recommended.map((garden) => (
                  <GardenCard
                    key={garden.id}
                    garden={garden}
                    onPress={() => router.push(('/garden/' + garden.id) as any)}
                  />
                ))}
              </XStack>
            </ScrollView>
            </YStack>

            <Card
              marginTop="$6"
              backgroundColor="$accent"
              borderRadius="$6"
              padding="$4"
              onPress={() => router.push("/logbook")}
              pressStyle={{ scale: 0.98, opacity: 0.9 }}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="bold" color="$white">
                    Bekijk logboek
                  </Text>
                  <Text fontSize="$3" color="$white" opacity={0.9}>
                    Al je tuinwerk activiteit op één plek
                  </Text>
                </YStack>
                <Ionicons name="book" size={24} color="$white" />
              </XStack>
            </Card>
          </>
        )}
      </YStack>
    </ScrollView>
  );
}
