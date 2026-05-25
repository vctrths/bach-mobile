import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import NotificationBell from "@/components/ui/NotificationBell";
import SearchBar from "@/components/ui/SearchBar";
import GardenCard from "@/components/ui/GardenCard";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { supabase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { OnboardingContext } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import React, { useContext, useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { Card, Circle, Spinner, Text, XStack, YStack } from "tamagui";
import { type Garden } from "@/types/garden";

type ApprovedGardener = {
  id: string;
  garden_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  profile_image: string | null;
  days: string[];
};

type GardenRequest = {
  id: string;
  garden_id: string;
  user_id: string;
  motivation: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const DAY_LABELS = ["M", "D", "W", "D", "V", "Z", "Z"];
const DAY_NAMES = [
  "maandag",
  "dinsdag",
  "woensdag",
  "donderdag",
  "vrijdag",
  "zaterdag",
  "zondag",
];

export default function OwnerDashboard() {
  const { data: onboardingData } = useContext(OnboardingContext);
  const { profile: authProfile } = useAuth();
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [gardeners, setGardeners] = useState<ApprovedGardener[]>([]);
  const [requests, setRequests] = useState<GardenRequest[]>([]);
  const [userProfile, setUserProfile] = useState<{
    first_name: string;
    profile_image: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Fetch gardens, approved gardeners, pending requests, and profile
      const [gardensRes, gardenersRes, requestsRes, profileRes] =
        await Promise.all([
          supabase
            .from("gardens")
            .select("id, name, rating, location, image_url")
            .eq("owner_id", user.id)
            .limit(10),
          supabase
            .from("garden_requests")
            .select(
              `id, garden_id, user_id, days, profiles(first_name, last_name, profile_image)`
            )
            .eq("status", "approved")
            .limit(20),
          supabase
            .from("garden_requests")
            .select("id, garden_id, user_id, motivation, status, created_at")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("profiles")
            .select("first_name, profile_image")
            .eq("id", user.id)
            .single(),
        ]);

      if (gardensRes.data) setGardens(gardensRes.data as Garden[]);

      if (gardenersRes.data) {
        const mappedGardeners = (gardenersRes.data as any[]).map((r) => ({
          id: r.id,
          garden_id: r.garden_id,
          user_id: r.user_id,
          first_name: r.profiles?.first_name ?? "Tuinzoeker",
          last_name: r.profiles?.last_name ?? "",
          profile_image: r.profiles?.profile_image ?? null,
          days: r.days ?? [],
        }));
        setGardeners(mappedGardeners);
      }

      if (requestsRes.data) setRequests(requestsRes.data as GardenRequest[]);
      if (profileRes.data) setUserProfile(profileRes.data);
    } catch (error) {
      console.error("Error fetching owner dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const effectiveRole = authProfile?.role || onboardingData.role;
    if (effectiveRole && effectiveRole !== "tuineigenaar") {
      if (effectiveRole === "tuinzoeker (met tuin)") {
        router.replace("/gardener/dashboard");
      } else {
        router.replace("/dashboard");
      }
      return;
    }
    fetchData();
  }, [authProfile?.role, onboardingData.role]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRespond = async (
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      const { error } = await supabase
        .from("garden_requests")
        .update({ status })
        .eq("id", requestId);

      if (!error) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        router.push(
          status === "approved"
            ? (`/owner/request-accepted?requestId=${requestId}` as any)
            : (`/owner/request-rejected?requestId=${requestId}` as any)
        );
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  return (
    <ThemedSafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack
          flex={1}
          paddingHorizontal="$4"
          paddingVertical="$4"
          gap="$6"
          paddingBottom="$25"
        >
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
                <NotificationBell />
                {userProfile?.profile_image ? (
                  <Circle
                    size={50}
                    onPress={() => router.push("/profile")}
                    overflow="hidden"
                  >
                    <ExpoImage
                      source={{ uri: userProfile.profile_image }}
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
            <SearchBar onPress={() => router.push("/search")} />
          </TopNavPill>

          {/* Quick Stats */}
          <XStack gap="$3">
            <Card
              flex={1}
              elevation={2}
              backgroundColor="#f0f3ec"
              borderColor="#e3ecd7"
              borderWidth={1}
              padding="$4"
              gap="$1"
            >
              <Text fontSize="$3" color="$secondary" fontWeight="500">
                Mijn tuinen
              </Text>
              <Text fontSize="$7" color="$text_dark" fontWeight="bold">
                {gardens.length}
              </Text>
            </Card>
            <Card
              flex={1}
              elevation={2}
              backgroundColor="#f0f3ec"
              borderColor="#e3ecd7"
              borderWidth={1}
              padding="$4"
              gap="$1"
            >
              <Text fontSize="$3" color="$secondary" fontWeight="500">
                Open aanvragen
              </Text>
              <Text fontSize="$7" color="$text_dark" fontWeight="bold">
                {requests.length}
              </Text>
            </Card>
          </XStack>

          {/* Tuinen Section */}
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                Tuinen
              </Text>
            </XStack>

            {loading ? (
              <XStack padding="$10" justifyContent="center">
                <Spinner size="large" color="$primary" />
              </XStack>
            ) : gardens.length === 0 ? (
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
                  {gardens.map((garden) => (
                    <GardenCard
                      key={garden.id}
                      name={garden.name}
                      rating={garden.rating ?? 0}
                      location={garden.location ?? "Onbekende locatie"}
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

          {/* Jouw planning Section */}
          <YStack gap="$3">
            <Text fontSize="$5" fontWeight="bold" color="$text_dark">
              Jouw planning
            </Text>

            {loading ? (
              <XStack padding="$10" justifyContent="center">
                <Spinner size="large" color="$primary" />
              </XStack>
            ) : gardeners.length === 0 ? (
              <YStack
                padding="$6"
                alignItems="center"
                gap="$2"
                backgroundColor="rgba(23, 51, 0, 0.03)"
                borderRadius="$6"
              >
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={32}
                  color="#57594D"
                />
                <Text color="$secondary" fontSize="$3" textAlign="center">
                  Nog geen tuinzoekers gepland.
                </Text>
              </YStack>
            ) : (
              <YStack gap="$4">
                {/* Day header row */}
                <XStack
                  paddingHorizontal="$2"
                  paddingVertical="$2"
                  alignItems="center"
                  gap="$2"
                >
                  <Text
                    fontSize="$3"
                    color="$secondary"
                    fontWeight="500"
                    width={80}
                  >
                    Dag
                  </Text>
                  <XStack flex={1} justifyContent="space-around">
                    {DAY_LABELS.map((label, i) => (
                      <Text
                        key={i}
                        fontSize="$3"
                        color="$secondary"
                        fontWeight="500"
                        opacity={0.4}
                      >
                        {label}
                      </Text>
                    ))}
                  </XStack>
                </XStack>

                {/* Gardener rows */}
                {gardeners.map((gardener) => (
                  <XStack
                    key={gardener.id}
                    paddingHorizontal="$2"
                    paddingVertical="$2"
                    alignItems="center"
                    gap="$2"
                  >
                    <Text
                      fontSize="$3"
                      color="$text_dark"
                      fontWeight="500"
                      width={80}
                    >
                      {gardener.first_name}
                    </Text>
                    <XStack flex={1} justifyContent="space-around">
                      {DAY_NAMES.map((dayName, i) => {
                        const isActive = gardener.days.includes(dayName);
                        return (
                          <Circle
                            key={i}
                            size={10}
                            backgroundColor={
                              isActive ? "$primary" : "$borderColor"
                            }
                            opacity={isActive ? 1 : 0.3}
                          />
                        );
                      })}
                    </XStack>
                  </XStack>
                ))}
              </YStack>
            )}
          </YStack>

          {/* Create Garden CTA */}
          <Card
            elevation={2}
            backgroundColor="rgba(23, 51, 0, 0.05)"
            borderColor="rgba(23, 51, 0, 0.1)"
            borderWidth={1}
            padding="$4"
            gap="$3"
            onPress={() => router.push("/garden/create")}
            pressStyle={{ scale: 0.98, opacity: 0.9 }}
          >
            <XStack alignItems="center" gap="$3">
              <XStack
                backgroundColor="rgba(23, 51, 0, 0.1)"
                width={48}
                height={48}
                borderRadius={24}
                justifyContent="center"
                alignItems="center"
              >
                <Ionicons name="add" size={24} color="#173300" />
              </XStack>
              <YStack flex={1}>
                <Text fontSize="$4" color="$text_dark" fontWeight="bold">
                  Nieuwe tuin aanmaken
                </Text>
                <Text fontSize="$3" color="$secondary">
                  Deel je tuin met enthousiaste tuinzoekers
                </Text>
              </YStack>
              <Ionicons name="chevron-forward" size={20} color="#57594D" />
            </XStack>
          </Card>

          {/* Incoming Requests Section */}
          <YStack gap="$3" paddingBottom="$20">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                Aanvragen
              </Text>
            </XStack>

            {loading ? (
              <XStack padding="$10" justifyContent="center">
                <Spinner size="large" color="$primary" />
              </XStack>
            ) : requests.length === 0 ? (
              <YStack
                padding="$6"
                alignItems="center"
                gap="$2"
                backgroundColor="rgba(23, 51, 0, 0.03)"
                borderRadius="$6"
              >
                <MaterialCommunityIcons
                  name="inbox-outline"
                  size={32}
                  color="#57594D"
                />
                <Text color="$secondary" fontSize="$3" textAlign="center">
                  Geen open aanvragen op dit moment.
                </Text>
              </YStack>
            ) : (
              <YStack gap="$3">
                {requests.map((request) => (
                  <Card
                    key={request.id}
                    elevation={2}
                    backgroundColor="white"
                    borderColor="rgba(23, 51, 0, 0.1)"
                    borderWidth={1}
                    borderRadius="$6"
                    padding="$4"
                    gap="$3"
                  >
                    <YStack gap="$2">
                      <Text fontSize="$3" color="$secondary" fontWeight="500">
                        Nieuwe aanvraag
                      </Text>
                      <Text fontSize="$4" color="$text_dark">
                        {request.motivation}
                      </Text>
                    </YStack>
                    <XStack gap="$2">
                      <Button
                        label="Accepteren"
                        flex={1}
                        backgroundColor="#22c55e"
                        color="white"
                        onPress={() => handleRespond(request.id, "approved")}
                        paddingVertical="$2"
                      />
                      <Button
                        label="Weigeren"
                        flex={1}
                        backgroundColor="transparent"
                        color="#ef4444"
                        onPress={() => handleRespond(request.id, "rejected")}
                        paddingVertical="$2"
                      />
                    </XStack>
                  </Card>
                ))}
              </YStack>
            )}
          </YStack>
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
