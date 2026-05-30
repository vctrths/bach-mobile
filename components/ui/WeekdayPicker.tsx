import React from "react";
import { Pressable } from "react-native";
import { Circle, Text, XStack, YStack } from "tamagui";

export const WEEKDAY_OPTIONS = [
  { key: "M", label: "M" },
  { key: "D", label: "D" },
  { key: "W", label: "W" },
  { key: "Do", label: "D" },
  { key: "V", label: "V" },
  { key: "Za", label: "Z" },
  { key: "Zo", label: "Z" },
];

type WeekdayPickerProps = {
  selectedDays: string[];
  onToggleDay: (dayKey: string) => void;
  error?: string;
};

export default function WeekdayPicker({
  selectedDays,
  onToggleDay,
  error,
}: WeekdayPickerProps) {
  return (
    <YStack gap="$2">
      <XStack gap="$1" alignItems="flex-start" padding={10}>
        <YStack width={56} gap="$3" alignItems="flex-start">
          <Text color="#56594D" fontSize={16} fontWeight="500" opacity={0.4}>
            Dag
          </Text>
          <Text color="#56594D" fontSize={16} fontWeight="500" opacity={0.4}>
            Aanw.
          </Text>
        </YStack>

        {WEEKDAY_OPTIONS.map((day) => {
          const isSelected = selectedDays.includes(day.key);

          return (
            <Pressable
              key={day.key}
              onPress={() => onToggleDay(day.key)}
              style={{ flex: 1 }}
            >
              <YStack alignItems="center" gap="$3" paddingVertical="$1">
                <Text
                  color={isSelected ? "#FFEDB3" : "#36392B"}
                  fontSize={16}
                  fontWeight={isSelected ? "900" : "500"}
                  opacity={isSelected ? 1 : 0.4}
                >
                  {day.label}
                </Text>
                <Circle
                  size={8}
                  backgroundColor={
                    isSelected ? "#FFEDB3" : "rgba(0, 0, 0, 0.25)"
                  }
                />
              </YStack>
            </Pressable>
          );
        })}
      </XStack>

      {error ? (
        <Text color="red" fontSize={14}>
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
