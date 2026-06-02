import { Image as ExpoImage } from "@/lib/image";
import { type Garden } from "@/types/garden";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text, XStack, YStack } from "tamagui";
import { APPLIANCE_MAP } from "./ApplianceBadges";

interface GardenListCardProps {
  garden: Garden;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

const FALLBACK_APPLIANCES = ["water", "tools"];

export default function GardenListCard({
  garden,
  onPress,
  onFavoritePress,
}: GardenListCardProps) {
  const imageSource = garden.imageUrl
    ? { uri: garden.imageUrl }
    : require("@/assets/images/garden-details/garden_image_1.png");

  const visibleAppliances = (
    garden.appliances?.length ? garden.appliances : FALLBACK_APPLIANCES
  ).filter((appliance) => APPLIANCE_MAP[appliance]);

  return (
    <Card
      backgroundColor="#F0F3EC"
      borderColor="#E3ECD7"
      borderWidth={1}
      borderRadius={20}
      overflow="hidden"
      padding={12}
      width="100%"
      onPress={onPress}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
    >
      <XStack gap={16} alignItems="center">
        <YStack
          width={133}
          height={133}
          borderRadius={10}
          overflow="hidden"
          backgroundColor="#D9D9D9"
          flexShrink={0}
        >
          <ExpoImage
            source={imageSource as any}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
        </YStack>

        <YStack flex={1} minWidth={0} gap={8}>
          <XStack alignItems="center" justifyContent="space-between" gap={8}>
            <Text
              flex={1}
              minWidth={0}
              fontSize={20}
              lineHeight={24}
              fontWeight="900"
              color="#172211"
              numberOfLines={1}
            >
              {garden.name}
            </Text>

            <MaterialCommunityIcons
              name="heart-outline"
              size={26}
              color="#172211"
              onPress={onFavoritePress}
              suppressHighlighting
            />
          </XStack>

          <Text
            minHeight={68}
            fontSize={14}
            lineHeight={17}
            fontWeight="400"
            color="#172211"
            numberOfLines={4}
          >
            {garden.description ||
              "Een rustige, groene tuin ideaal voor wie graag wil tuinieren en van de natuur wil genieten."}
          </Text>

          <XStack gap={4} alignItems="center">
            {visibleAppliances.map((key) => {
              const appliance = APPLIANCE_MAP[key];

              return (
                <Card
                  key={key}
                  width={25}
                  height={25}
                  borderRadius={999}
                  backgroundColor="#172211"
                  alignItems="center"
                  justifyContent="center"
                  overflow="hidden"
                  flexWrap="wrap"
                >
                  <MaterialCommunityIcons
                    name={appliance.icon}
                    size={14}
                    color="#F0F3EC"
                  />
                </Card>
              );
            })}
          </XStack>
        </YStack>
      </XStack>
    </Card>
  );
}
