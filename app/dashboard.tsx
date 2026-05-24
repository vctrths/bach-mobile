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
import { type Garden } from "@/types/garden";

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Parallel fetch for better performance
      const [gardensRes, logsRes, profileRes] = await Promise.all([
        supabase
          .from("gardens")
          .select("id, name, rating, location, image_url")
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
        .select("id, name, rating, location, image_url, description");

      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      const { data, error } = await supabaseQuery.limit(20);

      if (data && !error) {
        setSearchResults(data as Garden[]);
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
                    color="$borderColor"
                    onPress={() => router.push("/profile")}
                    suppressHighlighting
                  />
                )}
              </XStack>
            }
          >
            <SearchBar
              active
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Zoeken naar een tuin"
            />
          </TopNavPill>

          {searchQuery.trim() || isSearchFocused ? (
            // Search Results
            <YStack gap="$3">
              <Text fontSize="$4" fontWeight="bold" color="$text_dark">
                {searchQuery.trim() ? `Resultaten voor "${searchQuery}"` : "Alle tuinen"}
              </Text>

              {searchLoading ? (
                <XStack padding="$10" justifyContent="center">
                  <Spinner size="large" color="$primary" />
                </XStack>
              ) : searchResults.length === 0 ? (
                <YStack padding="$10" justifyContent="center" alignItems="center" gap="$3">
                  <MaterialCommunityIcons name="tree-outline" size={48} color="$text_light" />
                  <Text fontSize="$4" color="$text_dark" textAlign="center">
                    Geen tuinen gevonden
                  </Text>
                  <Text fontSize="$3" color="$text_light" textAlign="center">
                    Probeer een andere zoekopdracht
                  </Text>
                </YStack>
              ) : (
                searchResults.map((garden) => (
                  <Card
                    key={garden.id}
                    elevation={2}
                    backgroundColor="$canvas"
                    borderColor="$borderColor"
                    borderWidth={1}
                    borderRadius="$6"
                    overflow="hidden"
                    padding="$3"
                    onPress={() => router.push(('/garden/' + garden.id) as any)}
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
                            <Text fontSize="$4" fontWeight="bold" color="$text_dark" flex={1}>
                              {garden.name}
                            </Text>
                            <XStack gap="$1" alignItems="center">
                              <MaterialCommunityIcons
                                name="star"
                                size={16}
                                color="#FFB800"
                              />
                              <Text fontSize="$3" fontWeight="bold" color="$text_dark">
                                {garden.rating?.toFixed(1) ?? "N/A"}
                              </Text>
                            </XStack>
                          </XStack>

                          <XStack gap="$2" alignItems="center">
                            <MaterialCommunityIcons
                              name="map-marker"
                              size={14}
                              color="$primary"
                            />
                            <Text fontSize="$3" color="$text_dark">
                              {garden.location || "Onbekende locatie"}
                            </Text>
                          </XStack>

                          {garden.description && (
                            <Text
                              fontSize="$2"
                              color="$text_light"
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
                            backgroundColor="$background"
                            color="$white"
                            onPress={() =>
                              router.push(('/garden/' + garden.id) as any)
                            }
                            paddingVertical="$2"
                          />
                          <Card
                            width={40}
                            height={40}
                            borderRadius={20}
                            backgroundColor="$background"
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
            <>
              {/* Pro Upgrade Banner */}
          <Card
            elevation={2}
            backgroundColor="#f0f3ec"
            borderColor="#e3ecd7"
            borderWidth={1}
            padding="$4"
            gap="$3"
          >
            <Text fontSize="$3" color="$primary">
              Om meer aanvragen te sturen heb je een pro account nodig
            </Text>
            <Button
              label="Probeer pro | €7 /maand"
              backgroundColor="$background"
              color="$white"
              onPress={() => router.push("/pro")}
            />
          </Card>

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

          {/* Location-Based Section */}
          <YStack gap="$3">
            <Text fontSize="$5" fontWeight="bold" color="$text_dark">
              op basis van locatie:
            </Text>
            <Card
              elevation={2}
              backgroundColor="$canvas"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$6"
              overflow="hidden"
              height={200}
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

          {/* Tuinlogboek Section */}
          <YStack gap="$3" paddingBottom="$20">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                Tuinlogboek
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
