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
  const createdLabel = log.created_at
    ? new Date(log.created_at).toLocaleDateString("nl-BE", {
        day: "2-digit",
        month: "short",
      })
    : null;

  return (
    <Card
      overflow="hidden"
      width={228}
      height={146}
      backgroundColor="#F0F3EC"
      borderColor="#E3ECD7"
      borderWidth={1}
      borderRadius={16}
      padding={12}
      boxShadow="0px 4px 20px rgba(23, 51, 0, 0.06)"
      onPress={onPress}
      pressStyle={onPress ? { scale: 0.98, opacity: 0.9 } : undefined}
    >
      <YStack justifyContent="space-between" height="100%" gap={10}>
        <XStack justifyContent="space-between" alignItems="flex-start" gap={8}>
          <YStack flex={1} gap={4}>
            <Text
              fontSize={16}
              lineHeight={18}
              fontWeight="700"
              color="#000000"
              numberOfLines={2}
            >
              {log.title}
            </Text>
            {createdLabel && (
              <Text fontSize={12} color="rgba(0,0,0,0.55)" numberOfLines={1}>
                {createdLabel}
              </Text>
            )}
          </YStack>
          <Circle
            size={28}
            backgroundColor="#173300"
            justifyContent="center"
            alignItems="center"
          >
            <Ionicons name="checkmark-done" size={16} color="#F0F3EC" />
          </Circle>
        </XStack>

        <XStack gap={6} alignItems="center">
          {log.status.map((status, index) => (
            <Circle
              key={index}
              size={12}
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
