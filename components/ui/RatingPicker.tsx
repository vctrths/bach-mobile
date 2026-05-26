import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { XStack } from "tamagui";

interface RatingPickerProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  gap?: number;
  disabled?: boolean;
}

export default function RatingPicker({
  rating,
  onRatingChange,
  size = 32,
  gap = 8,
  disabled = false,
}: RatingPickerProps) {
  return (
    <XStack gap={gap}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={size}
          color={star <= rating ? "#FFB800" : "#A9A99E"}
          onPress={disabled ? undefined : () => onRatingChange(star)}
        />
      ))}
    </XStack>
  );
}
