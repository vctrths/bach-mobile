import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import { Card, H1, H2, Text, XStack, YStack } from "tamagui";

export default function ProBlockScreen() {
  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
          <TopNavPill
            title="Terug"
            onBackPress={() => router.back()}
          />

          {/* Lock Icon */}
          <YStack alignItems="center" gap="$4" marginTop="$4">
            <XStack
              backgroundColor="rgba(23, 51, 0, 0.08)"
              width={80}
              height={80}
              borderRadius={40}
              justifyContent="center"
              alignItems="center"
            >
              <Ionicons name="lock-closed" size={36} color="#173300" />
            </XStack>

            <YStack alignItems="center" gap="$2">
              <H1 color="$text_dark" fontWeight="bold" textAlign="center">
                Pro Account Vereist
              </H1>
              <Text
                color="$secondary"
                fontSize="$3"
                textAlign="center"
                maxWidth={280}
              >
                Om deze functie te gebruiken heb je een Groene Vingers Pro account nodig.
              </Text>
            </YStack>
          </YStack>

          {/* Pro Benefits */}
          <YStack gap="$4" paddingVertical="$2">
            <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
              Wat krijg je met Pro?
            </H2>

            <YStack gap="$3">
              <XStack gap="$3" alignItems="center">
                <Ionicons name="checkmark-circle" size={26} color="#173300" />
                <Text color="$text_dark" fontSize="$4" flex={1}>
                  Stuur onbeperkt aantal aanvragen naar tuinen
                </Text>
              </XStack>

              <XStack gap="$3" alignItems="center">
                <Ionicons name="checkmark-circle" size={26} color="#173300" />
                <Text color="$text_dark" fontSize="$4" flex={1}>
                  Exclusieve toegang tot premium oases
                </Text>
              </XStack>

              <XStack gap="$3" alignItems="center">
                <Ionicons name="checkmark-circle" size={26} color="#173300" />
                <Text color="$text_dark" fontSize="$4" flex={1}>
                  Uitgebreid logboek en planningstools
                </Text>
              </XStack>

              <XStack gap="$3" alignItems="center">
                <Ionicons name="checkmark-circle" size={26} color="#173300" />
                <Text color="$text_dark" fontSize="$4" flex={1}>
                  Geen advertenties
                </Text>
              </XStack>
            </YStack>
          </YStack>

          {/* Price Card */}
          <Card
            elevation={2}
            backgroundColor="rgba(227, 236, 215, 0.5)"
            borderColor="rgba(227, 236, 215, 0.85)"
            borderWidth={1}
            borderRadius="$6"
            padding="$5"
            gap="$3"
          >
            <Text
              fontSize="$5"
              color="$primary"
              fontWeight="bold"
              textAlign="center"
            >
              €7 / maand
            </Text>
            <Text
              fontSize="$3"
              color="$text_dark"
              textAlign="center"
            >
              Elke maand opzegbaar. Start met 7 dagen gratis.
            </Text>
          </Card>

          {/* CTA Buttons */}
          <YStack gap="$3">
            <Button
              label="Upgrade naar Pro"
              backgroundColor="$background"
              color="$white"
              onPress={() => router.push("/pro")}
            />
            <Button
              label="Misschien later"
              backgroundColor="transparent"
              color="$text_dark"
              onPress={() => router.back()}
            />
          </YStack>
        </YStack>
      </ScrollView>
    </ThemedSafeArea>
  );
}
