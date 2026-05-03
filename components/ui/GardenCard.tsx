import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Card, Image, Text, XStack, YStack } from "tamagui";
import Button from "./Button";

interface GardenCardProps {
  name: string;
  rating: number;
  location: string;
  image: any;
  onDetailsPress?: () => void;
  onFavoritePress?: () => void;
}

export default function GardenCard({
  name,
  rating,
  location,
  image,
  onDetailsPress,
  onFavoritePress,
}: GardenCardProps) {
  return (
    <Card
      elevate
      margin="$2"
      overflow="hidden"
      width={260}
      backgroundColor="$canvas"
      borderColor="$borderColor"
      borderWidth={1}
      padding="$2"
    >
      <Card.Header>
        <Image
          source={image}
          width="100%"
          height={150}
          borderRadius="$2"
          resizeMode="cover"
        />
      </Card.Header>

      <YStack padding="$3" gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$3" fontWeight="500" flex={1}>
            {name}
          </Text>
          <XStack gap="$1" alignItems="center">
            <MaterialCommunityIcons name="star" size={14} color="#FFB800" />
            <Text fontSize="$2">{rating}</Text>
          </XStack>
        </XStack>

        <XStack gap="$2" alignItems="center">
          <MaterialCommunityIcons
            name="map-marker"
            size={14}
            color="$primary"
          />
          <Text fontSize="$2" color="$text_dark">
            {location}
          </Text>
        </XStack>

        <XStack gap="$2" marginTop="$2">
          <Button
            label="Details"
            flex={1}
            backgroundColor="$background"
            color="$white"
            onPress={onDetailsPress || (() => {})}
            paddingVertical="$2"
          />
          <Card
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor="$background"
            padding="$2"
            onPress={onFavoritePress || (() => {})}
            justifyContent="center"
            alignItems="center"
          >
            <MaterialCommunityIcons name="heart" size={20} color="white" />
          </Card>
        </XStack>
      </YStack>
    </Card>
  );
}
