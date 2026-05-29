import { Ionicons } from "@expo/vector-icons";
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
      backgroundColor="$canvas"
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius={6}
      paddingHorizontal="$4"
      paddingVertical="$3"
      marginHorizontal="$3"
      alignItems="center"
      justifyContent="space-between"
      onPress={() => router.push(`/messages/${id}` as any)}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
    >
      <XStack flex={1} gap="$3" alignItems="center">
        <YStack position="relative" width={50} height={50} justifyContent="center">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              width={50}
              height={50}
              borderRadius={100}
              backgroundColor="$borderColor"
            />
          ) : (
            <YStack
              width={50}
              height={50}
              borderRadius={100}
              backgroundColor="$borderColor"
              justifyContent="center"
              alignItems="center"
            >
              <Ionicons name="person" size={28} color="$secondary" />
            </YStack>
          )}
          {isOnline && (
            <YStack
              position="absolute"
              bottom={0}
              right={0}
              width={7}
              height={7}
              borderRadius={100}
              backgroundColor="$button_secondary_border"
            />
          )}
        </YStack>

        <YStack flex={1} gap="$2">
          <Text
            fontSize="$4"
            fontWeight={isUnread ? "700" : "400"}
            color="$text_dark"
          >
            {name}
          </Text>
          <XStack alignItems="center" flex={1}>
            <Text
              fontSize="$3"
              fontWeight={isUnread ? "700" : "400"}
              color="$text_dark"
              numberOfLines={1}
              flex={1}
            >
              {lastMessage}
            </Text>
            <Text
              fontSize="$3"
              fontWeight={isUnread ? "700" : "400"}
              color="$secondary"
            >
              {timestamp}
            </Text>
          </XStack>
        </YStack>
      </XStack>

      {isUnread && (
        <YStack
          width={8}
          height={8}
          borderRadius={100}
          backgroundColor="$button_accept_bg"
        />
      )}
    </XStack>
  );
}
