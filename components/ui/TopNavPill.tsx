import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { safeBack } from "@/utils/navigation";
import React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Circle, Text, XStack, YStack } from "tamagui";

interface TopNavPillProps {
  title: React.ReactNode | string;
  onBackPress?: () => void;
  hideBack?: boolean;
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
}

export default function TopNavPill({
  title,
  onBackPress,
  hideBack = false,
  rightElement,
  children,
}: TopNavPillProps) {
  const insets = useSafeAreaInsets();
  const handleBack = onBackPress || safeBack;

  return (
    <YStack
      position="absolute"
      top={insets.top}
      left={0}
      right={0}
      paddingHorizontal="$4"
      zIndex={10}
    >
      <YStack
        borderRadius="$10"
        padding={1}
        backgroundColor="rgba(255, 255, 255, 0.34)"
        overflow="hidden"
        boxShadow="0px 4px 12px rgba(15, 26, 15, 0.06)"
      >
        <YStack
          borderRadius={33}
          overflow="hidden"
          backgroundColor="rgba(255, 255, 255, 0.12)"
        >
          <BlurView
            intensity={55}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />

          <YStack paddingHorizontal="$4" paddingVertical="$3" gap="$3">
            <XStack alignItems="center" justifyContent="space-between" minHeight={44}>
              <XStack alignItems="center" gap="$4">
                {!hideBack && (
                  <Circle
                    size={44}
                    backgroundColor="white"
                    borderWidth={1}
                    borderColor="rgba(0, 0, 0, 0.04)"
                    justifyContent="center"
                    alignItems="center"
                    boxShadow="0px 2px 6px rgba(0, 0, 0, 0.05)"
                    onPress={handleBack}
                    pressStyle={{ scale: 0.94, opacity: 0.85 }}
                  >
                    <Ionicons name="arrow-back" size={24} color="#172211" />
                  </Circle>
                )}
                {typeof title === "string" ? (
                  <Text color="$text_dark" fontSize="$5" fontWeight="bold">
                    {title}
                  </Text>
                ) : (
                  title
                )}
              </XStack>
              {rightElement && rightElement}
            </XStack>
            {children}
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
