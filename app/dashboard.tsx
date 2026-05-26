import PageContainer from "@/components/ui/PageContainer";
import TopNavPill from "@/components/ui/TopNavPill";
import SearchBar from "@/components/ui/SearchBar";
import NotificationBell from "@/components/ui/NotificationBell";
import { useAuth } from "@/context/AuthContext";
import { OnboardingContext } from "@/context/OnboardingContext";
import { UserRole } from "@/utils/role";
import SeekerView from "@/components/dashboard/SeekerView";
import OwnerView from "@/components/dashboard/OwnerView";
import GardenerView from "@/components/dashboard/GardenerView";
import React, { useCallback, useContext, useState } from "react";
import { Circle, Spinner, Text, XStack, YStack } from "tamagui";
import { supabase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type Garden } from "@/types/garden";

export default function Dashboard() {
  const { profile, loading } = useAuth();
  const { data: onboardingData } = useContext(OnboardingContext);

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
      const { data } = await supabase
        .from("gardens")
        .select("id, name, rating, location, image_url, appliances")
        .or(`name.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10);

      if (data) setSearchResults(data as Garden[]);
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
          <Text color="$secondary" fontSize="$4">Laden...</Text>
        </YStack>
      </PageContainer>
    );
  }

  const role = (profile?.role ?? onboardingData.role)?.toLowerCase() ?? null;

  const showingSearch = !!(searchQuery.trim() || isSearchFocused);

  console.log("[Dashboard] render:", {
    loading,
    hasProfile: !!profile,
    dbRole: profile?.role,
    ctxRole: onboardingData.role,
    resolvedRole: role,
  });

  return (
    <>
      <TopNavPill
        title={
          <XStack alignItems="center" gap="$2">
            <Ionicons name="location" size={20} color="$primary" />
            <Text color="$text_dark" fontWeight="600">Groene Vingers</Text>
          </XStack>
        }
        rightElement={
          <XStack gap="$3" alignItems="center">
            <NotificationBell />
            {profile?.profile_image ? (
              <Circle size={50} onPress={() => router.push("/profile")} overflow="hidden">
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
        }
        hideBack
      >
        <SearchBar
          active
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Zoeken naar een tuin"
        />
      </TopNavPill>

      <PageContainer showTopNav={false}>
        {role === UserRole.TUIN_EIGENAAR && <OwnerView />}
        {role === UserRole.TUIN_ZOEKER_MET_TUIN && <GardenerView />}
        {(role === UserRole.TUIN_ZOEKER || !role) && (
          <SeekerView
            searchQuery={searchQuery}
            searchResults={searchResults}
            searchLoading={searchLoading}
            isSearchFocused={isSearchFocused}
            showingSearch={showingSearch}
            onSearchChange={onSearchChange}
            onSearchFocus={() => setIsSearchFocused(true)}
            onSearchBlur={() => setIsSearchFocused(false)}
          />
        )}
      </PageContainer>
    </>
  );
}
