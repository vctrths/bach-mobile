import GardenerView from "@/components/dashboard/GardenerView";
import OwnerView from "@/components/dashboard/OwnerView";
import SeekerView from "@/components/dashboard/SeekerView";
import NotificationBell from "@/components/ui/NotificationBell";
import PageContainer from "@/components/ui/PageContainer";
import SearchBar from "@/components/ui/SearchBar";
import { useAuth } from "@/context/AuthContext";
import { OnboardingContext } from "@/context/OnboardingContext";
import { Image as ExpoImage } from "@/lib/image";
import { type Garden } from "@/types/garden";
import { UserRole } from "@/utils/role";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Circle, Spinner, Text, XStack, YStack } from "tamagui";

export default function Dashboard() {
  const { profile, loading, session, hasActiveGardenerConnection } = useAuth();
  const { data: onboardingData } = useContext(OnboardingContext);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/splash");
    }
  }, [loading, session]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Garden[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await supabase
        .from("gardens")
        .select(
          "id, name, location, image_url, appliances, owner:profiles!owner_id(rating)",
        )
        .or(
          `name.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`,
        )
        .limit(10);

      if (response.data) setSearchResults(toCamelCase<Garden[]>(response.data));
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const onSearchChange = (text: string) => {
    setSearchQuery(text);
    handleSearch(text);
  };

  if (loading) {
    return (
      <PageContainer showTopNav={false}>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Spinner size="large" color="$primary" />
          <Text color="$secondary" fontSize="$4">
            Laden...
          </Text>
        </YStack>
      </PageContainer>
    );
  }

  const baseRole = (profile?.role ?? onboardingData.role)?.toLowerCase() ?? null;
  const role =
    hasActiveGardenerConnection && baseRole !== UserRole.TUIN_EIGENAAR
      ? UserRole.TUIN_ZOEKER_MET_TUIN
      : baseRole;

  const showingSearch = !!(searchQuery.trim() || isSearchFocused);
  const isSeekerDashboard = role === UserRole.TUIN_ZOEKER || !role;

  return (
    <PageContainer
      showTopNav={true}
      topNavTitle={
        <XStack alignItems="center" gap="$2">
          <Text color="$text_dark" fontWeight="600">
            Groene Vingers
          </Text>
        </XStack>
      }
      rightElement={
        <XStack gap="$3" alignItems="center">
          <NotificationBell />
          {profile?.profileImage ? (
            <Circle
              size={50}
              onPress={() => router.push("/profile")}
              pressStyle={{ scale: 0.94, opacity: 0.85 }}
              overflow="hidden"
            >
              <ExpoImage
                source={{ uri: profile.profileImage }}
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
      }
      hideBack
      bottomNavShortcut={
        role === UserRole.TUIN_EIGENAAR
          ? "createGarden"
          : role === UserRole.TUIN_ZOEKER_MET_TUIN
            ? "todo"
            : "map"
      }
      topNavChildren={
        isSeekerDashboard ? (
          <SearchBar
            active
            value={searchQuery}
            onChangeText={onSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Zoeken naar een tuin"
          />
        ) : undefined
      }
    >
      {role === UserRole.TUIN_EIGENAAR && <OwnerView />}
      {role === UserRole.TUIN_ZOEKER_MET_TUIN && <GardenerView />}
      {isSeekerDashboard && (
        <SeekerView
          searchQuery={searchQuery}
          searchResults={searchResults}
          searchLoading={searchLoading}
          showingSearch={showingSearch}
        />
      )}
    </PageContainer>
  );
}
