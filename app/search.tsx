import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { supabase } from "@/utils/supabase";
import { Image as ExpoImage } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, TextInput } from "react-native";
import { Card, Circle, Spinner, Text, XStack, YStack } from "tamagui";

type Garden = {
  id: string;
  name: string;
  rating: number | null;
  location: string | null;
  description: string | null;
  image_url: string | null;
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<{ profile_image: string | null } | null>(null);

  const fetchGardens = useCallback(async (query: string) => {
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchGardens(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchGardens]);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("profile_image")
          .eq("id", user.id)
          .single();

        if (data) setProfile(data);
      }
    };

    fetchProfile();
  }, []);

  const formatLocation = (garden: Garden) => {
    return garden.location || "Onbekende locatie";
  };

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$4" gap="$6">
          {/* Top Navigation */}
          <TopNavPill
            hideBack
            title={
              <YStack gap="$2">
                <Text fontSize="$3" fontWeight="600" color="$text_dark">
                  Locatie
                </Text>
                <XStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={18}
                    color="$primary"
                  />
                  <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                    Leuven, BE
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={18}
                    color="$text_dark"
                  />
                </XStack>
              </YStack>
            }
            rightElement={
              profile?.profile_image ? (
                <Circle size={50} onPress={() => router.push("/profile")} overflow="hidden">
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
              )
            }
          >
            {/* Active Search Bar */}
            <XStack
              backgroundColor="white"
              borderRadius="$8"
              paddingHorizontal="$4"
              paddingVertical="$3"
              alignItems="center"
              gap="$2"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <MaterialCommunityIcons name="magnify" size={20} color="$text_dark" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Zoeken naar een tuin"
                placeholderTextColor="#6b7280"
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: "#1f2937",
                  fontFamily: "Satoshi",
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#9ca3af"
                  onPress={() => setSearchQuery("")}
                />
              )}
            </XStack>
          </TopNavPill>

          {/* Search Results */}
          <YStack gap="$3">
            <Text fontSize="$4" fontWeight="bold" color="$text_dark">
              {searchQuery ? `Resultaten voor "${searchQuery}"` : "Alle tuinen"}
            </Text>

            {loading ? (
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
                            {formatLocation(garden)}
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
                            router.push(("/garden/" + garden.id) as any)
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
        </YStack>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="home"
        onHomePress={() => router.push("/dashboard")}
        onMessagePress={() => router.push("/messages" as any)}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
