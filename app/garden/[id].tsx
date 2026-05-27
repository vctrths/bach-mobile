import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import ApplianceBadges from "@/components/ui/ApplianceBadges";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image as ExpoImage } from "@/lib/image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Card, H1, H2, Spinner, Text, XStack, YStack, Circle } from "tamagui";
import { supabase, toCamelCase } from "@/utils/supabase";
import { type Garden } from "@/types/garden";

export default function GardenDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [garden, setGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [gardenRes] = await Promise.all([
          supabase
            .from("gardens")
            .select("*, owner:profiles!owner_id(first_name, last_name, profile_image, description, rating)")
            .eq("id", id as string)
            .single()
        ]);

        if (gardenRes.data) {
          const gardenData = toCamelCase<Garden>(gardenRes.data);
          setGarden(gardenData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <PageContainer showBottomNav={false}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$primary" />
        </YStack>
      </PageContainer>
    );
  }

  if (!garden) {
    return (
      <PageContainer showBottomNav={false}>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Text fontSize="$5" color="$text_dark">
            Tuin niet gevonden
          </Text>
          <Button
            label="Terug"
            backgroundColor="$background"
            color="$white"
            onPress={() => router.back()}
          />
        </YStack>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      topNavTitle="Terug naar overzicht"
      activeTab="home"
      topNavHeight={76}
    >
      <YStack paddingHorizontal="$4" gap="$6">
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
              <MaterialCommunityIcons
                name="map-marker"
                size={18}
                color="$primary"
              />
              <Text color="$text_dark" fontSize="$3" fontWeight="500">
                {garden.location ?? "Onbekende locatie"}
              </Text>
            </XStack>
            <XStack gap="$1" alignItems="center">
              <MaterialCommunityIcons name="star" size={18} color="#FFB800" />
              <Text color="$text_dark" fontSize="$3" fontWeight="bold">
                {garden.owner?.rating ? garden.owner.rating.toFixed(1) : "Nieuw"}
              </Text>
            </XStack>
          </XStack>

          <ApplianceBadges appliances={garden.appliances} detailMode />
        </YStack>

        <Card
          elevation={2}
          backgroundColor="$canvas"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$6"
          overflow="hidden"
          height={250}
        >
          {garden.imageUrl ? (
            <ExpoImage
              source={{ uri: garden.imageUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <YStack
              flex={1}
              justifyContent="center"
              alignItems="center"
              backgroundColor="$background_secondary"
            >
              <Ionicons
                name="image-outline"
                size={48}
                color="$text_light"
              />
            </YStack>
          )}
        </Card>

        <YStack gap="$3">
          <H2 color="$text_dark" fontWeight="bold">
            Over deze tuin
          </H2>
          <Text color="$text_dark" fontSize="$3" lineHeight="$4">
            {garden.description ?? ""}
          </Text>
        </YStack>

        {garden.appliances && garden.appliances.length > 0 && (
          <YStack gap="$3">
            <H2 color="$text_dark" fontWeight="bold">
              Voorzieningen
            </H2>
            <ApplianceBadges appliances={garden.appliances} detailMode />
          </YStack>
        )}

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

        {/* Owner Card Section */}
        <YStack gap="$4" paddingBottom="$10">
          <H2 color="$text_dark" fontWeight="bold">Over de eigenaar</H2>
          <Card
            elevation={2}
            backgroundColor="$background_secondary"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$6"
            padding="$5"
            gap="$4"
          >
            <XStack gap="$4" alignItems="center">
              <Circle size={64} overflow="hidden" backgroundColor="$borderColor">
                {garden.owner?.profileImage ? (
                  <ExpoImage
                    source={{ uri: garden.owner.profileImage }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons name="person" size={32} color="$text_light" />
                )}
              </Circle>
              <YStack gap="$1">
                <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                  {garden.owner?.firstName} {garden.owner?.lastName}
                </Text>
                <XStack gap="$1" alignItems="center">
                  <MaterialCommunityIcons name="star" size={18} color="#FFB800" />
                  <Text fontWeight="bold" color="$text_dark">
                    {garden.owner?.rating ? garden.owner.rating.toFixed(1) : "Nieuw"}
                  </Text>
                </XStack>
              </YStack>
            </XStack>
            
            {garden.owner?.description && (
              <Text color="$text_dark" fontSize="$3" lineHeight="$4">
                {garden.owner.description}
              </Text>
            )}
            
            <Button
              label="Bekijk volledig profiel"
              variant="outlined"
              onPress={() => router.push(`/profile` as any)} // For now back to own profile or specific profile if implemented
              backgroundColor="transparent"
              borderColor="$primary"
              color="$primary"
            />
          </Card>
        </YStack>
      </YStack>
    </PageContainer>
  );
}