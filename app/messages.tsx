import BottomNav from "@/components/ui/BottomNav";
import MessageItem from "@/components/ui/MessageItem";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { Spinner, Text, YStack } from "tamagui";

type ConversationWithPartner = {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_image: string | null;
  last_message: string;
  last_message_time: string;
  is_online: boolean;
};

export default function Messages() {
  const [conversations, setConversations] = useState<ConversationWithPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();

    const messagesChannel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversationsData, error } = await supabase
        .from("conversations")
        .select("id, user1_id, user2_id, updated_at")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error || !conversationsData) return;

      const conversationsWithDetails = await Promise.all(
        conversationsData.map(async (conv) => {
          const partnerId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;

          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, profile_image")
            .eq("id", partnerId)
            .single();

          const { data: lastMessage } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            id: conv.id,
            partner_id: partnerId,
            partner_name: `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim(),
            partner_image: profile?.profile_image ?? null,
            last_message: lastMessage?.content ?? "",
            last_message_time: lastMessage
              ? new Date(lastMessage.created_at).toLocaleTimeString("nl-NL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            is_online: false,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Nu";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}u`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("nl-NL");
  };

  return (
    <ThemedSafeArea>
      <YStack flex={1}>
        <YStack paddingHorizontal="$4" paddingTop="$4">
          <TopNavPill title="Chats" />
        </YStack>

        {loading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner size="large" color="$primary" />
          </YStack>
        ) : conversations.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
            <Text fontSize="$5" color="$secondary">
              Nog geen gesprekken
            </Text>
            <Text fontSize="$4" color="$secondary" textAlign="center">
              Begin een gesprek vanuit een tuinpagina
            </Text>
          </YStack>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageItem
                id={item.id}
                avatarUrl={item.partner_image}
                name={item.partner_name}
                lastMessage={item.last_message}
                timestamp={formatRelativeTime(item.last_message_time)}
                isUnread={false}
                isOnline={item.is_online}
              />
            )}
            ItemSeparatorComponent={() => (
              <YStack height={1} backgroundColor="$divider" />
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </YStack>

      <BottomNav
        activeTab="message"
        onHomePress={() => router.push("/dashboard")}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
