import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useContext } from "react";
import { ScrollView } from "react-native";
import { Card, Circle, H1, Image, Text, XStack, YStack } from "tamagui";
import { OnboardingContext } from "@/context/OnboardingContext";

export default function ProfileScreen() {
  const { data } = useContext(OnboardingContext);
  const displayName =
    (data.firstName || data.lastName)
      ? `${data.firstName} ${data.lastName}`.trim()
      : "Victor Thys";
  const bioText =
    data.description ||
    "Ik woon in hartje Leuven en heb altijd gedroomd van een eigen tuin. Helaas heb ik zelf geen groene vingers of buitenruimte. Daarom ben ik op zoek naar een plek waar ik mijn passie voor planten en bloemen kan uitleven. Ik ben enthousiast, betrouwbaar en leergierig. Samen maken we er een bloeiend paradijs van!";

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingBottom={120}>
          {/* Header Section with Hero Image */}
          <YStack position="relative" height={190} overflow="hidden">
            <Image
              source={require("@/assets/images/hero.png")}
              width="100%"
              height="100%"
              resizeMode="cover"
            />

            {/* Glassmorphic "Account" container overlay */}
            <XStack
              position="absolute"
              top={20}
              left={20}
              right={20}
              backgroundColor="rgba(255, 255, 255, 0.45)"
              borderRadius="$10"
              borderWidth={1}
              borderColor="rgba(255, 255, 255, 0.55)"
              paddingHorizontal="$5"
              paddingVertical="$3.5"
              justifyContent="space-between"
              alignItems="center"
              overflow="hidden"
            >
              <BlurView
                intensity={45}
                tint="light"
                experimentalBlurMethod="dimezisBlurView"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <Text color="$text_dark" fontSize="$5" fontWeight="bold">
                Account
              </Text>
              <Ionicons
                name="settings-outline"
                size={24}
                color="#172211"
                onPress={() => router.push("/settings")}
              />
            </XStack>
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
                <Image
                  source={require("@/assets/images/hero.png")}
                  width="100%"
                  height="100%"
                  resizeMode="cover"
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
                  Tuinzoeker
                </Text>
              </YStack>

              {/* Right Column */}
              <YStack gap="$1.5" alignItems="flex-end">
                {/* Stars rating */}
                <XStack gap="$1" alignItems="center">
                  {[1, 2, 3, 4].map((s) => (
                    <Ionicons key={s} name="star" size={18} color="#172211" />
                  ))}
                  <Ionicons name="star" size={18} color="#D1D5DB" />
                </XStack>
                <Text color="$text_dark" fontSize="$6" fontWeight="bold">
                  Heverlee
                </Text>
                <Text color="$secondary" fontSize="$3" fontWeight="500">
                  3001
                </Text>
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

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
              >
                <XStack gap="$3">
                  {/* Plot Card 1 */}
                  <Card
                    elevate
                    backgroundColor="$background_secondary"
                    borderColor="$borderColor"
                    borderWidth={1}
                    borderRadius="$6"
                    padding="$3"
                    width={210}
                    gap="$2"
                  >
                    <Image
                      source={require("@/assets/images/hero.png")}
                      width="100%"
                      height={110}
                      borderRadius="$4"
                      resizeMode="cover"
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
                          {"Arno's tuin"}
                        </Text>
                        <XStack gap="$1" alignItems="center">
                          <Ionicons name="star" size={14} color="#FFB800" />
                          <Text
                            color="$text_dark"
                            fontSize="$2"
                            fontWeight="600"
                          >
                            4.8
                          </Text>
                        </XStack>
                      </XStack>
                      <Text color="$secondary" fontSize="$2">
                        Leuven, BE
                      </Text>
                    </YStack>
                  </Card>

                  {/* Plot Card 2 */}
                  <Card
                    elevate
                    backgroundColor="$background_secondary"
                    borderColor="$borderColor"
                    borderWidth={1}
                    borderRadius="$6"
                    padding="$3"
                    width={210}
                    gap="$2"
                  >
                    <Image
                      source={require("@/assets/images/hero.png")}
                      width="100%"
                      height={110}
                      borderRadius="$4"
                      resizeMode="cover"
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
                          {"Arthur's tuin"}
                        </Text>
                        <XStack gap="$1" alignItems="center">
                          <Ionicons name="star" size={14} color="#FFB800" />
                          <Text
                            color="$text_dark"
                            fontSize="$2"
                            fontWeight="600"
                          >
                            4.7
                          </Text>
                        </XStack>
                      </XStack>
                      <Text color="$secondary" fontSize="$2">
                        Heverlee, BE
                      </Text>
                    </YStack>
                  </Card>
                </XStack>
              </ScrollView>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNav
        activeTab="profile"
        onHomePress={() => router.push("/")}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
