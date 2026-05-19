import BottomNav from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { Card, H1, Input, Text, TextArea, XStack, YStack } from "tamagui";

export default function NewLogScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask("");
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Fout", "Vul een titel in voor de log.");
      return;
    }
    Alert.alert("Succes", "Log opgeslagen!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
          <TopNavPill
            title="Nieuwe log"
            onBackPress={() => router.back()}
          />

          <YStack gap="$4">
            <YStack gap="$2">
              <Text color="$text_dark" fontSize="$3" fontWeight="500">
                Titel
              </Text>
              <Input
                placeholder="Bijv. Zaaien van tomaten"
                value={title}
                onChangeText={setTitle}
                backgroundColor="white"
                borderColor="rgba(23, 51, 0, 0.1)"
                borderWidth={1}
                borderRadius="$6"
                paddingHorizontal="$4"
                paddingVertical="$3"
                fontSize="$4"
                color="$text_dark"
              />
            </YStack>

            <YStack gap="$2">
              <Text color="$text_dark" fontSize="$3" fontWeight="500">
                Beschrijving
              </Text>
              <TextArea
                placeholder="Beschrijf wat je hebt gedaan..."
                value={description}
                onChangeText={setDescription}
                minHeight={100}
                backgroundColor="white"
                borderColor="rgba(23, 51, 0, 0.1)"
                borderWidth={1}
                borderRadius="$6"
                padding="$4"
                fontSize="$4"
                color="$text_dark"
              />
            </YStack>

            <YStack gap="$2">
              <Text color="$text_dark" fontSize="$3" fontWeight="500">
                Taken
              </Text>
              <XStack gap="$2">
                <Input
                  flex={1}
                  placeholder="Voeg een taak toe..."
                  value={newTask}
                  onChangeText={setNewTask}
                  backgroundColor="white"
                  borderColor="rgba(23, 51, 0, 0.1)"
                  borderWidth={1}
                  borderRadius="$6"
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  fontSize="$4"
                  color="$text_dark"
                />
                <XStack
                  backgroundColor="#173300"
                  width={48}
                  height={48}
                  borderRadius="$4"
                  justifyContent="center"
                  alignItems="center"
                  onPress={addTask}
                  pressStyle={{ scale: 0.95, opacity: 0.9 }}
                >
                  <Ionicons name="add" size={24} color="white" />
                </XStack>
              </XStack>

              {tasks.length > 0 && (
                <YStack gap="$2" marginTop="$2">
                  {tasks.map((task, index) => (
                    <Card
                      key={index}
                      backgroundColor="rgba(227, 236, 215, 0.3)"
                      borderColor="rgba(23, 51, 0, 0.1)"
                      borderWidth={1}
                      borderRadius="$4"
                      padding="$3"
                    >
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="$3" color="$text_dark" flex={1}>
                          {task}
                        </Text>
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#ef4444"
                          onPress={() => removeTask(index)}
                        />
                      </XStack>
                    </Card>
                  ))}
                </YStack>
              )}
            </YStack>
          </YStack>

          <Button
            label="Log opslaan"
            backgroundColor="rgba(23, 51, 0, 0.1)"
            color="#173300"
            onPress={handleSave}
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
