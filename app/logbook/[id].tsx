import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Card, Checkbox, H1, H2, Text, XStack, YStack } from "tamagui";

export default function LogDetailScreen() {
  const { id } = useLocalSearchParams();
  const [tasks, setTasks] = useState([
    { id: 1, text: "Water geven", completed: true },
    { id: 2, text: "Onkruid verwijderen", completed: false },
    { id: 3, text: "Bemesten", completed: false },
  ]);

  const toggleTask = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
          <TopNavPill
            title="Log details"
            onBackPress={() => router.back()}
          />

          <YStack gap="$4">
            <H1 color="$text_dark" fontWeight="bold" fontSize="$6">
              Dag {id}
            </H1>
            <Text color="$secondary" fontSize="$3">
              Details van deze logdag en opvolgingstaken.
            </Text>
          </YStack>

          {/* Progress Card */}
          <Card
            elevation={2}
            backgroundColor="rgba(227, 236, 215, 0.5)"
            borderColor="rgba(227, 236, 215, 0.85)"
            borderWidth={1}
            borderRadius="$6"
            padding="$4"
            gap="$3"
          >
            <Text fontSize="$4" fontWeight="bold" color="$text_dark">
              Voortgang
            </Text>
            <XStack
              height={8}
              backgroundColor="rgba(23, 51, 0, 0.1)"
              borderRadius={4}
              overflow="hidden"
            >
              <XStack
                width={`${progress}%`}
                height={8}
                backgroundColor="#22c55e"
                borderRadius={4}
              />
            </XStack>
            <Text fontSize="$3" color="$secondary">
              {completedCount} van de {tasks.length} taken voltooid
            </Text>
          </Card>

          {/* Tasks Card */}
          <Card
            elevation={2}
            backgroundColor="white"
            borderColor="rgba(23, 51, 0, 0.1)"
            borderWidth={1}
            borderRadius="$6"
            padding="$4"
            gap="$3"
          >
            <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
              Taken
            </H2>
            <YStack gap="$3">
              {tasks.map((task) => (
                <XStack
                  key={task.id}
                  gap="$3"
                  alignItems="center"
                  paddingVertical="$2"
                >
                  <XStack
                    width={24}
                    height={24}
                    borderRadius={12}
                    borderWidth={2}
                    borderColor={task.completed ? "#22c55e" : "rgba(23, 51, 0, 0.3)"}
                    backgroundColor={
                      task.completed ? "#22c55e" : "transparent"
                    }
                    justifyContent="center"
                    alignItems="center"
                    onPress={() => toggleTask(task.id)}
                  >
                    {task.completed && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </XStack>
                  <Text
                    fontSize="$4"
                    color="$text_dark"
                    textDecorationLine={
                      task.completed ? "line-through" : "none"
                    }
                    flex={1}
                  >
                    {task.text}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </Card>

          {/* Notes Card */}
          <Card
            elevation={2}
            backgroundColor="white"
            borderColor="rgba(23, 51, 0, 0.1)"
            borderWidth={1}
            borderRadius="$6"
            padding="$4"
            gap="$3"
          >
            <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
              Notities
            </H2>
            <Text fontSize="$3" color="$secondary">
              De planten zien er gezond uit. Nieuwe scheuten zichtbaar bij de
              tomaten.
            </Text>
          </Card>

          {/* Follow-ups Card */}
          <Card
            elevation={2}
            backgroundColor="rgba(239, 68, 68, 0.05)"
            borderColor="rgba(239, 68, 68, 0.2)"
            borderWidth={1}
            borderRadius="$6"
            padding="$4"
            gap="$3"
          >
            <XStack gap="$2" alignItems="center">
              <MaterialCommunityIcons
                name="alert-circle"
                size={20}
                color="#ef4444"
              />
              <H2 color="#ef4444" fontWeight="bold" fontSize="$5">
                Opvolging nodig
              </H2>
            </XStack>
            <Text fontSize="$3" color="$text_dark">
              Controleer de grondvochtigheid volgende week. Eventueel extra
              mulch toevoegen.
            </Text>
          </Card>

          <Button
            label="Log bewerken"
            backgroundColor="rgba(23, 51, 0, 0.1)"
            color="#173300"
            onPress={() => {}}
          />
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
