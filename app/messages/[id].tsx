import ChatBubble from "@/components/ui/ChatBubble";
import ChatInput from "@/components/ui/ChatInput";
import PageContainer from "@/components/ui/PageContainer";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { Spinner, YStack } from "tamagui";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};
type UserProfile = {
  first_name: string;
  last_name: string;
  profile_image: string | null;
};

let nextConversationChannelId = 0;

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const messagesSetRef = useRef<Set<string>>(new Set());

  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;
    const messagesChannel = supabase.channel(
      `conversation-${id}:${nextConversationChannelId++}`,
    );

    messagesChannel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${id}`,
      },
      (payload) => {
        if (!active) return;

        const newMessage = payload.new as Message;
        if (!messagesSetRef.current.has(newMessage.id)) {
          messagesSetRef.current.add(newMessage.id);
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        }
      },
    );

    messagesChannel.subscribe();

    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!active) return;

        if (!user) {
          setCurrentUserId(null);
          setMessages([]);
          setPartner(null);
          return;
        }

        setCurrentUserId(user.id);
        const { data: conversation } = await supabase
          .from("conversations")
          .select("user1_id, user2_id")
          .eq("id", id)
          .single();
        if (!active) return;

        if (!conversation) {
          setMessages([]);
          setPartner(null);
          return;
        }

        const partnerId =
          conversation.user1_id === user.id
            ? conversation.user2_id
            : conversation.user1_id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, profile_image")
          .eq("id", partnerId)
          .single();
        if (!active) return;

        if (profile) setPartner(profile);
        const { data: msgs } = await supabase
          .from("messages")
          .select("id, sender_id, content, created_at")
          .eq("conversation_id", id)
          .order("created_at", { ascending: true });
        if (!active) return;

        if (msgs) {
          messagesSetRef.current = new Set(msgs.map((m) => m.id));
          setMessages(msgs);
          scrollToBottom(false);
        }
      } catch (error) {
        console.error("Error fetching chat detail:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const handleResume = () => {
      if (
        Platform.OS !== "web" ||
        typeof document === "undefined" ||
        document.visibilityState !== "visible"
      ) {
        return;
      }

      init();
    };

    init();
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
  }, [id, scrollToBottom]);

  const handleSend = async (content: string) => {
    if (!id || !currentUserId) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
    };
    messagesSetRef.current.add(tempId);
    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();
    const { data } = await supabase
      .from("messages")
      .insert({ conversation_id: id, sender_id: currentUserId, content })
      .select("id, sender_id, content, created_at")
      .single();
    if (data) {
      messagesSetRef.current.delete(tempId);
      messagesSetRef.current.add(data.id);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)));
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const partnerName = partner
    ? `${partner.first_name} ${partner.last_name}`
    : "Chat";

  return (
    <PageContainer
      topNavTitle={partnerName}
      showBottomNav={true}
      activeTab="message"
      scrollable={false}
      contentPaddingBottom={0}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {loading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner size="large" color="$primary" />
          </YStack>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                content={item.content}
                isOwn={item.sender_id === currentUserId}
                timestamp={formatTime(item.created_at)}
              />
            )}
            contentContainerStyle={{
              padding: 16,
              gap: 12,
              paddingBottom: 100,
            }}
            style={{ flex: 1 }}
            onContentSizeChange={() => scrollToBottom(false)}
          />
        )}
        <YStack paddingHorizontal="$4" paddingBottom={100}>
          <ChatInput onSend={handleSend} />
        </YStack>
      </KeyboardAvoidingView>
    </PageContainer>
  );
}
