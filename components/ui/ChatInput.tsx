import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { TextInput as RNTextInput } from "react-native";
import { XStack } from "tamagui";

interface ChatInputProps {
  onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <XStack
      alignItems="center"
      paddingHorizontal="$4"
      paddingVertical="$2"
      backgroundColor="rgba(217, 217, 217, 0.05)"
      borderRadius={64}
      borderWidth={1}
      borderColor="#A9A99E"
      height={46}
      gap="$3"
    >
      <MaterialCommunityIcons name="camera" size={22} color="#A9A99E" />
      <RNTextInput
        style={{ flex: 1, fontSize: 16, color: "#172211" }}
        value={text}
        onChangeText={setText}
        placeholder="Typ een chatbericht..."
        placeholderTextColor="#A9A99E"
        onSubmitEditing={handleSend}
        returnKeyType="send"
      />
      <MaterialCommunityIcons name="microphone" size={22} color="#A9A99E" />
    </XStack>
  );
}
