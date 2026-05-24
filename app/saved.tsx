import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import ScreenContent from "@/components/ui/ScreenContent";
import { supabase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Card, H1, Spinner, Text, XStack, YStack } from "tamagui";

type SavedGarden = {
  id: string;
  name: string;
  rating: number | null;
  location: string | null;
  description: string | null;
  image_url: string | null;
};

export default function SavedGardensScreen() {
  const [savedGardens, setSavedGardens] = useState<SavedGarden[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedGardens();
  }, []);

  const fetchSavedGardens = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("saved_gardens")
        .select("garden_id, gardens(id, name, rating, location, description, image_url)")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching saved gardens:", error);
        return;
      }

      const mapped =
        data?.map((row: any) => ({
          id: row.garden_id,
          name: row.gardens?.name ?? "Onbekende tuin",
          rating: row.gardens?.rating ?? null,
          location: row.gardens?.location ?? null,
          description: row.gardens?.description ?? null,
          image_url: row.gardens?.image_url ?? null,
        })) ?? [];

      setSavedGardens(mapped);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenContent>
          <TopNavPill
            title="Opgeslagen tuinen"
            onBackPress={() => router.back()}
          />

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
              <H1 color="$text_dark" fontWeight="bold" textAlign="center" fontSize="$5">
                Geen opgeslagen tuinen
              </H1>
              <Text color="$secondary" fontSize="$3" textAlign="center">
                Ontdek tuinen en sla je favorieten op voor later.
              </Text>
              <Button
                label="Tuinen ontdekken"
                backgroundColor="$background"
                color="$white"
                onPress={() => router.push("/search")}
              />
            </YStack>
          ) : (
            <YStack gap="$4">
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
                      garden.image_url
                        ? { uri: garden.image_url }
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
                          {garden.rating?.toFixed(1) ?? "N/A"}
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
                      <Text
                        fontSize="$2"
                        color="$secondary"
                        numberOfLines={2}
                      >
                        {garden.description}
                      </Text>
                    )}
                  </YStack>
                </Card>
              ))}
            </YStack>
          )}
        </ScreenContent>
      </ScrollView>

      <BottomNav
        activeTab="profile"
        onMessagePress={() => router.push("/messages" as any)}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
