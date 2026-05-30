import { Image as ExpoImage } from "@/lib/image";
import { type Garden } from "@/types/garden";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text, XStack, YStack } from "tamagui";
import Button from "./Button";
import { APPLIANCE_MAP } from "./ApplianceBadges";

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
  const firstApplianceKey = garden.appliances?.find((appliance) => APPLIANCE_MAP[appliance]);
  const amenityBadge = firstApplianceKey ? APPLIANCE_MAP[firstApplianceKey] : APPLIANCE_MAP.water;

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
      <YStack
        aspectRatio={4096 / 2731}
        borderRadius={8}
        overflow="hidden"
        position="relative"
        width="100%"
      >
        <ExpoImage
          source={imageSource as any}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
      </YStack>

      <YStack gap={4}>
        <XStack alignItems="center" justifyContent="space-between" gap={8}>
          <Text
            flex={1}
            minWidth={0}
            fontSize={14}
            lineHeight={14}
            color="#000000"
            fontWeight="400"
          >
            {garden.name}
          </Text>

          <XStack alignItems="center" gap={4} flexShrink={0}>
            <MaterialCommunityIcons name="star" size={14} color="#D0A500" />
            <Text fontSize={14} lineHeight={14} color="#000000" fontWeight="400">
              {garden.owner?.rating ? garden.owner.rating.toFixed(1) : "Nieuw"}
            </Text>
          </XStack>
        </XStack>

        <XStack alignItems="center" justifyContent="space-between" gap={8}>
          <XStack alignItems="center" gap={4} flex={1} minWidth={0}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#173300" />
            <Text
              flex={1}
              minWidth={0}
              fontSize={14}
              lineHeight={14}
              color="#000000"
              fontWeight="400"
              numberOfLines={1}
            >
              {garden.location ?? "Onbekend"}
            </Text>
          </XStack>

          <Card
            width={20}
            height={20}
            borderRadius={999}
            backgroundColor="#173300"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <MaterialCommunityIcons
              name={amenityBadge.icon}
              size={12}
              color="#F0F3EC"
            />
          </Card>
        </XStack>

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
            <MaterialCommunityIcons
              name="heart-outline"
              size={20}
              color="#FAFAFA"
            />
          </Card>
        </XStack>
      </YStack>
    </Card>
  );
}
