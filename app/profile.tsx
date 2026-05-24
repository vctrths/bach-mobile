import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Card, Circle, H1, Spinner, Text, XStack, YStack } from "tamagui";
import { Image as ExpoImage } from "@/lib/image";
import { OnboardingContext } from "@/context/OnboardingContext";

export default function ProfileScreen() {
  const { data } = useContext(OnboardingContext);
  const [profile, setProfile] = useState<{
    first_name: string;
    last_name: string;
    description: string;
    role: string;
    profile_image: string | null;
  } | null>(null);
  const [savedGardens, setSavedGardens] = useState<
    {
      id: string;
      name: string;
      rating: number | null;
      location: string | null;
      image_url: string | null;
    }[]
  >([]);
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
        .select("first_name, last_name, description, role, profile_image")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Fetch real saved gardens
      const { data: savedData } = await supabase
        .from("saved_gardens")
        .select("garden_id, gardens(id, name, rating, location, image_url)")
        .eq("user_id", user.id);

      const mapped =
        savedData?.map((row: any) => ({
          id: row.garden_id,
          name: row.gardens?.name ?? "Onbekende tuin",
          rating: row.gardens?.rating ?? null,
          location: row.gardens?.location ?? null,
          image_url: row.gardens?.image_url ?? null,
        })) ?? [];

      setSavedGardens(mapped);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const ctxName = `${data.firstName} ${data.lastName}`.trim();
  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim() || ctxName
    : ctxName || "Victor Thys";

  const displayRole = profile?.role || "Tuinzoeker";

  const bioText =
    profile?.description ||
    data.description ||
    "Ik woon in hartje Leuven en heb altijd gedroomd van een eigen tuin. Helaas heb ik zelf geen groene vingers of buitenruimte. Daarom ben ik op zoek naar een plek waar ik mijn passie voor planten en bloemen kan uitleven. Ik ben enthousiast, betrouwbaar en leergierig. Samen maken we er een bloeiend paradijs van!";

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingBottom={120}>
          {/* Header Section with Hero Image */}
          <YStack position="relative" height={190} overflow="hidden">
            <ExpoImage
              source={require("@/assets/images/hero.png")}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />

            {/* Glassmorphic "Account" container overlay */}
            <YStack
              position="absolute"
              top={20}
              left={20}
              right={20}
            >
              <TopNavPill
                title="Account"
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
              />
            </YStack>
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
                    profile?.profile_image
                      ? { uri: profile.profile_image }
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
                            garden.image_url
                              ? { uri: garden.image_url }
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
                                {garden.rating?.toFixed(1) ?? "N/A"}
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
          </YStack>
        </YStack>
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNav
        activeTab="profile"
        onHomePress={() => router.push("/dashboard")}
        onMessagePress={() => router.push("/messages" as any)}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
