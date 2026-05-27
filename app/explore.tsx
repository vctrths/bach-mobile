import GardenCard from "@/components/ui/GardenCard";
import PageContainer from "@/components/ui/PageContainer";
import { Garden } from "@/types/garden";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import { Card, H2, Spinner, Text, XStack, YStack } from "tamagui";

export default function ExploreScreen() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGardens = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("gardens")
        .select("id, name, location, image_url, appliances, owner:profiles!owner_id(rating)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching gardens:", error);
        return;
      }

      if (data) {
        setGardens(toCamelCase<Garden[]>(data));
      }
    } catch (error) {
      console.error("Explore fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGardens();
  }, [fetchGardens]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGardens();
  };

  return (
    <PageContainer
      topNavTitle="Ontdekken"
      activeTab="home"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <YStack paddingHorizontal="$5" gap="$5">
        {/* Explorer Hero Card */}
        <Card
          backgroundColor="$background_secondary"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$6"
          padding="$4"
          gap="$2"
          marginTop="$2"
        >
          <H2 color="$text_dark" fontWeight="bold">
            Groene Oases in jouw buurt
          </H2>
          <Text color="$text_dark" fontSize="$3">
            Ontdek prachtige privétuinen die openstaan voor jouw groene vingers.
          </Text>
        </Card>

        {/* Results Section */}
        <YStack gap="$3" marginTop="$2">
          <XStack gap="$3" alignItems="center">
            <Ionicons name="compass-outline" size={24} color="#172211" />
            <Text fontSize="$4" color="$text_dark" fontWeight="bold">
              Aanbevolen resultaten
            </Text>
          </XStack>

          {loading ? (
            <XStack padding="$10" justifyContent="center">
              <Spinner size="large" color="$primary" />
            </XStack>
          ) : gardens.length === 0 ? (
            <Text color="$secondary" fontSize="$3">
              Er zijn momenteel geen andere tuinen beschikbaar. Kom later terug voor nieuwe oases!
            </Text>
          ) : (
            <YStack gap="$4">
              {gardens.map((garden) => (
                <GardenCard
                  key={garden.id}
                  garden={garden}
                  onPress={() => router.push(("/garden/" + garden.id) as any)}
                />
              ))}
            </YStack>
          )}
        </YStack>
      </YStack>
    </PageContainer>
  );
}
