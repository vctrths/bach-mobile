import { useAuth } from "@/context/AuthContext";
import { pages } from "@/types/app";
import { UserRole } from "@/utils/role";
import { supabase } from "@/utils/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Circle, XStack } from "tamagui";

interface BottomNavProps {
  activeTab?: pages;
  shortcut?: BottomNavShortcut;
  onHomePress?: () => void;
  onMapPress?: () => void;
  onTodoPress?: () => void;
  onCreateGardenPress?: () => void;
  onMessagePress?: () => void;
  onProfilePress?: () => void;
  unreadMessageCount?: number;
}

export type BottomNavShortcut = "map" | "todo" | "createGarden";

type NavItem = {
  key: pages;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: number;
};

export default function BottomNav({
  activeTab = "home",
  shortcut = "map",
  onHomePress,
  onMapPress,
  onTodoPress,
  onCreateGardenPress,
  onMessagePress,
  onProfilePress,
  unreadMessageCount = 0,
}: BottomNavProps) {
  const { profile, user } = useAuth();
  const accountRole = profile?.role?.toLowerCase();
  const [hasActiveGardenerConnection, setHasActiveGardenerConnection] =
    useState(false);

  useEffect(() => {
    let active = true;

    const checkActiveGardenerConnection = async () => {
      if (!user?.id || accountRole !== UserRole.TUIN_ZOEKER) {
        setHasActiveGardenerConnection(false);
        return;
      }

      const { data, error } = await supabase
        .from("collaborations")
        .select("id")
        .eq("gardener_id", user.id)
        .eq("status", "active")
        .limit(1);

      if (!active) return;

      setHasActiveGardenerConnection(!error && (data?.length ?? 0) > 0);
    };

    checkActiveGardenerConnection();

    return () => {
      active = false;
    };
  }, [accountRole, user?.id]);

  const effectiveShortcut =
    accountRole === UserRole.TUIN_EIGENAAR
      ? "createGarden"
      : accountRole === UserRole.TUIN_ZOEKER_MET_TUIN ||
          hasActiveGardenerConnection
        ? "todo"
        : shortcut;

  const defaultHomePress = () => router.push("/");
  const defaultMapPress = () => router.push("/map" as any);
  const defaultTodoPress = () => router.push("/logbook/opvolgingen" as any);
  const defaultCreateGardenPress = () => router.push("/garden/create" as any);
  const defaultMessagePress = () => router.push("/messages" as any);
  const defaultProfilePress = () => router.push("/profile");

  const shortcutItem: NavItem =
    effectiveShortcut === "todo"
      ? {
          key: "todo",
          icon: "checkbox-marked-circle-outline",
          label: "Opvolgingen",
          onPress: onTodoPress || defaultTodoPress,
        }
      : effectiveShortcut === "createGarden"
        ? {
            key: "createGarden",
            icon: "plus",
            label: "Tuin toevoegen",
            onPress: onCreateGardenPress || defaultCreateGardenPress,
          }
      : {
          key: "map",
          icon: "map-marker-outline",
          label: "Kaart",
          onPress: onMapPress || defaultMapPress,
        };

  const navItems: NavItem[] = [
    {
      key: "home",
      icon: "home",
      label: "Home",
      onPress: onHomePress || defaultHomePress,
    },
    shortcutItem,
    {
      key: "message",
      icon: "message-text-outline",
      label: "Messages",
      onPress: onMessagePress || defaultMessagePress,
      badge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
    },
    {
      key: "profile",
      icon: "account",
      label: "Profile",
      onPress: onProfilePress || defaultProfilePress,
    },
  ];

  return (
    <XStack
      position="absolute"
      bottom={20}
      left={20}
      right={20}
      borderRadius="$12"
      padding={1}
      backgroundColor="rgba(255, 255, 255, 0.34)"
      overflow="hidden"
      boxShadow="0px 12px 22px rgba(15, 26, 15, 0.18)"
      alignItems="center"
    >
      <XStack
        flex={1}
        borderRadius={49}
        overflow="hidden"
        backgroundColor="rgba(255, 255, 255, 0.12)"
      >
        <XStack position="absolute" top={0} right={0} bottom={0} left={0}>
          <BlurView
            intensity={55}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={{ flex: 1 }}
          />
        </XStack>

        <XStack
          flex={1}
          paddingHorizontal="$3"
          paddingVertical="$3"
          justifyContent="space-around"
          alignItems="center"
        >
          {navItems.map((item) => (
            <XStack
              key={item.key}
              position="relative"
              justifyContent="center"
              alignItems="center"
            >
              <Circle
                size={46}
                backgroundColor="rgba(255, 255, 255, 0.92)"
                borderWidth={1}
                borderColor="rgba(255, 255, 255, 0.6)"
                justifyContent="center"
                alignItems="center"
                onPress={item.onPress || (() => {})}
                pressStyle={{ scale: 0.94, opacity: 0.85 }}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={24}
                  color={
                    activeTab === item.key
                      ? "$primary"
                      : "rgba(23, 51, 0, 0.45)"
                  }
                />
              </Circle>
              {item.badge && (
                <Circle
                  size={16}
                  backgroundColor="#E74C3C"
                  position="absolute"
                  top={-2}
                  right={-2}
                />
              )}
            </XStack>
          ))}
        </XStack>
      </XStack>
    </XStack>
  );
}
