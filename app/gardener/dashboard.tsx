import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import NotificationBell from "@/components/ui/NotificationBell";
import GardenCard from "@/components/ui/GardenCard";
import { LogCard, type GardenLog } from "@/components/ui/LogCard";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { supabase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { Card, Circle, Spinner, Text, XStack, YStack } from "tamagui";

type Garden = {
  id: string;
  name: string;
  rating: number;
  location: string;
  image_url: string | null;
};

type UserProfile = {
  first_name: string;
  profile_image: string | null;
};

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  created_at: string;
};

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

export default function GardenerDashboard() {
  const [myGardens, setMyGardens] = useState<Garden[]>([]);
  const [recommended, setRecommended] = useState<Garden[]>([]);
  const [logs, setLogs] = useState<GardenLog[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [myGardensRes, recRes, logsRes, profileRes, notifRes] =
        await Promise.all([
          user
            ? supabase
                .from("gardens")
                .select("id, name, rating, location, image_url")
                .eq("owner_id", user.id)
                .limit(10)
            : Promise.resolve({ data: null }) as any,
          supabase
            .from("gardens")
            .select("id, name, rating, location, image_url")
            .limit(5),
          supabase.from("garden_logs").select("id, title, status, created_at").limit(5),
          user
            ? supabase
                .from("profiles")
                .select("first_name, profile_image")
                .eq("id", user.id)
                .single()
            : Promise.resolve({ data: null }) as any,
          user
            ? supabase
                .from("notifications")
                .select("id, title, body, type, read, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(5)
            : Promise.resolve({ data: null }) as any,
        ]);

      if (myGardensRes.data) setMyGardens(myGardensRes.data as Garden[]);
      if (recRes.data) setRecommended(recRes.data as Garden[]);
      if (logsRes.data) setLogs(logsRes.data as GardenLog[]);
      if (profileRes.data) setProfile(profileRes.data as UserProfile);
      if (notifRes.data) setNotifications(notifRes.data as NotificationItem[]);
    } catch (error) {
      console.error("Error fetching gardener dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const weekProgress = getWeekProgress(logs);
  const weekDays = getWeekDays();

  return (
    <ThemedSafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$4" gap="$6" paddingBottom="$25">
          {/* Top Navigation */}
          <TopNavPill
            hideBack
            title={
              <XStack gap="$2" alignItems="center">
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color="$primary"
                />
                <Text fontSize="$4" fontWeight="600" color="$text_dark">
                  Leuven, BE
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={16}
                  color="$text_dark"
                />
              </XStack>
            }
            rightElement={
              <XStack gap="$3" alignItems="center">
                <NotificationBell unreadCount={notifications.filter((n) => !n.read).length} />
                {profile?.profile_image ? (
                  <Circle
                    size={50}
                    onPress={() => router.push("/profile")}
                    overflow="hidden"
                  >
                    <ExpoImage
                      source={{ uri: profile.profile_image }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  </Circle>
                ) : (
                  <Ionicons
                    name="person-circle"
                    size={50}
                    color="$borderColor"
                    onPress={() => router.push("/profile")}
                    suppressHighlighting
                  />
                )}
              </XStack>
            }
          >
            {/* Search Bar as Child */}
            <XStack
              backgroundColor="white"
              borderRadius="$8"
              paddingHorizontal="$4"
              paddingVertical="$3"
              alignItems="center"
              gap="$2"
              borderWidth={1}
              borderColor="$borderColor"
              onPress={() => router.push("/search")}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="$text_dark"
              />
              <Text fontSize="$3" color="$text_dark" flex={1}>
                Zoeken naar een tuin
              </Text>
            </XStack>
          </TopNavPill>

          {/* Weekly Progress Card */}
          <Card
            elevation={2}
            backgroundColor="#f0f3ec"
            borderColor="#e3ecd7"
            borderWidth={1}
            borderRadius="$6"
            padding="$4"
            gap="$3"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <YStack flex={1} gap="$1">
                <Text fontSize="$4" fontWeight="bold" color="$text_dark">
                  Jouw wekelijkse progressie
                </Text>
                <Text fontSize="$3" color="$secondary">
                  probeer wekelijks 4 dagen voor je planten te zorgen
                </Text>
              </YStack>
              <YStack
                width={80}
                height={80}
                justifyContent="center"
                alignItems="center"
              >
                <Circle
                  size={70}
                  backgroundColor="transparent"
                  borderWidth={6}
                  borderColor="rgba(23, 51, 0, 0.1)"
                />
                <YStack
                  position="absolute"
                  width={70}
                  height={70}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                    {weekProgress}/4
                  </Text>
                </YStack>
              </YStack>
            </XStack>
          </Card>

          {/* Quick Action Buttons */}
          <XStack gap="$3">
            <Card
              flex={1}
              elevation={2}
              backgroundColor="white"
              borderColor="rgba(23, 51, 0, 0.1)"
              borderWidth={1}
              borderRadius="$6"
              padding="$4"
              justifyContent="center"
              alignItems="center"
              onPress={() => router.push("/logbook")}
              pressStyle={{ scale: 0.98, opacity: 0.9 }}
            >
              <Text fontSize="$4" fontWeight="600" color="$text_dark">
                Logboek
              </Text>
            </Card>
            <Card
              flex={1}
              elevation={2}
              backgroundColor="white"
              borderColor="rgba(23, 51, 0, 0.1)"
              borderWidth={1}
              borderRadius="$6"
              padding="$4"
              justifyContent="center"
              alignItems="center"
              onPress={() => router.push("/logbook/new")}
              pressStyle={{ scale: 0.98, opacity: 0.9 }}
            >
              <Text fontSize="$4" fontWeight="600" color="$text_dark">
                Nieuwe log
              </Text>
            </Card>
          </XStack>

          {/* Mini Calendar */}
          <YStack gap="$3">
            <Text fontSize="$4" fontWeight="bold" color="$text_dark">
              {new Date().toLocaleString("nl-BE", { month: "long" })}
            </Text>
            <XStack justifyContent="space-between">
              {weekDays.map((day, i) => (
                <YStack
                  key={i}
                  alignItems="center"
                  gap="$1"
                  backgroundColor={day.isToday ? "rgba(23, 51, 0, 0.08)" : "transparent"}
                  padding="$2"
                  borderRadius="$4"
                >
                  <Text fontSize="$2" color="$secondary" fontWeight="500">
                    {day.label}
                  </Text>
                  <Text
                    fontSize="$3"
                    fontWeight={day.isToday ? "bold" : "500"}
                    color={day.isToday ? "$primary" : "$text_dark"}
                  >
                    {day.date.toString().padStart(2, "0")}
                  </Text>
                </YStack>
              ))}
            </XStack>
          </YStack>

          {/* My Gardens Section */}
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                Mijn tuinen
              </Text>
            </XStack>

            {loading ? (
              <XStack padding="$10" justifyContent="center">
                <Spinner size="large" color="$primary" />
              </XStack>
            ) : myGardens.length === 0 ? (
              <YStack
                padding="$6"
                alignItems="center"
                gap="$2"
                backgroundColor="rgba(23, 51, 0, 0.03)"
                borderRadius="$6"
              >
                <MaterialCommunityIcons
                  name="sprout"
                  size={32}
                  color="#57594D"
                />
                <Text color="$secondary" fontSize="$3" textAlign="center">
                  Je hebt nog geen tuinen aangemaakt.
                </Text>
                <Button
                  label="Tuin aanmaken"
                  backgroundColor="$background"
                  color="$white"
                  onPress={() => router.push("/garden/create")}
                />
              </YStack>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
              >
                <XStack gap="$2" paddingHorizontal="$0">
                  {myGardens.map((garden) => (
                    <GardenCard
                      key={garden.id}
                      name={garden.name}
                      rating={garden.rating}
                      location={garden.location}
                      image={
                        garden.image_url
                          ? { uri: garden.image_url }
                          : require("@/assets/images/hero.png")
                      }
                      onDetailsPress={() =>
                        router.push(("/garden/" + garden.id) as any)
                      }
                    />
                  ))}
                </XStack>
              </ScrollView>
            )}
          </YStack>

          {/* Recommended Gardens Section */}
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                Aanbevolen tuinen
              </Text>
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$text_dark"
                textDecorationLine="underline"
                onPress={() => router.push("/explore")}
              >
                meer info →
              </Text>
            </XStack>

            {loading ? (
              <XStack padding="$10" justifyContent="center">
                <Spinner size="large" color="$primary" />
              </XStack>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
              >
                <XStack gap="$2" paddingHorizontal="$0">
                  {recommended.map((garden) => (
                    <GardenCard
                      key={garden.id}
                      name={garden.name}
                      rating={garden.rating}
                      location={garden.location}
                      image={
                        garden.image_url
                          ? { uri: garden.image_url }
                          : require("@/assets/images/hero.png")
                      }
                      onDetailsPress={() =>
                        router.push(("/garden/" + garden.id) as any)
                      }
                    />
                  ))}
                </XStack>
              </ScrollView>
            )}
          </YStack>

          {/* Location-Based Section */}
          <YStack gap="$3">
            <Text fontSize="$5" fontWeight="bold" color="$text_dark">
              op basis van locatie:
            </Text>
            <Card
              elevation={2}
              backgroundColor="rgba(23, 51, 0, 0.05)"
              borderColor="rgba(23, 51, 0, 0.1)"
              borderWidth={1}
              borderRadius="$6"
              overflow="hidden"
              height={160}
              position="relative"
              pressStyle={{ opacity: 0.9, scale: 0.98 }}
              onPress={() => router.push("/map")}
            >
              <ExpoImage
                source={require("@/assets/images/hero.png")}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
              <YStack
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                backgroundColor="rgba(23, 51, 0, 0.75)"
                paddingHorizontal="$4"
                paddingVertical="$3"
              >
                <Text color="white" fontWeight="bold" fontSize="$4">
                  Tuinen in jouw buurt
                </Text>
                <Text color="rgba(255, 255, 255, 0.8)" fontSize="$2">
                  Ontdek dichtstbijzijnde groene oases
                </Text>
              </YStack>
            </Card>
          </YStack>

          {/* Recent Logs */}
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                Recente logs
              </Text>
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$text_dark"
                textDecorationLine="underline"
                onPress={() => router.push("/logbook")}
              >
                meer info →
              </Text>
            </XStack>

            {loading ? (
              <XStack padding="$10" justifyContent="center">
                <Spinner size="large" color="$primary" />
              </XStack>
            ) : logs.length === 0 ? (
              <YStack
                padding="$6"
                alignItems="center"
                gap="$2"
                backgroundColor="rgba(23, 51, 0, 0.03)"
                borderRadius="$6"
              >
                <Text color="$secondary" fontSize="$3" textAlign="center">
                  het is hier nog heel stil...
                </Text>
              </YStack>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
              >
                <XStack gap="$2" paddingHorizontal="$0">
                  {logs.map((log) => (
                    <LogCard key={log.id} log={log} />
                  ))}
                </XStack>
              </ScrollView>
            )}
          </YStack>

          {/* Recent Notifications */}
          {notifications.length > 0 && (
            <YStack gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                  Recente meldingen
                </Text>
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$text_dark"
                  textDecorationLine="underline"
                  onPress={() => router.push("/notifications")}
                >
                  meer info →
                </Text>
              </XStack>

              <YStack gap="$2">
                {notifications.slice(0, 3).map((notif) => (
                  <Card
                    key={notif.id}
                    elevation={1}
                    backgroundColor={notif.read ? "white" : "rgba(227, 236, 215, 0.5)"}
                    borderColor="rgba(23, 51, 0, 0.1)"
                    borderWidth={1}
                    borderRadius="$4"
                    padding="$3"
                    onPress={() => router.push("/notifications")}
                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                  >
                    <XStack gap="$2" alignItems="center">
                      <Circle size={36} backgroundColor="rgba(23, 51, 0, 0.08)">
                        <MaterialCommunityIcons
                          name="bell-outline"
                          size={16}
                          color="#173300"
                        />
                      </Circle>
                      <YStack flex={1}>
                        <Text fontSize="$3" fontWeight="600" color="$text_dark" numberOfLines={1}>
                          {notif.title}
                        </Text>
                        <Text fontSize="$2" color="$secondary" numberOfLines={1}>
                          {notif.body}
                        </Text>
                      </YStack>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            </YStack>
          )}
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
