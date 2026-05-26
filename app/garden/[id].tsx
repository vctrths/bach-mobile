import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import ApplianceBadges from "@/components/ui/ApplianceBadges";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image as ExpoImage } from "@/lib/image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Card, H1, H2, Spinner, Text, XStack, YStack, Circle } from "tamagui";
import { supabase } from "@/utils/supabase";
import { type Garden, type Review } from "@/types/garden";

export default function GardenDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [garden, setGarden] = useState<Garden | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [gardenRes, reviewsRes] = await Promise.all([
          supabase
            .from("gardens")
            .select("*")
            .eq("id", id as string)
            .single(),
          supabase
            .from("reviews")
            .select("*, profiles:reviewer_id(first_name, last_name, profile_image)")
            .eq("target_id", id as string)
            .eq("target_type", "garden")
            .order("created_at", { ascending: false })
        ]);

        if (gardenRes.data) {
          setGarden(gardenRes.data as Garden);
        }
        if (reviewsRes.data) {
          setReviews(reviewsRes.data as any[]);
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
                {garden.rating ?? 0}
              </Text>
            </XStack>
          </XStack>
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
          {garden.image_url ? (
            <ExpoImage
              source={{ uri: garden.image_url }}
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

        {/* Reviews Section */}
        <YStack gap="$4" paddingBottom="$10">
          <XStack justifyContent="space-between" alignItems="center">
            <H2 color="$text_dark" fontWeight="bold">Beoordelingen</H2>
            <XStack gap="$1" alignItems="center">
              <MaterialCommunityIcons name="star" size={20} color="#FFB800" />
              <Text fontSize="$4" fontWeight="bold">{garden.rating ?? 0}</Text>
              <Text color="$secondary" fontSize="$3">({reviews.length})</Text>
            </XStack>
          </XStack>

          {reviews.length === 0 ? (
            <YStack
              padding="$6"
              backgroundColor="$background_secondary"
              borderRadius="$6"
              alignItems="center"
              gap="$2"
            >
              <Ionicons name="chatbubble-outline" size={32} color="$text_light" />
              <Text color="$secondary">Nog geen beoordelingen</Text>
            </YStack>
          ) : (
            reviews.map((review) => (
              <Card
                key={review.id}
                padding="$4"
                backgroundColor="white"
                borderRadius="$6"
                borderWidth={1}
                borderColor="$borderColor"
                gap="$2"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$2" alignItems="center">
                    <Circle size={32} overflow="hidden" backgroundColor="$background_secondary">
                      {review.profiles?.profile_image ? (
                        <ExpoImage
                          source={{ uri: review.profiles.profile_image }}
                          style={{ width: "100%", height: "100%" }}
                        />
                      ) : (
                        <Ionicons name="person" size={16} color="$text_light" />
                      )}
                    </Circle>
                    <Text fontWeight="bold" fontSize="$3">
                      {review.profiles?.first_name} {review.profiles?.last_name}
                    </Text>
                  </XStack>
                  <XStack gap="$1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <MaterialCommunityIcons
                        key={s}
                        name="star"
                        size={14}
                        color={s <= review.rating ? "#FFB800" : "#E3ECD7"}
                      />
                    ))}
                  </XStack>
                </XStack>
                {review.comment && (
                  <Text color="$text_dark" fontSize="$3" lineHeight="$4">
                    {review.comment}
                  </Text>
                )}
                <Text color="$secondary" fontSize="$1">
                  {new Date(review.created_at).toLocaleDateString('nl-BE')}
                </Text>
              </Card>
            ))
          )}
        </YStack>
      </YStack>
    </PageContainer>
  );
}