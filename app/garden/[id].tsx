import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import { Card, H1, H2, Image, Text, XStack, YStack } from "tamagui";

const gardensList = [
  {
    id: "1",
    name: "Victor's tuin",
    rating: 4.8,
    location: "Heverlee, België",
    description: "Een heerlijk ruime tuin met een overvloed aan bloemen, fruitbomen en een gezellige zithoek. Perfect om rustig te tuinieren en te genieten van het groen.",
    image: require("@/assets/images/hero.png"),
  },
  {
    id: "2",
    name: "Griet's bloemenweide",
    rating: 4.7,
    location: "Leuven, België",
    description: "Een kleurrijke en open bloemenweide. Ideaal voor natuurliefhebbers en rustzoekers.",
    image: require("@/assets/images/hero.png"),
  },
  {
    id: "3",
    name: "Groen Domein",
    rating: 4.9,
    location: "Kessel-Lo, België",
    description: "Groot groen domein met een prachtige vijver, moestuin en een serre.",
    image: require("@/assets/images/hero.png"),
  },
];

export default function GardenDetailsScreen() {
  const { id } = useLocalSearchParams();

  const garden = gardensList.find((g) => g.id === id) || gardensList[0];

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
          
          {/* Back Button */}
          <XStack alignItems="center" gap="$2" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#172211" />
            <Text color="$text_dark" fontSize="$4" fontWeight="600">
              Terug naar overzicht
            </Text>
          </XStack>

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
              position="absolute"
              top={0}
              right={0}
              bottom={0}
              left={0}
              intensity={45}
              tint="light"
              experimentalBlurMethod="dimezisBlurView"
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
            elevate
            backgroundColor="$canvas"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$6"
            overflow="hidden"
            height={250}
          >
            <Image
              source={garden.image}
              width="100%"
              height="100%"
              resizeMode="cover"
            />
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
            elevate
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
              onPress={() => alert("Aanvraag succesvol verstuurd!")}
            />
          </Card>

        </YStack>
      </ScrollView>
    </ThemedSafeArea>
  );
}
