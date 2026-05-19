import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image as ExpoImage } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { Card, H1, H2, Spinner, Text, XStack, YStack } from "tamagui";
import { supabase } from "@/utils/supabase";

interface Garden {
  id: string;
  name: string;
  rating: number;
  location: string;
  description: string;
  image_url: string;
}

const fallbackGardens: Record<string, Garden> = {
  "1": {
    id: "1",
    name: "Victor's tuin",
    rating: 4.8,
    location: "Heverlee, België",
    description: "Een heerlijk ruime tuin met een overvloed aan bloemen, fruitbomen en een gezellige zithoek. Perfect om rustig te tuinieren en te genieten van het groen.",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
  },
  "2": {
    id: "2",
    name: "Griet's bloemenweide",
    rating: 4.7,
    location: "Leuven, België",
    description: "Een kleurrijke en open bloemenweide. Ideaal voor natuurliefhebbers en rustzoekers.",
    image_url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae",
  },
  "3": {
    id: "3",
    name: "Groen Domein",
    rating: 4.9,
    location: "Kessel-Lo, België",
    description: "Groot groen domein met een prachtige vijver, moestuin en een serre.",
    image_url: "https://images.unsplash.com/photo-1584479898061-15742e14f50d",
  },
};

export default function GardenDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [garden, setGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGarden() {
      try {
        const { data, error } = await supabase
          .from("gardens")
          .select("*")
          .eq("id", id)
          .single();

        if (data && !error) {
          setGarden({
            id: data.id,
            name: data.name,
            rating: data.rating ?? 0,
            location: data.location ?? "Onbekende locatie",
            description: data.description ?? "",
            image_url: data.image_url ?? "",
          });
        } else {
          const fallback = fallbackGardens[id as string];
          if (fallback) setGarden(fallback);
        }
      } catch {
        const fallback = fallbackGardens[id as string];
        if (fallback) setGarden(fallback);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchGarden();
  }, [id]);

  if (loading) {
    return (
      <ThemedSafeArea>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$primary" />
        </YStack>
      </ThemedSafeArea>
    );
  }

  if (!garden) {
    return (
      <ThemedSafeArea>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Text fontSize="$5" color="$text_dark">Tuin niet gevonden</Text>
          <Button
            label="Terug"
            backgroundColor="$background"
            color="$white"
            onPress={() => router.back()}
          />
        </YStack>
      </ThemedSafeArea>
    );
  }

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
          
          {/* Back Button */}
          <TopNavPill title="Terug naar overzicht" />

          {/* Glassmorphic Header Card */}
          <YStack
            position="relative"
            backgroundColor="rgba(255, 255, 255, 0.4)"
            borderRadius="$10"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.45)"
            padding="$4"
            gap="$3"
            overflow="hidden"
            shadowColor="#0f1a0f"
            shadowOpacity={0.08}
            shadowRadius={16}
            shadowOffset={{ width: 0, height: 4 }}
            elevation={4}
          >
            <BlurView
              intensity={45}
              tint="light"
              experimentalBlurMethod="dimezisBlurView"
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />
            
            <H1 color="$text_dark" fontWeight="bold">
              {garden.name}
            </H1>

            <XStack justifyContent="space-between" alignItems="center">
              <XStack gap="$2" alignItems="center">
                <MaterialCommunityIcons name="map-marker" size={18} color="$primary" />
                <Text color="$text_dark" fontSize="$3" fontWeight="500">
                  {garden.location}
                </Text>
              </XStack>
              <XStack gap="$1" alignItems="center">
                <MaterialCommunityIcons name="star" size={18} color="#FFB800" />
                <Text color="$text_dark" fontSize="$3" fontWeight="bold">
                  {garden.rating}
                </Text>
              </XStack>
            </XStack>
          </YStack>

          {/* Image Frame */}
          <Card
            elevation={2}
            backgroundColor="$canvas"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$6"
            overflow="hidden"
            height={250}
          >
            {garden.image_url ? (
              <ExpoImage
                source={{ uri: garden.image_url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background_secondary">
                <Ionicons name="image-outline" size={48} color="$text_light" />
              </YStack>
            )}
          </Card>

          {/* About section */}
          <YStack gap="$3">
            <H2 color="$text_dark" fontWeight="bold">
              Over deze tuin
            </H2>
            <Text color="$text_dark" fontSize="$3" lineHeight="$4">
              {garden.description}
            </Text>
          </YStack>

          {/* CTA Banner */}
          <Card
            elevation={2}
            backgroundColor="$background_secondary"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$6"
            padding="$5"
            gap="$3"
          >
            <Text fontSize="$4" color="$primary" fontWeight="bold">
              Interesse in deze tuin?
            </Text>
            <Text fontSize="$3" color="$text_dark">
              Stuur een aanvraag om contact op te nemen met de tuineigenaar.
            </Text>
            <Button
              label="Verstuur aanvraag"
              backgroundColor="$background"
              color="$white"
              onPress={() => router.push(`/garden/${id}/request` as any)}
            />
          </Card>

        </YStack>
      </ScrollView>
    </ThemedSafeArea>
  );
}
