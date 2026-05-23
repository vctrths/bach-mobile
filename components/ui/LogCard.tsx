import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Card, Circle, Text, XStack, YStack } from "tamagui";

export type GardenLog = {
  id: string;
  title: string;
  status: string[];
  created_at?: string;
};

interface LogCardProps {
  log: GardenLog;
  onPress?: () => void;
}

export function LogCard({ log, onPress }: LogCardProps) {
  return (
    <Card
      elevation={2}
      margin="$2"
      overflow="hidden"
      width={220}
      height={140}
      backgroundColor="rgba(240, 243, 236, 0.8)"
      borderColor="$borderColor"
      borderWidth={1}
      justifyContent="space-between"
      padding="$3"
      onPress={onPress}
      pressStyle={onPress ? { scale: 0.98, opacity: 0.9 } : undefined}
    >
      <YStack justifyContent="space-between" height="100%">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1}>
            <Text
              fontSize="$3"
              fontWeight="bold"
              color="$primary"
              numberOfLines={2}
            >
              {log.title}
            </Text>
          </YStack>
          <Ionicons name="checkmark-done" size={18} color="$primary" />
        </XStack>

        <XStack gap="$2">
          {log.status.map((status, index) => (
            <Circle
              key={index}
              size={14}
              backgroundColor={
                status === "completed"
                  ? "rgba(23, 51, 0, 0.8)"
                  : "rgba(200, 200, 200, 0.4)"
              }
            />
          ))}
        </XStack>
      </YStack>
    </Card>
  );
}
