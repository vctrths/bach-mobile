import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import GardenCard from "@/components/ui/GardenCard";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView } from "react-native";
import { router } from "expo-router";
import { Card, Circle, H2, Image, Text, XStack, YStack } from "tamagui";

// Sample data for recommended gardens
const recommendedGardens = [
  {
    id: 1,
    name: "Victor's tuin",
    rating: 4.8,
    location: "Heverlee",
    image: require("@/assets/images/hero.png"),
  },
  {
    id: 2,
    name: "Victor's tuin",
    rating: 4.8,
    location: "Heverlee",
    image: require("@/assets/images/hero.png"),
  },
  {
    id: 3,
    name: "Victor's tuin",
    rating: 4.8,
    location: "Heverlee",
    image: require("@/assets/images/hero.png"),
  },
];

// Sample data for garden logs
const gardenLogs = [
  {
    id: 1,
    title: "Planten water geven",
    status: ["completed", "pending"],
  },
  {
    id: 2,
    title: "Planten water geven",
    status: ["completed", "completed"],
  },
  {
    id: 3,
    title: "Planten water geven",
    status: ["completed", "completed"],
  },
];

function LogCard({ log }: { log: (typeof gardenLogs)[0] }) {
  return (
    <Card
      elevate
      margin="$2"
      overflow="hidden"
      width={220}
      height={140}
      backgroundColor="rgba(240, 243, 236, 0.8)"
      borderColor="$borderColor"
      borderWidth={1}
      justifyContent="space-between"
      padding="$3"
    >
      <YStack justifyContent="space-between" height="100%">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1}>
            <Text
              fontSize="$3"
              fontWeight="bold"
              color="$primary"
              numberOfLines={2}
            >
              {log.title}
            </Text>
          </YStack>
          <Ionicons name="checkmark-done" size={18} color="$primary" />
        </XStack>

        <XStack gap="$2">
          {log.status.map((status, index) => (
            <Circle
              key={index}
              size={14}
              backgroundColor={
                status === "completed"
                  ? "rgba(23, 51, 0, 0.8)"
                  : "rgba(200, 200, 200, 0.4)"
              }
            />
          ))}
        </XStack>
      </YStack>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <ThemedSafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$4" gap="$6">
          {/* Top Navigation */}
          <YStack gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap="$2">
                <Text fontSize="$3" fontWeight="600" color="$text_dark">
                  Locatie
                </Text>
                <XStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={18}
                    color="$primary"
                  />
                  <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                    Leuven, BE
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={18}
                    color="$text_dark"
                  />
                </XStack>
              </YStack>
              <Ionicons
                name="person-circle"
                size={50}
                color="$borderColor"
                onPress={() => router.push("/profile")}
                suppressHighlighting
              />
            </XStack>

            {/* Search Bar */}
            <XStack
              backgroundColor="white"
              borderRadius="$8"
              paddingHorizontal="$4"
              paddingVertical="$3"
              alignItems="center"
              gap="$2"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="$text_dark"
              />
              <Text fontSize="$3" color="$text_dark" flex={1}>
                Zoeken naar een tuin
              </Text>
            </XStack>
          </YStack>

          {/* Pro Upgrade Banner */}
          <Card
            elevate
            backgroundColor="#f0f3ec"
            borderColor="#e3ecd7"
            borderWidth={1}
            padding="$4"
            gap="$3"
          >
            <Text fontSize="$3" color="$primary">
              Om meer aanvragen te sturen heb je een pro account nodig
            </Text>
            <Button
              label="Probeer pro | €7 /maand"
              backgroundColor="$background"
              color="$white"
              onPress={() => router.push("/pro")}
            />
          </Card>

          {/* Recommended Gardens Section */}
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <H2 color="$text_dark" fontWeight="bold">
                Aanbevolen tuinen
              </H2>
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$text_dark"
                textDecorationLine="underline"
                onPress={() => router.push("/explore")}
              >
                meer info →
              </Text>
            </XStack>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
            >
              <XStack gap="$2" paddingHorizontal="$0">
                {recommendedGardens.map((garden) => (
                  <GardenCard
                    key={garden.id}
                    name={garden.name}
                    rating={garden.rating}
                    location={garden.location}
                    image={garden.image}
                    onDetailsPress={() => router.push(("/garden/" + garden.id) as any)}
                  />
                ))}
              </XStack>
            </ScrollView>
          </YStack>

          {/* Location-Based Section */}
          <YStack gap="$3">
            <H2 color="$text_dark" fontWeight="bold">
              op basis van locatie:
            </H2>
            <Card
              elevate
              backgroundColor="$canvas"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$6"
              overflow="hidden"
              height={200}
              position="relative"
            >
              <Image
                source={require("@/assets/images/hero.png")}
                width="100%"
                height="100%"
                resizeMode="cover"
              />
              <YStack
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                backgroundColor="rgba(23, 51, 0, 0.75)"
                paddingHorizontal="$4"
                paddingVertical="$3"
              >
                <Text color="white" fontWeight="bold" fontSize="$4">
                  Tuinen in jouw buurt
                </Text>
                <Text color="rgba(255, 255, 255, 0.8)" fontSize="$2">
                  Ontdek dichtstbijzijnde groene oases
                </Text>
              </YStack>
            </Card>
          </YStack>

          {/* Tuinlogboek Section */}
          <YStack gap="$3" paddingBottom="$20">
            <XStack justifyContent="space-between" alignItems="center">
              <H2 color="$text_dark" fontWeight="bold">
                Tuinlogboek
              </H2>
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$text_dark"
                textDecorationLine="underline"
                onPress={() => router.push("/logbook")}
              >
                meer info →
              </Text>
            </XStack>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
            >
              <XStack gap="$2" paddingHorizontal="$0">
                {gardenLogs.map((log) => (
                  <LogCard key={log.id} log={log} />
                ))}
              </XStack>
            </ScrollView>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="home"
        onHomePress={() => router.push("/")}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
