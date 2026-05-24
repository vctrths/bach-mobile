import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import ScreenContent from "@/components/ui/ScreenContent";
import { supabase } from "@/utils/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Card, Spinner, Text, XStack, YStack } from "tamagui";

const NOTIF_ICONS: Record<string, string> = {
  request_accepted: "check-circle-outline",
  request_rejected: "close-circle-outline",
  message: "message-text-outline",
  reminder: "calendar-clock-outline",
  system: "information-outline",
};

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m geleden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}u geleden`;
  const days = Math.floor(hours / 24);
  return `${days}d geleden`;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setNotifications(data || []);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenContent>
          <TopNavPill
            title="Meldingen"
            onBackPress={() => router.back()}
          />

          {loading ? (
            <YStack padding="$10" alignItems="center">
              <Spinner size="large" color="$primary" />
            </YStack>
          ) : notifications.length === 0 ? (
            <YStack
              padding="$10"
              alignItems="center"
              gap="$3"
            >
              <MaterialCommunityIcons name="bell-off-outline" size={48} color="#57594D" />
              <Text fontSize="$5" fontWeight="bold" color="$text_dark" textAlign="center">
                Geen meldingen
              </Text>
              <Text fontSize="$4" color="$secondary" textAlign="center">
                Je hebt momenteel geen meldingen.
              </Text>
            </YStack>
          ) : (
          <YStack gap="$4">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                elevation={2}
                backgroundColor={notif.read ? "white" : "rgba(227, 236, 215, 0.5)"}
                borderColor="rgba(23, 51, 0, 0.1)"
                borderWidth={1}
                borderRadius="$6"
                padding="$4"
                gap="$2"
                onPress={() => router.push("/messages" as any)}
                pressStyle={{ scale: 0.98, opacity: 0.9 }}
              >
                <XStack gap="$3" alignItems="flex-start">
                  <XStack
                    backgroundColor="rgba(23, 51, 0, 0.08)"
                    width={44}
                    height={44}
                    borderRadius={22}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <MaterialCommunityIcons
                      name={(NOTIF_ICONS[notif.type] || "bell-outline") as any}
                      size={22}
                      color="#173300"
                    />
                  </XStack>
                  <YStack flex={1} gap="$1">
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="$4" fontWeight="bold" color="$text_dark">
                        {notif.title}
                      </Text>
                      {!notif.read && (
                        <XStack
                          width={10}
                          height={10}
                          borderRadius={5}
                          backgroundColor="#22c55e"
                        />
                      )}
                    </XStack>
                    <Text fontSize="$3" color="$text_dark">
                      {notif.body}
                    </Text>
                    <Text fontSize="$2" color="$secondary">
                      {formatTime(notif.created_at)}
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            ))}
          </YStack>
          )}
        </ScreenContent>
      </ScrollView>

      <BottomNav
        activeTab="profile"
        onHomePress={() => router.push("/dashboard")}
        onMessagePress={() => router.push("/messages" as any)}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
