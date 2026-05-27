import Button from "@/components/ui/Button";
import GardenCard from "@/components/ui/GardenCard";
import ApplianceBadges from "@/components/ui/ApplianceBadges";
import { LogCard, type GardenLog } from "@/components/ui/LogCard";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { Card, Spinner, Text, XStack, YStack } from "tamagui";
import { type Garden } from "@/types/garden";

interface SeekerViewProps {
  searchQuery?: string;
  searchResults?: Garden[];
  searchLoading?: boolean;
  isSearchFocused?: boolean;
  showingSearch?: boolean;
  onSearchChange?: (text: string) => void;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
}

export default function SeekerView({
  searchQuery = "",
  searchResults = [],
  searchLoading = false,
  isSearchFocused = false,
  showingSearch = false,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
}: SeekerViewProps) {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [logs, setLogs] = useState<GardenLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [gardensRes, logsRes] = await Promise.all([
        supabase
          .from("gardens")
          .select("id, name, location, image_url, appliances, owner:profiles!owner_id(rating)")
          .limit(5),
        supabase
          .from("garden_logs")
          .select("id, title, status")
          .limit(5),
      ]);

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
          <Text fontSize="$4" fontWeight="bold" color="$text_dark" paddingLeft="$2">
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
                  <ExpoImage
                    source={(garden.imageUrl ? { uri: garden.imageUrl } : undefined) as any}
                    style={{ width: 120, height: "100%", backgroundColor: "$borderColor" }}
                    contentFit="cover"
                  />
                  <YStack flex={1} justifyContent="center" padding="$2">
                    <Text fontSize="$4" fontWeight="bold" color="$text_dark">
                      {garden.name}
                    </Text>
                    <XStack alignItems="center" gap="$1" marginTop="$1">
                      <Ionicons name="star" size={14} color="#f59e0b" />
                      <Text fontSize="$3" color="$text_dark">
                        {garden.owner?.rating ? garden.owner.rating.toFixed(1) : "Nieuw"}
                      </Text>
                    </XStack>
                    <XStack alignItems="center" gap="$1" marginTop="$1">
                      <Ionicons name="location" size={14} color="$text_light" />
                      <Text fontSize="$3" color="$text_light">
                        {garden.location}
                      </Text>
                    </XStack>
                    <XStack marginTop="$2">
                      <ApplianceBadges appliances={garden.appliances} />
                    </XStack>
                  </YStack>
                </XStack>
              </Card>
            ))
          )}
        </YStack>
      ) : (
        <>
          <YStack marginTop="$6" paddingHorizontal="$2">
            <Text fontSize="$4" fontWeight="bold" color="$text_dark" marginBottom="$3">
              Ontdek tuinen in de buurt
            </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$3">
              {gardens.map((garden) => (
                <GardenCard
                  key={garden.id}
                  garden={garden}
                  onPress={() => router.push(('/garden/' + garden.id) as any)}
                />
              ))}
            </XStack>
          </ScrollView>
          </YStack>

          <YStack marginTop="$6" paddingHorizontal="$2">
            <Text fontSize="$4" fontWeight="bold" color="$text_dark" marginBottom="$3">
              Recente logboek entries
            </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$3">
              {logs.map((log) => (
                <LogCard key={log.id} log={log} />
              ))}
            </XStack>
          </ScrollView>
          </YStack>

          <Card
            marginTop="$6"
            backgroundColor="$primary"
            borderRadius="$6"
            padding="$4"
            onPress={() => router.push("/explore")}
            pressStyle={{ scale: 0.98, opacity: 0.9 }}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <YStack flex={1}>
                <Text fontSize="$4" fontWeight="bold" color="$white">
                  Ontdek alle tuinen
                </Text>
                <Text fontSize="$3" color="$white" opacity={0.9}>
                  Bekijk alle beschikbare tuinen in jouw buurt
                </Text>
              </YStack>
              <Ionicons name="arrow-forward" size={24} color="$white" />
            </XStack>
          </Card>
        </>
      )}
    </YStack>
  );
}
