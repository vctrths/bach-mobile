import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import { supabase } from "@/utils/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Card, Circle, Spinner, Text, XStack, YStack } from "tamagui";

const NOTIF_ICONS: Record<string, string> = {
  request_accepted: "check-circle-outline",
  request_rejected: "close-circle-outline",
  request_received: "account-plus-outline",
  message: "message-text-outline",
  reminder: "calendar-clock-outline",
  system: "information-outline",
  garden_saved: "heart-outline",
  profile_view: "eye-outline",
};

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
  sender_image?: string | null;
};

function isWithinDays(dateStr: string, days: number) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff < days * 24 * 60 * 60 * 1000;
}

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m geleden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}u geleden`;
  const days = Math.floor(hours / 24);
  return `${days}d geleden`;
}

function NotificationRow({
  notif,
  onPress,
}: {
  notif: NotificationItem;
  onPress: () => void;
}) {
  return (
    <XStack
      gap="$3"
      alignItems="flex-start"
      paddingVertical="$2"
      onPress={onPress}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
    >
      <YStack position="relative">
        <Circle
          size={48}
          backgroundColor="rgba(23, 51, 0, 0.08)"
          overflow="hidden"
        >
          {notif.sender_image ? (
            <XStack width="100%" height="100%">
              <img
                src={notif.sender_image}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 24,
                }}
              />
            </XStack>
          ) : (
            <MaterialCommunityIcons
              name={(NOTIF_ICONS[notif.type] || "bell-outline") as any}
              size={22}
              color="#173300"
            />
          )}
        </Circle>
        {/* Online status dot */}
        <YStack
          position="absolute"
          bottom={0}
          right={0}
          width={14}
          height={14}
          borderRadius={7}
          backgroundColor="white"
          justifyContent="center"
          alignItems="center"
        >
          <YStack
            width={10}
            height={10}
            borderRadius={5}
            backgroundColor="#22c55e"
          />
        </YStack>
      </YStack>
      <YStack flex={1} gap="$1" paddingTop="$1">
        <Text fontSize="$3" fontWeight="500" color="$text_dark">
          {notif.body || notif.title}
        </Text>
        <Text fontSize="$2" color="$secondary">
          {formatTime(notif.created_at)}
        </Text>
      </YStack>
    </XStack>
  );
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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

  const last7Days = notifications.filter((n) => isWithinDays(n.created_at, 7));
  const last30Days = notifications.filter(
    (n) => !isWithinDays(n.created_at, 7) && isWithinDays(n.created_at, 30)
  );
  const older = notifications.filter((n) => !isWithinDays(n.created_at, 30));

  return (
    <PageContainer
      topNavTitle="Meldingen"
      onBackPress={() => router.back()}
      activeTab="profile"
    >
      {loading ? (
        <YStack padding="$10" alignItems="center">
          <Spinner size="large" color="$primary" />
        </YStack>
      ) : notifications.length === 0 ? (
        <YStack padding="$10" alignItems="center" gap="$3">
          <MaterialCommunityIcons
            name="bell-off-outline"
            size={48}
            color="#57594D"
          />
          <Text
            fontSize="$5"
            fontWeight="bold"
            color="$text_dark"
            textAlign="center"
          >
            Geen meldingen
          </Text>
          <Text fontSize="$4" color="$secondary" textAlign="center">
            Je hebt momenteel geen meldingen.
          </Text>
        </YStack>
      ) : (
        <YStack gap="$6">
          {/* Last 7 days */}
          {last7Days.length > 0 && (
            <YStack gap="$3">
              <Text fontSize="$4" fontWeight="bold" color="$text_dark">
                Laatste 7 dagen:
              </Text>
              <YStack gap="$2">
                {last7Days.map((notif) => (
                  <React.Fragment key={notif.id}>
                    {/* Actionable notification with CTA card */}
                    {notif.type === "request_accepted" && (
                      <Card
                        elevation={2}
                        backgroundColor="white"
                        borderColor="rgba(23, 51, 0, 0.1)"
                        borderWidth={1}
                        borderRadius="$6"
                        padding="$4"
                        gap="$3"
                      >
                        <NotificationRow
                          notif={notif}
                          onPress={() =>
                            router.push("/messages" as any)
                          }
                        />
                        <Button
                          label="Ga de tuin bekijken"
                          backgroundColor="rgba(23, 51, 0, 0.08)"
                          color="#173300"
                          onPress={() =>
                            router.push("/messages" as any)
                          }
                        />
                      </Card>
                    )}
                    {notif.type === "request_received" && (
                      <Card
                        elevation={2}
                        backgroundColor="white"
                        borderColor="rgba(23, 51, 0, 0.1)"
                        borderWidth={1}
                        borderRadius="$6"
                        padding="$4"
                        gap="$3"
                      >
                        <NotificationRow
                          notif={notif}
                          onPress={() =>
                            router.push("/owner/dashboard" as any)
                          }
                        />
                        <XStack gap="$2">
                          <Button
                            label="Chat openen"
                            flex={1}
                            backgroundColor="rgba(23, 51, 0, 0.08)"
                            color="#173300"
                            onPress={() =>
                              router.push("/messages" as any)
                            }
                          />
                        </XStack>
                        <XStack gap="$2">
                          <Button
                            label="Afwijzen"
                            flex={1}
                            backgroundColor="transparent"
                            color="#ef4444"
                            onPress={() =>
                              router.push("/owner/dashboard" as any)
                            }
                          />
                          <Button
                            label="Accepteren"
                            flex={1}
                            backgroundColor="#22c55e"
                            color="white"
                            onPress={() =>
                              router.push("/owner/dashboard" as any)
                            }
                          />
                        </XStack>
                      </Card>
                    )}
                    {notif.type !== "request_accepted" &&
                      notif.type !== "request_received" && (
                        <NotificationRow
                          notif={notif}
                          onPress={() =>
                            router.push("/messages" as any)
                          }
                        />
                      )}
                  </React.Fragment>
                ))}
              </YStack>

              {/* Promotional text */}
              <XStack gap="$2" alignItems="center" padding="$3">
                <YStack
                  width={8}
                  height={8}
                  borderRadius={4}
                  backgroundColor="rgba(23, 51, 0, 0.3)"
                />
                <Text fontSize="$3" color="$secondary" fontStyle="italic">
                  Misschien zijn deze tuinen in jouw buurt iets voor jou!
                </Text>
              </XStack>
            </YStack>
          )}

          {/* Last 30 days */}
          {last30Days.length > 0 && (
            <YStack gap="$3">
              <Text fontSize="$4" fontWeight="bold" color="$text_dark">
                Laatste 30 dagen:
              </Text>
              <YStack gap="$2">
                {last30Days.map((notif) => (
                  <NotificationRow
                    key={notif.id}
                    notif={notif}
                    onPress={() =>
                      router.push("/messages" as any)
                    }
                  />
                ))}
              </YStack>
            </YStack>
          )}

          {/* Older */}
          {older.length > 0 && (
            <YStack gap="$3">
              <Text fontSize="$4" fontWeight="bold" color="$text_dark">
                Ouder:
              </Text>
              <YStack gap="$2">
                {older.map((notif) => (
                  <NotificationRow
                    key={notif.id}
                    notif={notif}
                    onPress={() =>
                      router.push("/messages" as any)
                    }
                  />
                ))}
              </YStack>
            </YStack>
          )}
        </YStack>
      )}
    </PageContainer>
  );
}
