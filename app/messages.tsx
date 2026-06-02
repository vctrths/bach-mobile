import PageContainer from "@/components/ui/PageContainer";
import MessageItem from "@/components/ui/MessageItem";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { FlatList, Platform } from "react-native";
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

let nextMessagesChannelId = 0;

export default function Messages() {
  const [conversations, setConversations] = useState<ConversationWithPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const messagesChannel = supabase.channel(
      `messages-changes:${nextMessagesChannelId++}`,
    );

    messagesChannel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      () => {
        if (active) fetchConversations();
      },
    );

    messagesChannel.subscribe();

    const handleResume = () => {
      if (
        Platform.OS !== "web" ||
        typeof document === "undefined" ||
        document.visibilityState !== "visible"
      ) {
        return;
      }

      fetchConversations();
    };

    fetchConversations();
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleResume);
    }
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.addEventListener("pageshow", handleResume);
    }

    return () => {
      active = false;
      supabase.removeChannel(messagesChannel);
      if (Platform.OS === "web" && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleResume);
      }
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.removeEventListener("pageshow", handleResume);
      }
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setConversations([]);
        return;
      }

      const { data: conversationsData, error } = await supabase
        .from("conversations")
        .select("id, user1_id, user2_id, updated_at")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error || !conversationsData) {
        setConversations([]);
        return;
      }

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
            last_message_time: lastMessage?.created_at ?? "",
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
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 60 || diffHours < 24) return "recent";
    if (diffDays === 1) return "gisteren";
    if (diffDays < 7) return `${diffDays} dagen geleden`;
    if (diffWeeks === 1) return "vorige week";
    if (diffWeeks < 4) return `${diffWeeks} weken geleden`;
    if (diffMonths === 1) return "vorige maand";
    if (diffMonths < 12) return `${diffMonths} maanden geleden`;
    return date.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
  };

  return (
    <PageContainer
      topNavTitle="Chats"
      activeTab="message"
      scrollable={false}
      hideBack
      contentPaddingBottom={0}
    >
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
          ItemSeparatorComponent={() => <YStack height={6} />}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 152 }}
        />
      )}
    </PageContainer>
  );
}
