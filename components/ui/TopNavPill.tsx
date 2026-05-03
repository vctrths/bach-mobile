import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
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
  const handleBack = onBackPress || (() => router.back());

  return (
    <YStack gap="$4">
      <XStack
        backgroundColor="rgba(255, 255, 255, 0.55)"
        borderRadius="$10"
        borderWidth={1}
        borderColor="rgba(227, 236, 215, 0.55)"
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
        overflow="hidden"
        shadowColor="#0f1a0f"
        shadowOpacity={0.06}
        shadowRadius={12}
        shadowOffset={{ width: 0, height: 4 }}
      >
        <BlurView
          intensity={45}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        
        <XStack alignItems="center" gap="$4">
          {!hideBack && (
            <Circle
              size={44}
              backgroundColor="white"
              borderWidth={1}
              borderColor="rgba(0, 0, 0, 0.04)"
              justifyContent="center"
              alignItems="center"
              shadowColor="#000"
              shadowOpacity={0.05}
              shadowRadius={6}
              shadowOffset={{ width: 0, height: 2 }}
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
      {children && children}
    </YStack>
  );
}
