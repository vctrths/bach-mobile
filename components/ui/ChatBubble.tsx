import { Text, YStack } from "tamagui";

interface ChatBubbleProps {
  content: string;
  isOwn: boolean;
  timestamp?: string;
}

export default function ChatBubble({
  content,
  isOwn,
  timestamp,
}: ChatBubbleProps) {
  return (
    <YStack
      alignSelf={isOwn ? "flex-end" : "flex-start"}
      maxWidth="80%"
      paddingHorizontal="$4"
      paddingVertical="$3"
      borderRadius={5000}
      backgroundColor={isOwn ? "#173300" : "#F0F0F0"}
    >
      <Text fontSize="$4" color={isOwn ? "$white" : "$text_dark"}>
        {content}
      </Text>
      {timestamp && (
        <Text fontSize="$1" color="$secondary" marginTop="$1" textAlign="right">
          {timestamp}
        </Text>
      )}
    </YStack>
  );
}
