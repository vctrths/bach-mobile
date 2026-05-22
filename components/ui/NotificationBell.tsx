import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Circle, XStack } from "tamagui";

export default function NotificationBell({ unreadCount = 0 }: { unreadCount?: number }) {
  return (
    <XStack position="relative" justifyContent="center" alignItems="center">
      <Circle
        size={44}
        backgroundColor="white"
        borderWidth={1}
        borderColor="rgba(0, 0, 0, 0.04)"
        justifyContent="center"
        alignItems="center"
        shadowColor="#000"
        shadowOpacity={0.05}
        shadowRadius={6}
        shadowOffset={{ width: 0, height: 2 }}
        onPress={() => router.push("/notifications")}
        pressStyle={{ scale: 0.94, opacity: 0.85 }}
      >
        <Ionicons name="notifications-outline" size={24} color="#172211" />
      </Circle>
      {unreadCount > 0 && (
        <Circle
          size={18}
          backgroundColor="#E74C3C"
          position="absolute"
          top={-2}
          right={-2}
          justifyContent="center"
          alignItems="center"
        >
          <Circle size={8} backgroundColor="white" />
        </Circle>
      )}
    </XStack>
  );
}
