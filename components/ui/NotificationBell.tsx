import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Circle, Text, XStack } from "tamagui";

let nextNotificationChannelId = 0;

export default function NotificationBell({ unreadCount }: { unreadCount?: number }) {
  const { user } = useAuth();
  const [fetchedUnreadCount, setFetchedUnreadCount] = useState(0);
  const shouldFetchUnreadCount = unreadCount === undefined;

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id || !shouldFetchUnreadCount) {
      setFetchedUnreadCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      console.error("Error fetching notification count:", error.message);
      return;
    }

    setFetchedUnreadCount(count ?? 0);
  }, [shouldFetchUnreadCount, user?.id]);

  useEffect(() => {
    if (!user?.id || !shouldFetchUnreadCount) {
      setFetchedUnreadCount(0);
      return;
    }

    fetchUnreadCount();

    const channel = supabase.channel(
      `notification-count:${user.id}:${nextNotificationChannelId++}`,
    );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      },
      () => {
        fetchUnreadCount();
      },
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUnreadCount, shouldFetchUnreadCount, user?.id]);

  const visibleUnreadCount = unreadCount ?? fetchedUnreadCount;
  const badgeLabel = visibleUnreadCount > 99 ? "99+" : String(visibleUnreadCount);

  return (
    <XStack position="relative" justifyContent="center" alignItems="center">
      <Circle
        size={44}
        backgroundColor="white"
        borderWidth={1}
        borderColor="rgba(0, 0, 0, 0.04)"
        justifyContent="center"
        alignItems="center"
        boxShadow="0px 2px 6px rgba(0, 0, 0, 0.05)"
        onPress={() => router.push("/notifications")}
        pressStyle={{ scale: 0.94, opacity: 0.85 }}
      >
        <Ionicons name="notifications-outline" size={24} color="#172211" />
      </Circle>
      {visibleUnreadCount > 0 && (
        <XStack
          minWidth={18}
          height={18}
          paddingHorizontal={4}
          borderRadius={9}
          backgroundColor="#E74C3C"
          position="absolute"
          top={-4}
          right={-4}
          justifyContent="center"
          alignItems="center"
          borderWidth={1}
          borderColor="white"
        >
          <Text
            color="white"
            fontSize={10}
            lineHeight={12}
            fontWeight="700"
          >
            {badgeLabel}
          </Text>
        </XStack>
      )}
    </XStack>
  );
}
