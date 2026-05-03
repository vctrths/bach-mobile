import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import { Card, H1, Text, XStack, YStack } from "tamagui";

export default function ProScreen() {
  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
          
          {/* Back Button */}
          <XStack alignItems="center" gap="$2" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#172211" />
            <Text color="$text_dark" fontSize="$4" fontWeight="600">
              Terug naar dashboard
            </Text>
          </XStack>

          {/* Premium Glassmorphic Title Card */}
          <YStack
            position="relative"
            backgroundColor="rgba(255, 255, 255, 0.4)"
            borderRadius="$10"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.45)"
            padding="$6"
            gap="$4"
            overflow="hidden"
            shadowColor="#0f1a0f"
            shadowOpacity={0.08}
            shadowRadius={16}
            shadowOffset={{ width: 0, height: 4 }}
            elevation={4}
            alignItems="center"
          >
            <BlurView
              position="absolute"
              top={0}
              right={0}
              bottom={0}
              left={0}
              intensity={45}
              tint="light"
              experimentalBlurMethod="dimezisBlurView"
            />
            
            <H1 color="$text_dark" fontWeight="bold" textAlign="center">
              Groene Vingers Pro
            </H1>
            <Text color="$text_dark" fontSize="$4" textAlign="center">
              Voor wie net wat meer uit zijn tuinervaring wil halen.
            </Text>
          </YStack>

          {/* Pro Benefits */}
          <YStack gap="$4" paddingVertical="$2">
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

          {/* Price Card */}
          <Card
            elevate
            backgroundColor="$background_secondary"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$6"
            padding="$5"
            gap="$3"
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={10}
            shadowOffset={{ width: 0, height: 2 }}
          >
            <Text fontSize="$5" color="$primary" fontWeight="bold" textAlign="center">
              €7 / maand
            </Text>
            <Text fontSize="$3" color="$text_dark" textAlign="center">
              Elke maand opzegbaar. Start met 7 dagen gratis uitproberen.
            </Text>
            <Button
              label="Probeer 7 dagen gratis"
              backgroundColor="$background"
              color="$white"
              onPress={() => alert("Bedankt! Je pro-proefperiode is gestart.")}
            />
          </Card>

        </YStack>
      </ScrollView>
    </ThemedSafeArea>
  );
}
