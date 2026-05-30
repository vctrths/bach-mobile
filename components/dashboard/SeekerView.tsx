import Button from "@/components/ui/Button";
import GardenCard from "@/components/ui/GardenCard";
import GardenListCard from "@/components/ui/GardenListCard";
import { type GardenLog } from "@/components/ui/LogCard";
import { type Garden } from "@/types/garden";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Spinner, Text, XStack, YStack } from "tamagui";

interface SeekerViewProps {
  searchQuery?: string;
  searchResults?: Garden[];
  searchLoading?: boolean;
  showingSearch?: boolean;
}

const fetchWithTimeout = async <T,>(
  promise: Promise<T>,
  ms: number = 8000,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase fetch timeout")), ms),
    ),
  ]);
};

export default function SeekerView({
  searchQuery = "",
  searchResults = [],
  searchLoading = false,
  showingSearch = false,
}: SeekerViewProps) {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [logs, setLogs] = useState<GardenLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [gardensRes, logsRes] = await fetchWithTimeout(
        Promise.all([
          supabase
            .from("gardens")
            .select(
              "id, name, location, description, image_url, appliances, owner:profiles!owner_id(rating)",
            )
            .limit(5),
          supabase.from("garden_logs").select("id, title, status").limit(5),
        ]),
      );

      if (gardensRes.data) setGardens(toCamelCase<Garden[]>(gardensRes.data));
      if (logsRes.data) setLogs(toCamelCase<GardenLog[]>(logsRes.data));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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

  return (
    <YStack paddingHorizontal="$4" paddingBottom="$4">
      {loading ? (
        <XStack padding="$10" justifyContent="center">
          <Spinner size="large" color="$primary" />
        </XStack>
      ) : showingSearch ? (
        <YStack gap="$3" marginTop="$4">
          <Text
            fontSize="$4"
            fontWeight="bold"
            color="$text_dark"
            paddingLeft="$2"
          >
            {searchQuery.trim()
              ? `Resultaten voor "${searchQuery}"`
              : "Alle tuinen"}
          </Text>

          {searchLoading ? (
            <XStack padding="$10" justifyContent="center">
              <Spinner size="large" color="$primary" />
            </XStack>
          ) : searchResults.length === 0 ? (
            <YStack
              padding="$10"
              justifyContent="center"
              alignItems="center"
              gap="$3"
            >
              <MaterialCommunityIcons
                name="tree-outline"
                size={48}
                color="$text_light"
              />
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
      ) : (
        <>
          <YStack marginTop="$6" paddingHorizontal="$2">
            <Text
              fontSize="$4"
              fontWeight="bold"
              color="$text_dark"
              marginBottom="$3"
            >
              Ontdek tuinen in de buurt
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$3">
                {gardens.map((garden) => (
                  <GardenCard
                    key={garden.id}
                    garden={garden}
                    onPress={() => router.push(("/garden/" + garden.id) as any)}
                  />
                ))}
              </XStack>
            </ScrollView>
          </YStack>

          <Button
            label="Ontdek alle tuinen"
            variant="secondary"
            width="100%"
            marginTop="$6"
            onPress={() => router.push("/explore")}
            icon={<Ionicons name="arrow-forward" size={20} color="$button_secondary_text" />}
          />
        </>
      )}
    </YStack>
  );
}
