import PageContainer from "@/components/ui/PageContainer";
import ScreenContent from "@/components/ui/ScreenContent";
import { useAuth } from "@/context/AuthContext";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import { Card, Circle, Spinner, Text, XStack, YStack } from "tamagui";

type FollowUpTodo = {
  id: string;
  logId: string;
  text: string;
  logTitle: string;
  date: string;
  createdAt: string;
};

type LogStatus = {
  followUps?: unknown;
};

function getFollowUps(status: LogStatus | null | undefined) {
  if (!Array.isArray(status?.followUps)) {
    return [];
  }

  return status.followUps.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
}

function formatOpenCount(count: number) {
  return `${count} open opvolging${count === 1 ? "" : "en"}`;
}

export default function FollowUpsScreen() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<FollowUpTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFollowUps = useCallback(async () => {
    try {
      let query = supabase
        .from("garden_logs")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false });

      if (user?.id) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching follow-ups:", error);
        return;
      }

      const nextTodos = ((data || []).map((log) => toCamelCase<any>(log)) || [])
        .flatMap((log) => {
          const followUps = getFollowUps(log.status);
          return followUps.map((text, index) => ({
            id: `${log.id}-${index}`,
            logId: log.id,
            text,
            logTitle: log.title || "Log",
            date: new Date(log.createdAt).toLocaleDateString("nl-BE", {
              day: "2-digit",
              month: "short",
            }),
            createdAt: log.createdAt,
          }));
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      setTodos(nextTodos);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFollowUps();
  };

  return (
    <PageContainer
      topNavTitle="Opvolgingen"
      activeTab="home"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ScreenContent>
        <YStack gap="$4">
          <Card
            backgroundColor="#F0F3EC"
            borderColor="#E3ECD7"
            borderWidth={1}
            borderRadius={20}
            padding={16}
            boxShadow="0px 4px 20px rgba(23, 51, 0, 0.05)"
          >
            <XStack alignItems="center" gap="$4">
              <Circle
                size={52}
                backgroundColor="#173300"
                justifyContent="center"
                alignItems="center"
              >
                <Ionicons name="list" size={24} color="white" />
              </Circle>
              <YStack flex={1} gap="$1">
                <Text
                  fontSize={20}
                  fontWeight="900"
                  color="#172211"
                  fontFamily="$Satoshi"
                >
                  {formatOpenCount(todos.length)}
                </Text>
                <Text fontSize={14} color="#57594D" fontFamily="$Satoshi">
                  taken uit je logboek, verzameld op een plek
                </Text>
              </YStack>
            </XStack>
          </Card>

          {loading ? (
            <YStack padding="$10" justifyContent="center" alignItems="center">
              <Spinner size="large" color="$primary" />
            </YStack>
          ) : todos.length === 0 ? (
            <YStack
              padding="$6"
              alignItems="center"
              gap="$2"
              backgroundColor="rgba(23, 51, 0, 0.03)"
              borderRadius="$6"
            >
              <Ionicons
                name="checkmark-done-outline"
                size={48}
                color="#57594D"
              />
              <Text color="$secondary" fontSize="$3" textAlign="center">
                geen open opvolgingen gevonden
              </Text>
            </YStack>
          ) : (
            <YStack gap="$3">
              {todos.map((todo) => (
                <Card
                  key={todo.id}
                  backgroundColor="white"
                  borderColor="rgba(23, 51, 0, 0.1)"
                  borderWidth={1}
                  borderRadius={16}
                  padding={14}
                  boxShadow="0px 4px 20px rgba(23, 51, 0, 0.05)"
                  onPress={() => router.push(`/logbook/${todo.logId}` as any)}
                  pressStyle={{ scale: 0.98, opacity: 0.9 }}
                >
                  <XStack gap="$3" alignItems="flex-start">
                    <Circle
                      size={24}
                      borderWidth={2}
                      borderColor="#173300"
                      backgroundColor="white"
                      marginTop={1}
                    />
                    <YStack flex={1} gap="$2" minWidth={0}>
                      <Text
                        fontSize={16}
                        lineHeight={22}
                        color="#172211"
                        fontWeight="700"
                        fontFamily="$Satoshi"
                      >
                        {todo.text}
                      </Text>
                      <XStack alignItems="center" gap="$2" flexWrap="wrap">
                        <Text fontSize={13} color="#57594D" fontFamily="$Satoshi">
                          {todo.date}
                        </Text>
                        <Text fontSize={13} color="#A9A99E" fontFamily="$Satoshi">
                          -
                        </Text>
                        <Text
                          fontSize={13}
                          color="#57594D"
                          fontFamily="$Satoshi"
                          numberOfLines={1}
                        >
                          {todo.logTitle}
                        </Text>
                      </XStack>
                    </YStack>
                    <Ionicons name="chevron-forward" size={18} color="#A9A99E" />
                  </XStack>
                </Card>
              ))}
            </YStack>
          )}
        </YStack>
      </ScreenContent>
    </PageContainer>
  );
}
