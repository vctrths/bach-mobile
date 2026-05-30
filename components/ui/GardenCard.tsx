import { Image as ExpoImage } from "@/lib/image";
import { type Garden } from "@/types/garden";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet } from "react-native";
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
      gap={10}
      overflow="hidden"
      onPress={onPress}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
    >
      <YStack
        height={168}
        borderRadius={8}
        overflow="hidden"
        position="relative"
      >
        <ExpoImage
          source={imageSource as any}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />

        <YStack
          style={StyleSheet.absoluteFillObject}
          backgroundColor="rgba(0, 0, 0, 0.45)"
          padding={12}
          justifyContent="space-between"
        >
          <XStack justifyContent="flex-end">
            <XStack
              alignItems="center"
              gap={4}
              backgroundColor="rgba(0, 0, 0, 0.38)"
              borderRadius={999}
              paddingHorizontal={8}
              paddingVertical={4}
            >
              <MaterialCommunityIcons name="star" size={14} color="#FFF2B3" />
              <Text fontSize={12} fontWeight="700" color="#FFFFFF">
                {garden.owner?.rating ? garden.owner.rating.toFixed(1) : "Nieuw"}
              </Text>
            </XStack>
          </XStack>

          <YStack gap={4}>
            <Text
              fontSize={18}
              fontWeight="800"
              color="#FFFFFF"
              numberOfLines={2}
            >
              {garden.name}
            </Text>
            <XStack gap={4} alignItems="center">
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#F5FFF3"
              />
              <Text fontSize={13} color="#F5FFF3" numberOfLines={1}>
                {garden.location ?? "Onbekend"}
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </YStack>

      <YStack gap={6}>
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
