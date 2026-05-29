import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { TextInput } from "react-native";
import { Text, XStack } from "tamagui";

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onPress?: () => void;
  placeholder?: string;
  active?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onPress,
  placeholder = "Zoeken naar een tuin",
  active = false,
}: SearchBarProps) {
  return (
    <XStack
      backgroundColor="white"
      borderRadius="$8"
      paddingHorizontal="$4"
      paddingVertical="$3"
      alignItems="center"
      gap="$2"
      borderWidth={1}
      borderColor="$borderColor"
      onPress={active ? undefined : onPress}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color="#172211"
      />
      {active ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
          style={{
            flex: 1,
            fontSize: 16,
            color: "#172211",
            fontFamily: "Satoshi",
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
      ) : (
        <Text fontSize="$4" color="#172211" flex={1}>
          {placeholder}
        </Text>
      )}
      {active && value && value.length > 0 ? (
        <Ionicons
          name="close-circle"
          size={20}
          color="#9ca3af"
          onPress={() => onChangeText && onChangeText("")}
        />
      ) : null}
    </XStack>
  );
}
