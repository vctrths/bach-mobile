import GardenerView from "@/components/dashboard/GardenerView";
import OwnerView from "@/components/dashboard/OwnerView";
import SeekerView from "@/components/dashboard/SeekerView";
import NotificationBell from "@/components/ui/NotificationBell";
import PageContainer from "@/components/ui/PageContainer";
import { useAuth } from "@/context/AuthContext";
import { OnboardingContext } from "@/context/OnboardingContext";
import { Image as ExpoImage } from "@/lib/image";
import { type Garden } from "@/types/garden";
import { UserRole } from "@/utils/role";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { Circle, Spinner, Text, XStack, YStack } from "tamagui";

const DASHBOARD_CHECK_TIMEOUT_MS = 2500;

export default function Dashboard() {
  const { profile, loading, session } = useAuth();
  const { data: onboardingData } = useContext(OnboardingContext);
  const userId = session?.user?.id ?? null;
  const [hasActiveGardenerConnection, setHasActiveGardenerConnection] =
    useState(false);
  const [checkingGardenerConnection, setCheckingGardenerConnection] =
    useState(true);
  const showLoadingDebug =
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debugLoading");

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/splash");
    }
  }, [loading, session]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Garden[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    let active = true;
    let queryTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const checkGardenerConnection = async () => {
      if (loading) return;

      if (!userId) {
        setHasActiveGardenerConnection(false);
        setCheckingGardenerConnection(false);
        return;
      }

      const profileRole = profile?.role?.toLowerCase() ?? null;

      if (profileRole === UserRole.TUIN_EIGENAAR) {
        setHasActiveGardenerConnection(false);
        setCheckingGardenerConnection(false);
        return;
      }

      if (profileRole === UserRole.TUIN_ZOEKER_MET_TUIN) {
        setHasActiveGardenerConnection(true);
        setCheckingGardenerConnection(false);
        return;
      }

      setCheckingGardenerConnection(true);
      console.log("[Dashboard] checking active gardener connection:", {
        userId,
        profileRole,
      });

      let timedOut = false;
      queryTimeoutId = setTimeout(() => {
        timedOut = true;
        if (!active) return;

        console.warn(
          "[Dashboard] active gardener connection check timed out; showing dashboard fallback",
          { userId },
        );
        setHasActiveGardenerConnection(false);
        setCheckingGardenerConnection(false);
      }, DASHBOARD_CHECK_TIMEOUT_MS);

      const { data, error } = await supabase
        .from("collaborations")
        .select("id")
        .eq("gardener_id", userId)
        .eq("status", "active")
        .limit(1);

      if (!active) return;

      if (queryTimeoutId) {
        clearTimeout(queryTimeoutId);
        queryTimeoutId = null;
      }

      if (timedOut) {
        console.warn(
          "[Dashboard] active gardener connection check completed after timeout",
          { userId },
        );
      }

      if (error) {
        console.error("Error checking active gardener connection:", error);
        setHasActiveGardenerConnection(false);
      } else {
        setHasActiveGardenerConnection((data?.length ?? 0) > 0);
      }

      setCheckingGardenerConnection(false);
    };

    checkGardenerConnection();

    return () => {
      active = false;
      if (queryTimeoutId) {
        clearTimeout(queryTimeoutId);
      }
    };
  }, [loading, profile?.role, userId]);

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

  if (loading || checkingGardenerConnection) {
    const loadingSource = loading ? "auth.loading" : "checkingGardenerConnection";

    return (
      <PageContainer showTopNav={false}>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Spinner size="large" color="$primary" />
          <Text color="$secondary" fontSize="$4">
            Laden...
          </Text>
          {showLoadingDebug && (
            <Text color="$secondary" fontSize="$2">
              Debug: {loadingSource}
            </Text>
          )}
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

  console.log("[Dashboard] render:", {
    loading,
    hasProfile: !!profile,
    dbRole: profile?.role,
    ctxRole: onboardingData.role,
    hasActiveGardenerConnection,
    resolvedRole: role,
  });

  return (
    <PageContainer
      showTopNav={true}
      topNavTitle={
        <XStack alignItems="center" gap="$2">
          <Ionicons name="location" size={20} color="$primary" />
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
    >
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
  );
}
