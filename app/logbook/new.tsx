import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { Card, Input, Text, TextArea, XStack, YStack } from "tamagui";

export default function NewLogScreen() {
  const [tasks, setTasks] = useState("");
  const [observations, setObservations] = useState("");
  const [followUps, setFollowUps] = useState("");
  const [day, setDay] = useState(new Date().getDate().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const handleSave = () => {
    if (!tasks.trim()) {
      Alert.alert("Fout", "Vul ten minste één uitgevoerde taak in.");
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

          <YStack gap="$5">
            {/* Taken die je hebt uitgevoerd */}
            <YStack gap="$2">
              <Text color="$text_dark" fontSize="$4" fontWeight="600">
                Taken die je hebt uitgevoerd:
              </Text>
              <TextArea
                placeholder="Typ hier je taken..."
                value={tasks}
                onChangeText={setTasks}
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

            {/* Observaties */}
            <YStack gap="$2">
              <Text color="$text_dark" fontSize="$4" fontWeight="600">
                Observaties
              </Text>
              <TextArea
                placeholder="Typ hier je observaties..."
                value={observations}
                onChangeText={setObservations}
                minHeight={80}
                backgroundColor="white"
                borderColor="rgba(23, 51, 0, 0.1)"
                borderWidth={1}
                borderRadius="$6"
                padding="$4"
                fontSize="$4"
                color="$text_dark"
              />
            </YStack>

            {/* Opvolgingen toevoegen */}
            <YStack gap="$2">
              <Text color="$text_dark" fontSize="$4" fontWeight="600">
                Opvolgingen toevoegen:
              </Text>
              <TextArea
                placeholder="Typ hier je opvolgingen..."
                value={followUps}
                onChangeText={setFollowUps}
                minHeight={80}
                backgroundColor="white"
                borderColor="rgba(23, 51, 0, 0.1)"
                borderWidth={1}
                borderRadius="$6"
                padding="$4"
                fontSize="$4"
                color="$text_dark"
              />
            </YStack>

            {/* Upload image */}
            <XStack
              backgroundColor="transparent"
              borderRadius="$10"
              borderWidth={1}
              borderColor="rgba(23, 51, 0, 0.2)"
              paddingVertical="$3"
              paddingHorizontal="$5"
              justifyContent="center"
              alignItems="center"
              gap="$2"
              onPress={() => Alert.alert("Upload", "Foto uploaden (placeholder)")}
              pressStyle={{ scale: 0.96, opacity: 0.8 }}
            >
              <Ionicons name="camera-outline" size={20} color="#173300" />
              <Text fontSize="$4" fontWeight="600" color="#173300">
                Upload image
              </Text>
            </XStack>

            {/* Datum log */}
            <YStack gap="$2">
              <Text color="$text_dark" fontSize="$4" fontWeight="600">
                Datum log:
              </Text>
              <XStack gap="$3" justifyContent="center">
                {/* Day */}
                <YStack alignItems="center" gap="$1" flex={1}>
                  <Text fontSize="$3" color="$secondary" fontWeight="500">
                    Dag
                  </Text>
                  <XStack
                    backgroundColor="rgba(23, 51, 0, 0.06)"
                    borderRadius="$4"
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                    alignItems="center"
                    gap="$2"
                    width="100%"
                    justifyContent="center"
                  >
                    <Input
                      value={day}
                      onChangeText={setDay}
                      keyboardType="number-pad"
                      textAlign="center"
                      fontSize="$5"
                      fontWeight="600"
                      color="$text_dark"
                      backgroundColor="transparent"
                      borderWidth={0}
                      width={40}
                      padding={0}
                    />
                    <Ionicons name="chevron-down" size={16} color="#57594D" />
                  </XStack>
                </YStack>

                {/* Month */}
                <YStack alignItems="center" gap="$1" flex={1}>
                  <Text fontSize="$3" color="$secondary" fontWeight="500">
                    Maand
                  </Text>
                  <XStack
                    backgroundColor="rgba(23, 51, 0, 0.06)"
                    borderRadius="$4"
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                    alignItems="center"
                    gap="$2"
                    width="100%"
                    justifyContent="center"
                  >
                    <Input
                      value={month}
                      onChangeText={setMonth}
                      keyboardType="number-pad"
                      textAlign="center"
                      fontSize="$5"
                      fontWeight="600"
                      color="$text_dark"
                      backgroundColor="transparent"
                      borderWidth={0}
                      width={40}
                      padding={0}
                    />
                    <Ionicons name="chevron-down" size={16} color="#57594D" />
                  </XStack>
                </YStack>

                {/* Year */}
                <YStack alignItems="center" gap="$1" flex={1}>
                  <Text fontSize="$3" color="$secondary" fontWeight="500">
                    Jaar
                  </Text>
                  <XStack
                    backgroundColor="rgba(23, 51, 0, 0.06)"
                    borderRadius="$4"
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                    alignItems="center"
                    gap="$2"
                    width="100%"
                    justifyContent="center"
                  >
                    <Input
                      value={year}
                      onChangeText={setYear}
                      keyboardType="number-pad"
                      textAlign="center"
                      fontSize="$5"
                      fontWeight="600"
                      color="$text_dark"
                      backgroundColor="transparent"
                      borderWidth={0}
                      width={60}
                      padding={0}
                    />
                    <Ionicons name="chevron-down" size={16} color="#57594D" />
                  </XStack>
                </YStack>
              </XStack>
            </YStack>

            {/* Log opslaan */}
            <XStack
              backgroundColor="#173300"
              borderRadius="$10"
              paddingVertical="$4"
              paddingHorizontal="$5"
              justifyContent="center"
              alignItems="center"
              marginTop="$2"
              onPress={handleSave}
              pressStyle={{ scale: 0.96, opacity: 0.9 }}
            >
              <Text fontSize="$4" fontWeight="700" color="white">
                Log opslaan
              </Text>
            </XStack>
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
