import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
import { Circle, XStack } from "tamagui";
import { useAuth } from "@/context/AuthContext";
import { getHomeRoute } from "@/utils/role-routing";

interface BottomNavProps {
  activeTab?: "home" | "message" | "profile";
  onHomePress?: () => void;
  onMessagePress?: () => void;
  onProfilePress?: () => void;
}

export default function BottomNav({
  activeTab = "home",
  onHomePress,
  onMessagePress,
  onProfilePress,
}: BottomNavProps) {
  const { profile } = useAuth();

  const defaultHomePress = () =>
    router.push(getHomeRoute(profile?.role) as any);

  const navItems = [
    {
      key: "home",
      icon: "home",
      label: "Home",
      onPress: onHomePress || defaultHomePress,
    },
    {
      key: "message",
      icon: "message",
      label: "Messages",
      onPress: onMessagePress,
    },
    {
      key: "profile",
      icon: "account",
      label: "Profile",
      onPress: onProfilePress,
    },
  ];

  return (
    <XStack
      position="absolute"
      bottom={20}
      left={20}
      right={20}
      backgroundColor="rgba(255, 255, 255, 0.12)"
      borderRadius="$12"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.34)"
      overflow="hidden"
      shadowColor="#0f1a0f"
      shadowOpacity={0.18}
      shadowRadius={22}
      shadowOffset={{ width: 0, height: 12 }}
      elevation={12}
      alignItems="center"
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
          <Circle
            key={item.key}
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
              color={activeTab === item.key ? "$primary" : "rgba(23, 51, 0, 0.45)"}
            />
          </Circle>
        ))}
      </XStack>
    </XStack>
  );
}
