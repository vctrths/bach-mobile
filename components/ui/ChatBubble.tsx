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
      backgroundColor={isOwn ? "#F0F3EC" : "#EAF0D8"}
    >
      <Text fontSize="$4" color="#172211" textAlign={isOwn ? "right" : "left"}>
        {content}
      </Text>
      {timestamp && (
        <Text fontSize="$1" color="#172211" opacity={0.5} marginTop="$1" textAlign={isOwn ? "right" : "left"}>
          {timestamp}
        </Text>
      )}
    </YStack>
  );
}
