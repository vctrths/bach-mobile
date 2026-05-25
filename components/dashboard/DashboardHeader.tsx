import NotificationBell from "@/components/ui/NotificationBell";
import SearchBar from "@/components/ui/SearchBar";
import TopNavPill from "@/components/ui/TopNavPill";
import { Image as ExpoImage } from "@/lib/image";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { ReactNode } from "react";
import { Circle, Text, XStack, YStack } from "tamagui";

interface DashboardHeaderProps {
  title?: string;
  location?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
  children?: ReactNode;
}

export default function DashboardHeader({
  title = "Groene Vingers",
  location,
  searchPlaceholder = "Zoeken naar een tuin",
  searchValue,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  children,
}: DashboardHeaderProps) {
  const { profile } = useAuth();

  const titleElement = location ? (
    <YStack>
      <Text fontSize={12} color="$text_dark" fontWeight="700">
        {title}
      </Text>
      <XStack alignItems="center" gap="$1">
        <Ionicons name="location-sharp" size={17} color="$primary" />
        <Text fontSize={18} color="$text_dark" fontWeight="900">
          {location}
        </Text>
        <Ionicons name="chevron-down" size={16} color="$primary" />
      </XStack>
    </YStack>
  ) : (
    <XStack alignItems="center" gap="$2">
      <Ionicons name="location" size={20} color="$primary" />
      <Text color="$text_dark" fontWeight="600">
        {title}
      </Text>
    </XStack>
  );

  const rightEl = (
    <XStack gap="$3" alignItems="center">
      <NotificationBell />
      {profile?.profile_image ? (
        <Circle
          size={50}
          onPress={() => router.push("/profile")}
          overflow="hidden"
        >
          <ExpoImage
            source={{ uri: profile.profile_image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </Circle>
      ) : (
        <Ionicons
          name="person-circle"
          size={50}
          color="$borderColor"
          onPress={() => router.push("/profile")}
          suppressHighlighting
        />
      )}
    </XStack>
  );

  const searchBar = children ?? (
    <SearchBar
      active
      value={searchValue ?? ""}
      onChangeText={onSearchChange ?? (() => {})}
      onFocus={onSearchFocus}
      onBlur={onSearchBlur}
      placeholder={searchPlaceholder}
    />
  );

  return (
    <TopNavPill
      title={titleElement}
      rightElement={rightEl}
      hideBack
    >
      {searchBar}
    </TopNavPill>
  );
}
