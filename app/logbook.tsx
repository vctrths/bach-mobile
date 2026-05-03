import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import { Card, Circle, H1, H2, Text, XStack, YStack } from "tamagui";

const gardenLogs = [
  {
    id: 1,
    title: "Planten water geven",
    description: "Geef alle struiken en bloemen water op woensdagavond.",
    status: ["completed", "pending"],
    date: "Woensdag 3 Mei",
  },
  {
    id: 2,
    title: "Snoeien en opruimen",
    description: "Snoei de grote appelboom en veeg het terras.",
    status: ["completed", "completed"],
    date: "Zaterdag 6 Mei",
  },
  {
    id: 3,
    title: "Onkruid wieden",
    description: "Wieden van het onkruid tussen de kasseien en in het moestuintje.",
    status: ["completed", "completed"],
    date: "Zondag 7 Mei",
  },
];

export default function LogbookScreen() {
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

          {/* Glassmorphic Header */}
          <YStack
            position="relative"
            backgroundColor="rgba(255, 255, 255, 0.4)"
            borderRadius="$10"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.45)"
            padding="$5"
            gap="$2"
            overflow="hidden"
            shadowColor="#0f1a0f"
            shadowOpacity={0.08}
            shadowRadius={16}
            shadowOffset={{ width: 0, height: 4 }}
            elevation={4}
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
            
            <H1 color="$text_dark" fontWeight="bold">
              Tuinlogboek
            </H1>
            <Text color="$text_dark" fontSize="$3">
              Volg al je taken en onderhoudslogs op de voet.
            </Text>
          </YStack>

          {/* Logs List */}
          <YStack gap="$4">
            {gardenLogs.map((log) => (
              <Card
                key={log.id}
                elevate
                backgroundColor="$background_secondary"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$6"
                padding="$4"
                gap="$2"
              >
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <YStack flex={1} gap="$1">
                    <H2 fontSize="$4" fontWeight="bold" color="$primary">
                      {log.title}
                    </H2>
                    <Text fontSize="$2" color="$secondary" fontWeight="600">
                      {log.date}
                    </Text>
                    <Text fontSize="$3" color="$text_dark" marginTop="$1">
                      {log.description}
                    </Text>
                  </YStack>
                  <Ionicons name="checkmark-done" size={24} color="$primary" />
                </XStack>

                <XStack gap="$2" marginTop="$2">
                  {log.status.map((status, index) => (
                    <Circle
                      key={index}
                      size={16}
                      backgroundColor={
                        status === "completed"
                          ? "rgba(23, 51, 0, 0.8)"
                          : "rgba(200, 200, 200, 0.4)"
                      }
                    />
                  ))}
                </XStack>
              </Card>
            ))}
          </YStack>

        </YStack>
      </ScrollView>
    </ThemedSafeArea>
  );
}
