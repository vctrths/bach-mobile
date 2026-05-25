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
      backgroundColor={isOwn ? "#EAF0D8" : "#F0F3EC"}
      borderWidth={1}
      borderColor="#D4E1AE"
    >
      <Text fontSize="$4" color="$text_dark">
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
