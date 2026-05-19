import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, XStack, YStack } from "tamagui";

interface MessageItemProps {
  id: string;
  avatarUrl: string | null;
  name: string;
  lastMessage: string;
  timestamp: string;
  isUnread?: boolean;
  isOnline?: boolean;
}

export default function MessageItem({
  id,
  avatarUrl,
  name,
  lastMessage,
  timestamp,
  isUnread = false,
  isOnline = false,
}: MessageItemProps) {
  return (
    <XStack
      backgroundColor="#F9F9F9"
      padding="$4"
      gap="$4"
      alignItems="center"
      onPress={() => router.push(`/messages/${id}` as any)}
      pressStyle={{ opacity: 0.7 }}
    >
      <YStack position="relative">
        <Image
          source={{ uri: avatarUrl || undefined }}
          width={50}
          height={50}
          borderRadius="$10"
          backgroundColor="$divider"
        />
        {isOnline && (
          <YStack
            position="absolute"
            bottom={0}
            right={0}
            width={12}
            height={12}
            borderRadius="$10"
            backgroundColor="#4CAF50"
            borderColor="#F9F9F9"
            borderWidth={2}
          />
        )}
      </YStack>

      <YStack flex={1} gap="$1">
        <Text fontSize="$6" fontWeight="bold" color="$text_dark">
          {name}
        </Text>
        <Text
          fontSize="$4"
          color="$secondary"
          fontWeight={isUnread ? "bold" : "normal"}
          numberOfLines={1}
        >
          {lastMessage}
        </Text>
      </YStack>

      <YStack alignItems="flex-end" gap="$2">
        <Text fontSize="$2" color="$secondary">
          {timestamp}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="$secondary" />
      </YStack>
    </XStack>
  );
}
