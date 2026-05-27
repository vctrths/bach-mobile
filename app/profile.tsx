import PageContainer from "@/components/ui/PageContainer";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Card, Circle, H1, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";
import { Image as ExpoImage } from "@/lib/image";
import { OnboardingContext } from "@/context/OnboardingContext";
import { Profile } from "@/context/AuthContext";
import { Garden, Review } from "@/types/garden";

export default function ProfileScreen() {
  const { data } = useContext(OnboardingContext);
  const [profile, setProfile] = useState<Profile & { rating?: number | null } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedGardens, setSavedGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, description, role, profile_image, rating")
        .eq("id", user.id)
        .single();

      if (profileData) setProfile(toCamelCase<Profile & { rating?: number | null }>(profileData));

      // Fetch reviews for this user
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*, profiles:reviewer_id(first_name, last_name, profile_image)")
        .eq("target_id", user.id)
        .eq("target_type", "user")
        .order("created_at", { ascending: false });
      
      if (reviewData) setReviews(toCamelCase<Review[]>(reviewData));

      // Fetch real saved gardens
      const { data: savedData } = await supabase
        .from("saved_gardens")
        .select("garden_id, gardens(id, name, location, image_url, owner:profiles!owner_id(rating))")
        .eq("user_id", user.id);

      const mapped =
        savedData?.map((row: any) => toCamelCase<Garden>({
          id: row.garden_id,
          name: row.gardens?.name ?? "Onbekende tuin",
          location: row.gardens?.location ?? null,
          image_url: row.gardens?.image_url ?? null,
          owner: row.gardens?.owner ?? null,
        })) ?? [];

      setSavedGardens(mapped);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const ctxName = `${data.firstName} ${data.lastName}`.trim();
  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim() || ctxName
    : ctxName || "Victor Thys";

  const displayRole = profile?.role || "Tuinzoeker";

  const bioText =
    profile?.description ||
    data.description ||
    "Ik woon in hartje Leuven en heb altijd gedroomd van een eigen tuin. Helaas heb ik zelf geen groene vingers of buitenruimte. Daarom ben ik op zoek naar een plek waar ik mijn passie voor planten en bloemen kan uitleven. Ik ben enthousiast, betrouwbaar en leergierig. Samen maken we er een bloeiend paradijs van!";

  return (
    <PageContainer
      topNavTitle="Account"
      hideBack
      rightElement={
        <Circle
          size={42}
          backgroundColor="white"
          borderWidth={1}
          borderColor="rgba(0, 0, 0, 0.05)"
          justifyContent="center"
          alignItems="center"
          onPress={() => router.push("/settings")}
          pressStyle={{ scale: 0.94, opacity: 0.85 }}
          shadowColor="#000"
          shadowOpacity={0.04}
          shadowRadius={4}
          shadowOffset={{ width: 0, height: 2 }}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color="#172211"
          />
        </Circle>
      }
      activeTab="profile"
    >
      {/* Header Section with Hero Image */}
      <YStack position="relative" height={190} overflow="hidden">
        <ExpoImage
          source={require("@/assets/images/hero.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      </YStack>

      {/* Profile Details (overlapped) */}
      <YStack paddingHorizontal="$5" marginTop={-55} gap="$4">
        {/* Avatar Circle with active status dot */}
        <YStack position="relative" width={110} height={110}>
          <Circle
            size={110}
            backgroundColor="$borderColor"
            overflow="hidden"
            borderWidth={4}
            borderColor="white"
            shadowColor="#000"
            shadowOpacity={0.1}
            shadowRadius={8}
            shadowOffset={{ width: 0, height: 4 }}
          >
            <ExpoImage
              source={
                profile?.profileImage
                  ? { uri: profile.profileImage }
                  : require("@/assets/images/hero.png")
              }
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </Circle>
          {/* Online status indicator */}
          <Circle
            size={22}
            backgroundColor="#C5E8A9"
            position="absolute"
            bottom={4}
            right={4}
            borderWidth={3}
            borderColor="white"
          />
        </YStack>

        {/* Profile Identity */}
        <XStack
          justifyContent="space-between"
          alignItems="flex-end"
          width="100%"
        >
          {/* Left Column */}
          <YStack gap="$1">
            <XStack alignItems="center" gap="$2">
              <H1 color="$text_dark" fontSize="$6" fontWeight="bold">
                {displayName}
              </H1>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#172211"
              />
            </XStack>
            <Text color="$secondary" fontSize="$3" fontWeight="500">
              {displayRole}
            </Text>
          </YStack>

          {/* Right Column */}
          <YStack gap="$1.5" alignItems="flex-end">
            <XStack gap="$1" alignItems="center" backgroundColor="rgba(255, 184, 0, 0.1)" paddingHorizontal="$3" paddingVertical="$1" borderRadius="$10" marginBottom="$2">
               <Ionicons name="star" size={16} color="#FFB800" />
               <Text fontWeight="bold" color="#172211">{profile?.rating ? profile.rating.toFixed(1) : "Nieuw"}</Text>
            </XStack>
            <Circle
              size={36}
              backgroundColor="white"
              borderWidth={1}
              borderColor="rgba(0, 0, 0, 0.05)"
              justifyContent="center"
              alignItems="center"
              onPress={() => router.push("/saved")}
              pressStyle={{ scale: 0.94, opacity: 0.85 }}
              shadowColor="#000"
              shadowOpacity={0.04}
              shadowRadius={4}
              shadowOffset={{ width: 0, height: 2 }}
            >
              <Ionicons name="bookmark-outline" size={20} color="#172211" />
            </Circle>
          </YStack>
        </XStack>

        {/* Bio text from Figma */}
        <Text
          color="$text_dark"
          fontSize="$3"
          lineHeight="$4"
          opacity={0.9}
          marginTop="$1"
        >
          {bioText}
        </Text>

        {/* Saved Plots Section ("Jouw opgeslagen percelen") */}
        <YStack gap="$3" marginTop="$2">
          <H1 color="$text_dark" fontSize="$5" fontWeight="bold">
            Jouw opgeslagen percelen
          </H1>

          {savedGardens.length === 0 ? (
            <YStack
              padding="$6"
              justifyContent="center"
              alignItems="center"
              gap="$2"
              backgroundColor="rgba(23, 51, 0, 0.03)"
              borderRadius="$4"
            >
              <Ionicons name="bookmark-outline" size={32} color="#57594D" />
              <Text color="$secondary" fontSize="$3" textAlign="center">
                Je hebt nog geen tuinen opgeslagen.
              </Text>
            </YStack>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
            >
              <XStack gap="$3">
                {savedGardens.map((garden) => (
                  <Card
                    key={garden.id}
                    elevation={2}
                    backgroundColor="white"
                    borderColor="rgba(23, 51, 0, 0.1)"
                    borderWidth={1}
                    borderRadius="$6"
                    padding="$3"
                    width={210}
                    gap="$2"
                    onPress={() =>
                      router.push(("/garden/" + garden.id) as any)
                    }
                    pressStyle={{ scale: 0.97, opacity: 0.9 }}
                  >
                    <ExpoImage
                      source={
                        garden.imageUrl
                          ? { uri: garden.imageUrl }
                          : require("@/assets/images/hero.png")
                      }
                      style={{ width: "100%", height: 110, borderRadius: 8 }}
                      contentFit="cover"
                    />
                    <YStack gap="$0.5">
                      <XStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text
                          color="$text_dark"
                          fontSize="$3"
                          fontWeight="bold"
                        >
                          {garden.name}
                        </Text>
                        <XStack gap="$1" alignItems="center">
                          <Ionicons
                            name="star"
                            size={14}
                            color="#FFB800"
                          />
                          <Text
                            color="$text_dark"
                            fontSize="$2"
                            fontWeight="600"
                          >
                            {garden.owner?.rating ? garden.owner.rating.toFixed(1) : "Nieuw"}
                          </Text>
                        </XStack>
                      </XStack>
                      <Text color="$secondary" fontSize="$2">
                        {garden.location || "Onbekende locatie"}
                      </Text>
                    </YStack>
                  </Card>
                ))}
              </XStack>
            </ScrollView>
          )}
        </YStack>

        {/* Reviews Section */}
        <YStack gap="$3" marginTop="$2" paddingBottom="$10">
          <H1 color="$text_dark" fontSize="$5" fontWeight="bold">
            Beoordelingen ({reviews.length})
          </H1>

          {reviews.length === 0 ? (
            <YStack
              padding="$6"
              justifyContent="center"
              alignItems="center"
              gap="$2"
              backgroundColor="rgba(23, 51, 0, 0.03)"
              borderRadius="$4"
            >
              <Ionicons name="chatbubble-outline" size={32} color="#57594D" />
              <Text color="$secondary" fontSize="$3" textAlign="center">
                Je hebt nog geen beoordelingen ontvangen.
              </Text>
            </YStack>
          ) : (
            reviews.map((review) => (
              <Card
                key={review.id}
                elevation={1}
                backgroundColor="white"
                borderColor="rgba(23, 51, 0, 0.1)"
                borderWidth={1}
                borderRadius="$4"
                padding="$4"
                gap="$2"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$2" alignItems="center">
                    <Circle size={24} overflow="hidden" backgroundColor="$borderColor">
                       {review.profiles?.profileImage ? (
                          <ExpoImage 
                            source={{ uri: review.profiles.profileImage }}
                            style={{ width: "100%", height: "100%" }}
                          />
                       ) : (
                          <Ionicons name="person" size={12} color="$text_light" />
                       )}
                    </Circle>
                    <Text fontWeight="bold" fontSize="$3">
                      {review.profiles?.firstName}
                    </Text>
                  </XStack>

                  <XStack gap="$0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons 
                        key={s} 
                        name="star" 
                        size={12} 
                        color={s <= review.rating ? "#FFB800" : "#E3ECD7"} 
                      />
                    ))}
                  </XStack>
                </XStack>
                {review.comment && (
                  <Text color="$text_dark" fontSize="$3">
                    {review.comment}
                  </Text>
                )}
                <Text color="$secondary" fontSize="$1">
                  {new Date(review.createdAt).toLocaleDateString('nl-BE')}
                </Text>
              </Card>
            ))
          )}
        </YStack>
      </YStack>
    </PageContainer>
  );
}
