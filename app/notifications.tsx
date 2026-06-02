import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Circle, Spinner, Text, XStack, YStack } from "tamagui";

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
  createdAt: string;
  relatedId?: string | null;
  senderName?: string;
  senderImage?: string | null;
};

function isWithinDays(dateStr: string, days: number) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff < days * 24 * 60 * 60 * 1000;
}

function splitNotificationText(notif: NotificationItem) {
  if (notif.senderName) {
    return {
      actor: notif.senderName,
      action: ` ${notif.body || notif.title}`,
    };
  }

  if (notif.type === "message" && notif.title.startsWith("Nieuw bericht van ")) {
    return {
      actor: notif.title.replace("Nieuw bericht van ", ""),
      action: notif.body ? ` stuurde: ${notif.body}` : " stuurde je een bericht.",
    };
  }

  const copy = notif.body || notif.title;
  const separator = [" heeft ", " wil ", " kan ", " stuurde "].find((part) =>
    copy.includes(part)
  );

  if (!separator) {
    return { actor: "", action: copy };
  }

  const [actor, ...rest] = copy.split(separator);
  return {
    actor,
    action: `${separator}${rest.join(separator)}`,
  };
}

function NotificationRow({
  notif,
  onPress,
}: {
  notif: NotificationItem;
  onPress: () => void;
}) {
  const { actor, action } = splitNotificationText(notif);

  return (
    <XStack
      gap={8}
      alignItems="flex-start"
      width="100%"
      onPress={onPress}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
    >
      <YStack position="relative">
        <Circle
          size={50}
          backgroundColor="rgba(23, 51, 0, 0.08)"
          overflow="hidden"
        >
          {notif.senderImage ? (
            <ExpoImage
              source={{ uri: notif.senderImage }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 25,
              }}
              contentFit="cover"
            />
          ) : (
            <MaterialCommunityIcons
              name={(NOTIF_ICONS[notif.type] || "bell-outline") as any}
              size={22}
              color="#173300"
            />
          )}
        </Circle>
        <YStack
          position="absolute"
          bottom={2}
          right={2}
          width={10}
          height={10}
          borderRadius={5}
          backgroundColor="white"
          justifyContent="center"
          alignItems="center"
        >
          <YStack
            width={6}
            height={6}
            borderRadius={3}
            backgroundColor="#A6C774"
          />
        </YStack>
      </YStack>
      <YStack flex={1} minHeight={50} justifyContent="center">
        <Text fontSize={16} lineHeight={20} color="$text_dark">
          {actor ? (
            <Text fontSize={16} lineHeight={20} fontWeight="800" color="$text_dark">
              {actor}
            </Text>
          ) : null}
          {action}
        </Text>
      </YStack>
    </XStack>
  );
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const openNotification = (notif: NotificationItem) => {
    if (notif.type === "message" && notif.relatedId) {
      router.push(`/messages/${notif.relatedId}` as any);
      return;
    }

    router.push("/messages" as any);
  };

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

      if (data) {
        setNotifications(data.map((n) => toCamelCase(n)) as NotificationItem[]);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const last7Days = notifications.filter((n) => isWithinDays(n.createdAt, 7));
  const last30Days = notifications.filter(
    (n) => !isWithinDays(n.createdAt, 7) && isWithinDays(n.createdAt, 30)
  );
  const older = notifications.filter((n) => !isWithinDays(n.createdAt, 30));

  return (
    <PageContainer
      topNavTitle="Meldingen"
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
        <YStack gap={32} paddingHorizontal={24}>
          {last7Days.length > 0 && (
            <YStack gap={16}>
              <Text fontSize={16} fontWeight="900" color="$text_dark">
                Afgelopen 7 dagen:
              </Text>
              <YStack gap={16}>
                {last7Days.map((notif) => (
                  <React.Fragment key={notif.id}>
                    {notif.type === "request_accepted" && (
                      <YStack
                        backgroundColor="#F0F3EC"
                        borderColor="#E3ECD7"
                        borderWidth={1}
                        borderRadius={16}
                        padding={12}
                        gap={16}
                        width="100%"
                      >
                        <NotificationRow
                          notif={notif}
                          onPress={() => openNotification(notif)}
                        />
                        <Button
                          label="Ga de tuin bekijken"
                          variant="primary"
                          width="100%"
                          onPress={() => openNotification(notif)}
                        />
                      </YStack>
                    )}
                    {notif.type === "request_received" && (
                      <YStack
                        backgroundColor="#F0F3EC"
                        borderColor="#E3ECD7"
                        borderWidth={1}
                        borderRadius={16}
                        padding={12}
                        gap={16}
                        width="100%"
                      >
                        <NotificationRow
                          notif={notif}
                          onPress={() =>
                            router.push("/" as any)
                          }
                        />
                        <XStack gap="$2">
                          <Button
                            label="Chat openen"
                            variant="primary"
                            flex={1}
                            onPress={() => openNotification(notif)}
                          />
                        </XStack>
                        <XStack gap={8}>
                          <Button
                            label="Afwijzen"
                            variant="decline"
                            flex={1}
                            onPress={() =>
                              router.push("/" as any)
                            }
                          />
                          <Button
                            label="Accepteren"
                            variant="accept"
                            flex={1}
                            onPress={() =>
                              router.push("/" as any)
                            }
                          />
                        </XStack>
                      </YStack>
                    )}
                    {notif.type !== "request_accepted" &&
                      notif.type !== "request_received" && (
                        <NotificationRow
                          notif={notif}
                          onPress={() => openNotification(notif)}
                        />
                      )}
                  </React.Fragment>
                ))}
              </YStack>
            </YStack>
          )}
          {last30Days.length > 0 && (
            <YStack gap={16}>
              <Text fontSize={16} fontWeight="900" color="$text_dark">
                Afgelopen 30 dagen:
              </Text>
              <YStack gap={16}>
                {last30Days.map((notif) => (
                  <React.Fragment key={notif.id}>
                    {notif.type === "request_received" ? (
                      <YStack
                        backgroundColor="#F0F3EC"
                        borderColor="#E3ECD7"
                        borderWidth={1}
                        borderRadius={16}
                        padding={12}
                        gap={16}
                        width="100%"
                      >
                        <NotificationRow
                          notif={notif}
                          onPress={() => openNotification(notif)}
                        />
                        <Button
                          label="Chat openen"
                          variant="primary"
                          width="100%"
                          onPress={() => openNotification(notif)}
                        />
                        <XStack gap={8}>
                          <Button
                            label="Afwijzen"
                            variant="decline"
                            flex={1}
                            onPress={() => router.push("/" as any)}
                          />
                          <Button
                            label="Accepteren"
                            variant="accept"
                            flex={1}
                            onPress={() => router.push("/" as any)}
                          />
                        </XStack>
                      </YStack>
                    ) : (
                      <NotificationRow
                        notif={notif}
                        onPress={() => openNotification(notif)}
                      />
                    )}
                  </React.Fragment>
                ))}
              </YStack>
            </YStack>
          )}

          {older.length > 0 && (
            <YStack gap={16}>
              <Text fontSize={16} fontWeight="900" color="$text_dark">
                Ouder:
              </Text>
              <YStack gap={16}>
                {older.map((notif) => (
                  <NotificationRow
                    key={notif.id}
                    notif={notif}
                    onPress={() => openNotification(notif)}
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
