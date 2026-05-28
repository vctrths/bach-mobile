import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Card, H1, Spinner, Text, XStack, YStack } from "tamagui";
import { Garden } from "@/types/garden";

export default function SavedGardensScreen() {
  const [savedGardens, setSavedGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedGardens();
  }, []);

  const fetchSavedGardens = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("saved_gardens")
        .select(
          "garden_id, gardens(id, name, location, description, image_url, owner:profiles!owner_id(rating))"
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching saved gardens:", error);
        return;
      }

      const mapped =
        data?.map((row: any) => toCamelCase({
          id: row.garden_id,
          name: row.gardens?.name ?? "Onbekende tuin",
          location: row.gardens?.location ?? null,
          description: row.gardens?.description ?? null,
          image_url: row.gardens?.image_url ?? null,
          owner: row.gardens?.owner ?? null,
        })) as Garden[] ?? [];

      setSavedGardens(mapped);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      topNavTitle="Opgeslagen tuinen"
      onBackPress={() => router.back()}
      activeTab="profile"
    >
      {loading ? (
        <YStack padding="$10" justifyContent="center" alignItems="center">
          <Spinner size="large" color="$primary" />
        </YStack>
      ) : savedGardens.length === 0 ? (
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          gap="$4"
          marginTop="$10"
        >
          <Ionicons name="heart-outline" size={64} color="#57594D" />
          <H1
            color="$text_dark"
            fontWeight="bold"
            textAlign="center"
            fontSize="$5"
          >
            Geen opgeslagen tuinen
          </H1>
          <Text color="$secondary" fontSize="$3" textAlign="center">
            Ontdek tuinen en sla je favorieten op voor later.
          </Text>
          <Button
            label="Tuinen ontdekken"
            onPress={() => router.push("/search")}
          />
        </YStack>
      ) : (
        <YStack gap="$4" paddingHorizontal="$5">
          {savedGardens.map((garden) => (
            <Card
              key={garden.id}
              elevation={2}
              backgroundColor="white"
              borderColor="rgba(23, 51, 0, 0.1)"
              borderWidth={1}
              borderRadius="$6"
              overflow="hidden"
              onPress={() => router.push(("/garden/" + garden.id) as any)}
              pressStyle={{ scale: 0.98, opacity: 0.9 }}
            >
              <ExpoImage
                source={
                  garden.imageUrl
                    ? { uri: garden.imageUrl }
                    : require("@/assets/images/hero.png")
                }
                style={{ width: "100%", height: 160 }}
                contentFit="cover"
              />
              <YStack padding="$4" gap="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$4" fontWeight="bold" color="$text_dark">
                    {garden.name}
                  </Text>
                  <XStack gap="$1" alignItems="center">
                    <MaterialCommunityIcons
                      name="star"
                      size={16}
                      color="#FFB800"
                    />
                    <Text fontSize="$3" fontWeight="bold" color="$text_dark">
                      {garden.owner?.rating ? garden.owner.rating.toFixed(1) : "Nieuw"}
                    </Text>
                  </XStack>
                </XStack>
                <XStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color="#173300"
                  />
                  <Text fontSize="$3" color="$secondary">
                    {garden.location || "Onbekende locatie"}
                  </Text>
                </XStack>
                {garden.description && (
                  <Text fontSize="$2" color="$secondary" numberOfLines={2}>
                    {garden.description}
                  </Text>
                )}
              </YStack>
            </Card>
          ))}
        </YStack>
      )}
    </PageContainer>
  );
}