import PageContainer from "@/components/ui/PageContainer";
import ChatBubble from "@/components/ui/ChatBubble";
import ChatInput from "@/components/ui/ChatInput";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { Spinner, YStack } from "tamagui";

type Message = { id: string; sender_id: string; content: string; created_at: string };
type UserProfile = { first_name: string; last_name: string; profile_image: string | null };

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);
      const { data: conversation } = await supabase.from("conversations").select("user1_id, user2_id").eq("id", id).single();
      if (!conversation) return;
      const partnerId = conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id;
      const { data: profile } = await supabase.from("profiles").select("first_name, last_name, profile_image").eq("id", partnerId).single();
      if (profile) setPartner(profile);
      const { data: msgs } = await supabase.from("messages").select("id, sender_id, content, created_at").eq("conversation_id", id).order("created_at", { ascending: true });
      if (msgs) setMessages(msgs);
      setLoading(false);
    };
    init();
    const messagesChannel = supabase.channel(`conversation-${id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` }, (payload) => { const newMessage = payload.new as Message; setMessages((prev) => [...prev, newMessage]); }).subscribe();
    return () => { supabase.removeChannel(messagesChannel); };
  }, [id]);

  const handleSend = async (content: string) => { if (!id || !currentUserId) return; await supabase.from("messages").insert({ conversation_id: id, sender_id: currentUserId, content }); };
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  const partnerName = partner ? `${partner.first_name} ${partner.last_name}` : "Chat";

  return (
    <PageContainer topNavTitle={partnerName} showBottomNav={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
        {loading ? (
          <YStack flex={1} justifyContent="center" alignItems="center"><Spinner size="large" color="$primary" /></YStack>
        ) : (
          <FlatList data={messages} keyExtractor={(item) => item.id} renderItem={({ item }) => <ChatBubble content={item.content} isOwn={item.sender_id === currentUserId} timestamp={formatTime(item.created_at)} />} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }} style={{ flex: 1 }} />
        )}
        <YStack paddingHorizontal="$4" paddingBottom="$4"><ChatInput onSend={handleSend} /></YStack>
      </KeyboardAvoidingView>
    </PageContainer>
  );
}
