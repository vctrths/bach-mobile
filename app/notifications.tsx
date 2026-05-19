import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import { Card, H1, H2, Text, XStack, YStack } from "tamagui";

export default function NotificationsScreen() {
  const notifications = [
    {
      id: "1",
      title: "Nieuwe aanvraag ontvangen",
      message: "Je hebt een nieuwe aanvraag ontvangen voor je tuin 'Bloementuin'.",
      time: "2 min geleden",
      read: false,
      icon: "leaf",
    },
    {
      id: "2",
      title: "Aanvraag goedgekeurd",
      message: "Je aanvraag voor 'Moestuin Noord' is goedgekeurd!",
      time: "1 uur geleden",
      read: false,
      icon: "check-circle",
    },
    {
      id: "3",
      title: "Nieuw bericht",
      message: "Anna heeft je een bericht gestuurd.",
      time: "3 uur geleden",
      read: true,
      icon: "message-circle",
    },
  ];

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
          <TopNavPill
            title="Meldingen"
            onBackPress={() => router.back()}
          />

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
                      name={notif.icon as any}
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
                      {notif.message}
                    </Text>
                    <Text fontSize="$2" color="$secondary">
                      {notif.time}
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            ))}
          </YStack>
        </YStack>
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
