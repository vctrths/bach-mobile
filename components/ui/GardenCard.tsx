import { Image as ExpoImage } from "@/lib/image";
import { type Garden } from "@/types/garden";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Card, Text, XStack, YStack } from "tamagui";
import Button from "./Button";
import ApplianceBadges from "./ApplianceBadges";

interface GardenCardProps {
  garden: Garden;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export default function GardenCard({
  garden,
  onPress,
  onFavoritePress,
}: GardenCardProps) {
  const imageSource = garden.imageUrl ? { uri: garden.imageUrl } : require("@/assets/images/hero.png");

  return (
    <Card
      width={276}
      backgroundColor="#F0F3EC"
      borderColor="#E3ECD7"
      borderWidth={1}
      borderRadius={16}
      padding={12}
      gap={6}
      overflow="hidden"
      onPress={onPress}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
    >
      <ExpoImage
        source={imageSource as any}
        style={{ width: "100%", height: 168, borderRadius: 8 }}
        contentFit="cover"
      />

      <YStack gap={4}>
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={14} fontWeight="400" color="#000000" flex={1}>
            {garden.name}
          </Text>
          <XStack gap={4} alignItems="center">
            <MaterialCommunityIcons name="star" size={16} color="#C9A52E" />
            <Text fontSize={14} fontWeight="400" color="#000000">
              {garden.owner?.rating ? garden.owner.rating.toFixed(1) : "Nieuw"}
            </Text>
          </XStack>
        </XStack>

        <XStack gap={4} alignItems="center">
          <MaterialCommunityIcons name="map-marker" size={16} color="#000000" />
          <Text fontSize={14} color="#000000">
            {garden.location ?? "Onbekend"}
          </Text>
        </XStack>

        <ApplianceBadges appliances={garden.appliances} />

        <XStack gap={6} marginTop={2}>
          <Button
            label="Details"
            flex={1}
            borderRadius={64}
            paddingVertical={8}
            paddingHorizontal={16}
            fontSize={16}
            fontWeight="700"
            onPress={onPress || (() => {})}
          />
          <Card
            borderRadius={24}
            backgroundColor="#173300"
            borderColor="#FAFAFA"
            borderWidth={1}
            padding={12}
            onPress={onFavoritePress || (() => {})}
            pressStyle={{ scale: 0.94, opacity: 0.85 }}
            justifyContent="center"
            alignItems="center"
          >
            <MaterialCommunityIcons name="heart" size={20} color="#FAFAFA" />
          </Card>
        </XStack>
      </YStack>
    </Card>
  );
}
