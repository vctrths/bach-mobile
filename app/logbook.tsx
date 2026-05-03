import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from "react-native-reanimated";
import { Card, Circle, H1, H2, Text, XStack, YStack } from "tamagui";

const initialGardenLogs = [
  {
    id: 1,
    title: "Planten water geven",
    description: "Geef alle struiken en bloemen water op woensdagavond.",
    status: ["completed", "pending"],
    date: "Woensdag 3 Mei",
    completed: false,
  },
  {
    id: 2,
    title: "Snoeien en opruimen",
    description: "Snoei de grote appelboom en veeg het terras.",
    status: ["completed", "completed"],
    date: "Zaterdag 6 Mei",
    completed: false,
  },
  {
    id: 3,
    title: "Onkruid wieden",
    description: "Wieden van het onkruid tussen de kasseien en in het moestuintje.",
    status: ["completed", "completed"],
    date: "Zondag 7 Mei",
    completed: false,
  },
];

function SwipeableLogCard({
  log,
  onComplete,
  onDelete,
}: {
  log: (typeof initialGardenLogs)[0];
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > 80) {
        // Complete (swipe right)
        translateX.value = withSpring(0);
        if (onComplete) runOnJS(onComplete)(log.id);
      } else if (event.translationX < -80) {
        // Delete (swipe left)
        translateX.value = withSpring(-500, {}, () => {
          if (onDelete) runOnJS(onDelete)(log.id);
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <YStack position="relative" marginVertical="$1" overflow="hidden" borderRadius="$6">
      {/* Background Behind Card */}
      <XStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="$5"
        backgroundColor="rgba(240, 243, 236, 0.85)"
        borderRadius="$6"
        borderColor="$borderColor"
        borderWidth={1}
      >
        <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
        <Ionicons name="trash" size={28} color="#ef4444" />
      </XStack>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={rStyle}>
          <Card
            elevate
            backgroundColor={log.completed ? "rgba(240, 243, 236, 0.5)" : "$background_secondary"}
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$6"
            padding="$4"
            gap="$2"
          >
            <XStack justifyContent="space-between" alignItems="flex-start">
              <YStack flex={1} gap="$1">
                <H2
                  fontSize="$4"
                  fontWeight="bold"
                  color={log.completed ? "$gray10" : "$primary"}
                  textDecorationLine={log.completed ? "line-through" : "none"}
                >
                  {log.title}
                </H2>
                <Text fontSize="$2" color="$secondary" fontWeight="600">
                  {log.date}
                </Text>
                <Text
                  fontSize="$3"
                  color="$text_dark"
                  marginTop="$1"
                  textDecorationLine={log.completed ? "line-through" : "none"}
                >
                  {log.description}
                </Text>
              </YStack>
              <Ionicons
                name={log.completed ? "checkmark-circle" : "checkmark-done"}
                size={24}
                color={log.completed ? "#22c55e" : "$primary"}
              />
            </XStack>

            <XStack gap="$2" marginTop="$2">
              {log.status.map((status, index) => (
                <Circle
                  key={index}
                  size={16}
                  backgroundColor={
                    log.completed || status === "completed"
                      ? "rgba(23, 51, 0, 0.8)"
                      : "rgba(200, 200, 200, 0.4)"
                  }
                />
              ))}
            </XStack>
          </Card>
        </Animated.View>
      </GestureDetector>
    </YStack>
  );
}

export default function LogbookScreen() {
  const [logs, setLogs] = useState(initialGardenLogs);

  const handleComplete = (id: number) => {
    setLogs((currentLogs) =>
      currentLogs.map((log) =>
        log.id === id ? { ...log, completed: !log.completed } : log
      )
    );
  };

  const handleDelete = (id: number) => {
    setLogs((currentLogs) => currentLogs.filter((log) => log.id !== id));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                intensity={45}
                tint="light"
                experimentalBlurMethod="dimezisBlurView"
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
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
              {logs.map((log) => (
                <SwipeableLogCard
                  key={log.id}
                  log={log}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              ))}
              {logs.length === 0 && (
                <YStack paddingVertical="$10" alignItems="center" gap="$2">
                  <Ionicons name="leaf-outline" size={48} color="$gray8" />
                  <Text color="$gray10" fontSize="$4" textAlign="center">
                    Geen taken meer! Goed gedaan.
                  </Text>
                </YStack>
              )}
            </YStack>
          </YStack>
        </ScrollView>
      </ThemedSafeArea>
    </GestureHandlerRootView>
  );
}
