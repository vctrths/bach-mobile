import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from "react-native-reanimated";
import { Card, Circle, H1, H2, Spinner, Text, XStack, YStack } from "tamagui";

type GardenLog = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status: string[];
  created_at: string;
  completed?: boolean;
};

const initialGardenLogs: GardenLog[] = [];

function SwipeableLogCard({
  log,
  onComplete,
  onDelete,
}: {
  log: GardenLog;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
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

  const isCompleted = log.completed || log.status?.every((s: string) => s === "completed");

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
            elevation={2}
            backgroundColor={isCompleted ? "rgba(240, 243, 236, 0.5)" : "$background_secondary"}
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
  const [logs, setLogs] = useState<GardenLog[]>(initialGardenLogs);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("garden_logs")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching logs:", error);
        return;
      }

      setLogs((data || []) as GardenLog[]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const handleComplete = (id: string) => {
    setLogs((currentLogs) =>
      currentLogs.map((log) =>
        log.id === id ? { ...log, completed: !log.completed } : log
      )
    );
  };

  const handleDelete = (id: string) => {
    setLogs((currentLogs) => currentLogs.filter((log) => log.id !== id));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedSafeArea>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
            {/* Back Button */}
            <TopNavPill
              title="Terug naar dashboard"
              rightElement={
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color="#173300"
                  onPress={() => router.push("/logbook/calendar")}
                />
              }
            />

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

            {loading ? (
              <YStack padding="$10" justifyContent="center" alignItems="center">
                <Spinner size="large" color="$primary" />
              </YStack>
            ) : (
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
            )}
          </YStack>
        </ScrollView>

        {/* FAB for new log */}
        <XStack
          position="absolute"
          bottom={100}
          right={20}
          zIndex={10}
        >
          <XStack
            backgroundColor="$background"
            width={56}
            height={56}
            borderRadius="$10"
            justifyContent="center"
            alignItems="center"
            shadowColor="#000"
            shadowOpacity={0.2}
            shadowRadius={8}
            shadowOffset={{ width: 0, height: 4 }}
            elevation={8}
            onPress={() => router.push("/logbook/new" as any)}
            pressStyle={{ scale: 0.95 }}
          >
            <Ionicons name="add" size={28} color="white" />
          </XStack>
        </XStack>
      </ThemedSafeArea>
    </GestureHandlerRootView>
  );
}
