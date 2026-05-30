import PageContainer from "@/components/ui/PageContainer";
import GardenListCard from "@/components/ui/GardenListCard";
import NotificationBell from "@/components/ui/NotificationBell";
import SearchBar from "@/components/ui/SearchBar";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Circle, Spinner, Text, XStack, YStack } from "tamagui";
import { type Garden } from "@/types/garden";
import { useAuth } from "@/context/AuthContext";

export default function SearchScreen() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGardens = useCallback(async (query: string) => {
    setLoading(true);
    try {
      let supabaseQuery = supabase
        .from("gardens")
        .select("id, name, location, description, image_url, appliances, owner:profiles!owner_id(rating)");

      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      const { data, error } = await supabaseQuery.limit(20);

      if (data && !error) {
        setSearchResults(toCamelCase<Garden[]>(data));
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

  return (
    <PageContainer
      topNavHeight={140}
      topNavTitle={
        <XStack gap="$2" alignItems="center">
          <MaterialCommunityIcons name="map-marker" size={18} color="$primary" />
          <Text fontSize="$4" fontWeight="600" color="$text_dark">
            In de buurt
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color="$text_dark" />
        </XStack>
      }
      rightElement={
        <XStack gap="$3" alignItems="center">
          <NotificationBell />
          {profile?.profileImage ? (
            <Circle size={50} onPress={() => router.push("/profile")} pressStyle={{ scale: 0.94, opacity: 0.85 }} overflow="hidden">
              <ExpoImage
                source={{ uri: profile.profileImage }}
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
      topNavChildren={
        <SearchBar
          active
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Zoeken naar een tuin"
        />
      }
      activeTab="home"
    >
      <YStack gap="$3" paddingHorizontal="$4">
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
            <GardenListCard
              key={garden.id}
              garden={garden}
              onPress={() => router.push(("/garden/" + garden.id) as any)}
              onFavoritePress={() => {}}
            />
          ))
        )}
      </YStack>
    </PageContainer>
  );
}
