import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { H2, Text, XStack, YStack } from "tamagui";

type TodoItem = {
  id: number;
  date: string;
  title: string;
  completed: boolean;
};

export default function OpvolgingenScreen() {
  const [thisWeek, setThisWeek] = useState<TodoItem[]>([
    { id: 1, date: "22/08/2024", title: "Gazon maaien", completed: false },
    { id: 2, date: "24/08/2024", title: "Bloemen water geven", completed: false },
    { id: 3, date: "25/08/2024", title: "Sla oogsten", completed: false },
  ]);

  const [nextWeek, setNextWeek] = useState<TodoItem[]>([
    { id: 4, date: "29/08/2024", title: "Tomaten water geven", completed: false },
    { id: 5, date: "30/08/2024", title: "Onkruid verwijderen", completed: false },
    { id: 6, date: "01/09/2024", title: "Appels plukken", completed: false },
    { id: 7, date: "02/09/2024", title: "Peren plukken", completed: false },
  ]);

  const toggleItem = (
    items: TodoItem[],
    setItems: React.Dispatch<React.SetStateAction<TodoItem[]>>,
    id: number
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const renderTodoItem = (
    item: TodoItem,
    toggle: () => void
  ) => (
    <XStack
      key={item.id}
      gap="$3"
      alignItems="center"
      paddingVertical="$3"
      borderBottomWidth={1}
      borderBottomColor="rgba(0,0,0,0.04)"
    >
      <XStack
        width={24}
        height={24}
        borderRadius={6}
        borderWidth={2}
        borderColor={
          item.completed ? "#22c55e" : "rgba(23, 51, 0, 0.25)"
        }
        backgroundColor={
          item.completed ? "#22c55e" : "transparent"
        }
        justifyContent="center"
        alignItems="center"
        onPress={toggle}
        pressStyle={{ scale: 0.9 }}
      >
        {item.completed && (
          <Ionicons name="checkmark" size={16} color="white" />
        )}
      </XStack>
      <YStack flex={1} gap="2px">
        <Text
          fontSize="$3"
          color="$secondary"
          fontWeight="500"
        >
          {item.date}
        </Text>
        <Text
          fontSize="$4"
          color="$text_dark"
          textDecorationLine={
            item.completed ? "line-through" : "none"
          }
          opacity={item.completed ? 0.6 : 1}
        >
          {item.title}
        </Text>
      </YStack>
    </XStack>
  );

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
          <TopNavPill
            title="Takenlijst"
            onBackPress={() => router.back()}
          />

          {/* Deze week */}
          <YStack gap="$3">
            <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
              Deze week
            </H2>
            <YStack
              backgroundColor="white"
              borderRadius="$6"
              borderWidth={1}
              borderColor="rgba(23, 51, 0, 0.1)"
              padding="$4"
            >
              {thisWeek.length === 0 ? (
                <Text color="$secondary" fontSize="$3">
                  Geen taken deze week
                </Text>
              ) : (
                thisWeek.map((item) =>
                  renderTodoItem(item, () =>
                    toggleItem(thisWeek, setThisWeek, item.id)
                  )
                )
              )}
            </YStack>
          </YStack>

          {/* Volgende week */}
          <YStack gap="$3">
            <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
              Volgende week
            </H2>
            <YStack
              backgroundColor="white"
              borderRadius="$6"
              borderWidth={1}
              borderColor="rgba(23, 51, 0, 0.1)"
              padding="$4"
            >
              {nextWeek.length === 0 ? (
                <Text color="$secondary" fontSize="$3">
                  Geen taken volgende week
                </Text>
              ) : (
                nextWeek.map((item) =>
                  renderTodoItem(item, () =>
                    toggleItem(nextWeek, setNextWeek, item.id)
                  )
                )
              )}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>

      <BottomNav
        activeTab="home"
        onHomePress={() => router.push("/dashboard")}
        onMessagePress={() => router.push("/messages" as any)}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
