import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Circle, XStack } from "tamagui";

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
  const navItems = [
    { key: "home", icon: "home", label: "Home", onPress: onHomePress },
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
      backgroundColor="rgba(255, 255, 255, 0.2)"
      borderRadius="$6"
      borderWidth={2}
      borderColor="rgba(217, 217, 217, 0.4)"
      paddingHorizontal="$6"
      paddingVertical="$3"
      justifyContent="space-around"
      alignItems="center"
    >
      {navItems.map((item) => (
        <Circle
          key={item.key}
          size={40}
          backgroundColor="white"
          justifyContent="center"
          alignItems="center"
          onPress={item.onPress || (() => {})}
          pressStyle={{ scale: 0.95, opacity: 0.8 }}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={24}
            color="$primary"
          />
        </Circle>
      ))}
    </XStack>
  );
}
