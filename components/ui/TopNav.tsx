import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, XStack, YStack } from "tamagui";

interface TopNavProps {
  location?: string;
  onLocationPress?: () => void;
  onSearchPress?: () => void;
  onProfilePress?: () => void;
}

export default function TopNav({
  location = "Leuven, BE",
  onLocationPress,
  onSearchPress,
  onProfilePress,
}: TopNavProps) {
  return (
    <YStack gap="$4">
      {/* Location and Profile */}
      <XStack justifyContent="space-between" alignItems="center">
        <YStack gap="$2">
          <Text fontSize="$3" fontWeight="600" color="$text_dark">
            Locatie
          </Text>
          <XStack gap="$2" alignItems="center" onPress={onLocationPress}>
            <MaterialCommunityIcons
              name="map-marker"
              size={18}
              color="$primary"
            />
            <Text fontSize="$5" fontWeight="bold" color="$text_dark">
              {location}
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
          onPress={onProfilePress}
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
        onPress={onSearchPress}
      >
        <MaterialCommunityIcons name="magnify" size={20} color="$text_dark" />
        <Text fontSize="$3" color="$text_dark" flex={1}>
          Zoeken naar een tuin
        </Text>
      </XStack>
    </YStack>
  );
}
