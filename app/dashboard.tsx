import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import NotificationBell from "@/components/ui/NotificationBell";
import SearchBar from "@/components/ui/SearchBar";
import GardenCard from "@/components/ui/GardenCard";
import { LogCard, type GardenLog } from "@/components/ui/LogCard";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { supabase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { Card, Circle, Spinner, Text, XStack, YStack } from "tamagui";

type Garden = {
  id: string;
  name: string;
  rating: number;
  location: string;
  image_url: string | null;
  description: string | null;
};

type UserProfile = {
  first_name: string;
  profile_image: string | null;
};

export default function Dashboard() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [logs, setLogs] = useState<GardenLog[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Garden[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Parallel fetch for better performance
      const [gardensRes, logsRes, profileRes] = await Promise.all([
        supabase
          .from("gardens")
          .select("id, name, rating, location, image_url, description")
          .limit(5),
        supabase.from("garden_logs").select("id, title, status").limit(5),
        user
          ? supabase
              .from("profiles")
              .select("first_name, profile_image")
              .eq("id", user.id)
              .single()
          : Promise.resolve({ data: null }),
      ]);

      if (gardensRes.data) setGardens(gardensRes.data as Garden[]);
      if (logsRes.data) setLogs(logsRes.data as GardenLog[]);
      if (profileRes.data) setProfile(profileRes.data as UserProfile);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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

  // Debounced search
  const fetchGardens = useCallback(async (query: string) => {
    setSearchLoading(true);
    try {
      let supabaseQuery = supabase
        .from("gardens")
        .select("id, name, rating, location, description, image_url");

      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      const { data, error } = await supabaseQuery.limit(20);

      if (data && !error) {
        setSearchResults(data);
      } else if (error) {
        console.error("Supabase error:", error.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching gardens:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchGardens(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchGardens]);

  const formatLocation = (garden: Garden) => {
    return garden.location || "Onbekende locatie";
  };

  if (loading) {
    return (
      <ThemedSafeArea>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Spinner size="large" color="green" />
          <Text color="green" fontSize="$4">
            Tuinen laden...
          </Text>
        </YStack>
      </ThemedSafeArea>
    );
  }

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
                  color="green"
                />
                <Text fontSize="$4" fontWeight="600" color="#172211">
                  Leuven, BE
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={16}
                  color="#172211"
                />
              </XStack>
            }
            rightElement={
              <XStack gap="$3" alignItems="center">
                <NotificationBell />
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
                    color="#D4E1AE"
                    onPress={() => router.push("/profile")}
                  />
                )}
              </XStack>
            }
          >
            <SearchBar
              active
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Zoeken naar een tuin"
            />
          </TopNavPill>

          {searchQuery.trim() ? (
            // Search Results
            <YStack gap="$3">
              <Text fontSize="$4" fontWeight="bold" color="#172211">
                Resultaten voor &ldquo;{searchQuery}&rdquo;
              </Text>

              {searchLoading ? (
                <XStack padding="$10" justifyContent="center">
                  <Spinner size="large" color="green" />
                </XStack>
              ) : searchResults.length === 0 ? (
                <YStack padding="$10" justifyContent="center" alignItems="center" gap="$3">
                  <MaterialCommunityIcons name="tree-outline" size={48} color="#9CA3AF" />
                  <Text fontSize="$4" color="#172211" textAlign="center">
                    Geen tuinen gevonden
                  </Text>
                  <Text fontSize="$3" color="#9CA3AF" textAlign="center">
                    Probeer een andere zoekopdracht
                  </Text>
                </YStack>
              ) : (
                searchResults.map((garden) => (
                  <Card
                    key={garden.id}
                    elevation={2}
                    backgroundColor="white"
                    borderColor="#D4E1AE"
                    borderWidth={1}
                    borderRadius="$6"
                    overflow="hidden"
                    padding="$3"
                    onPress={() => router.push(("/garden/" + garden.id) as any)}
                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                  >
                    <XStack gap="$3" height={150}>
                      {/* Image */}
                      <ExpoImage
                        source={
                          garden.image_url
                            ? { uri: garden.image_url }
                            : require("@/assets/images/hero.png")
                        }
                        style={{ width: 150, height: "100%", borderRadius: 8 }}
                        contentFit="cover"
                      />

                      {/* Details */}
                      <YStack flex={1} justifyContent="space-between" gap="$2">
                        <YStack gap="$1">
                          <XStack justifyContent="space-between" alignItems="center">
                            <Text fontSize="$4" fontWeight="bold" color="#172211" flex={1}>
                              {garden.name}
                            </Text>
                            <XStack gap="$1" alignItems="center">
                              <MaterialCommunityIcons
                                name="star"
                                size={16}
                                color="#FFB800"
                              />
                              <Text fontSize="$3" fontWeight="bold" color="#172211">
                                {garden.rating?.toFixed(1) ?? "N/A"}
                              </Text>
                            </XStack>
                          </XStack>

                          <XStack gap="$2" alignItems="center">
                            <MaterialCommunityIcons
                              name="map-marker"
                              size={14}
                              color="green"
                            />
                            <Text fontSize="$3" color="#172211">
                              {formatLocation(garden)}
                            </Text>
                          </XStack>

                          {garden.description && (
                            <Text
                              fontSize="$2"
                              color="#9CA3AF"
                              numberOfLines={2}
                              lineHeight="$3"
                            >
                              {garden.description}
                            </Text>
                          )}
                        </YStack>

                        <XStack gap="$2">
                          <Button
                            label="Details"
                            flex={1}
                            backgroundColor="green"
                            color="white"
                            onPress={() =>
                              router.push(("/garden/" + garden.id) as any)
                            }
                            paddingVertical="$2"
                          />
                          <Card
                            width={40}
                            height={40}
                            borderRadius={20}
                            backgroundColor="green"
                            padding="$2"
                            justifyContent="center"
                            alignItems="center"
                            onPress={() => {}}
                          >
                            <MaterialCommunityIcons
                              name="heart"
                              size={20}
                              color="white"
                            />
                          </Card>
                        </XStack>
                      </YStack>
                    </XStack>
                  </Card>
                ))
              )}
            </YStack>
          ) : (
            // Dashboard content
            <>
              {/* Welcome */}
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$5" fontWeight="bold" color="#172211">
                  Welkom terug
                </Text>
                <Text fontSize="$4" color="green" fontWeight="600">
                  {profile?.first_name}
                </Text>
              </XStack>

              {/* Pro Banner */}
              <Card
                backgroundColor="white"
                borderColor="#D4E1AE"
                borderWidth={1}
                borderRadius="$8"
                padding="$4"
                gap="$2"
                shadowColor="rgba(0,0,0,0.05)"
                shadowRadius={8}
                shadowOffset={{ width: 0, height: 4 }}
              >
                <XStack alignItems="center" gap="$2">
                  <Ionicons name="leaf" size={20} color="green" />
                  <Text fontSize="$3" fontWeight="bold" color="#172211">
                    Pro Lidmaatschap
                  </Text>
                </XStack>
                <Text fontSize="$3" color="#172211">
                  Om meer aanvragen te sturen heb je een pro account nodig
                </Text>
                <Button
                  label="Bekijk Pro Plan"
                  backgroundColor="green"
                  color="white"
                  onPress={() => router.push("/problock")}
                />
              </Card>

              {/* My Gardens */}
              <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$5" fontWeight="bold" color="#172211">
                    Tuinen in jouw buurt
                  </Text>
                  <Button
                    label="Bekijk alle"
                    backgroundColor="transparent"
                    color="green"
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    onPress={() => router.push("/explore")}
                  />
                </XStack>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  <XStack gap="$4" paddingHorizontal="$1">
                    {gardens.map((garden) => (
                      <GardenCard
                        key={garden.id}
                        name={garden.name}
                        rating={garden.rating}
                        location={garden.location}
                        imageUrl={garden.image_url}
                        onDetailsPress={() =>
                          router.push(("/garden/" + garden.id) as any)
                        }
                      />
                    ))}
                  </XStack>
                </ScrollView>
              </YStack>

              {/* Location */}
              <Card
                backgroundColor="white"
                borderColor="#D4E1AE"
                borderWidth={1}
                borderRadius="$8"
                padding="$4"
                onPress={() => router.push("/map")}
                pressStyle={{ scale: 0.98 }}
              >
                <XStack alignItems="center" gap="$3">
                  <Ionicons name="location" size={24} color="green" />
                  <YStack flex={1}>
                    <Text fontSize="$4" fontWeight="bold" color="#172211">
                      Leuven, BE
                    </Text>
                    <Text fontSize="$3" color="#9CA3AF">
                      15 tuinen binnen 2km
                    </Text>
                  </YStack>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </XStack>
              </Card>

              {/* Recent Logs */}
              <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$5" fontWeight="bold" color="#172211">
                    Recent Tuinlogs
                  </Text>
                  <Button
                    label="Alle logs"
                    backgroundColor="transparent"
                    color="green"
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    onPress={() => router.push("/logbook")}
                  />
                </XStack>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  <XStack gap="$4" paddingHorizontal="$1">
                    {logs.map((log) => (
                      <LogCard
                        key={log.id}
                        id={log.id}
                        title={log.title}
                        status={log.status}
                        created_at={log.created_at}
                        onPress={() =>
                          router.push(("/logbook/" + log.id) as any)
                        }
                      />
                    ))}
                  </XStack>
                </ScrollView>
              </YStack>
            </>
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
