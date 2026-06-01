import PageContainer from "@/components/ui/PageContainer";
import ScreenContent from "@/components/ui/ScreenContent";
import { useAlerts } from "@/context/AlertContext";
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
  index: number;
  text: string;
  date: string;
  createdAt: string;
  completed: boolean;
  status: Record<string, unknown>;
};

type LogStatus = {
  followUps?: unknown;
  completedFollowUps?: unknown;
};

function getFollowUps(status: LogStatus | null | undefined) {
  if (!Array.isArray(status?.followUps)) {
    return [];
  }

  return status.followUps.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
}

function getCompletedFollowUps(status: LogStatus | null | undefined) {
  if (!Array.isArray(status?.completedFollowUps)) {
    return [];
  }

  return status.completedFollowUps.filter(
    (item): item is number => typeof item === "number",
  );
}

function normalizeStatus(status: unknown): Record<string, unknown> {
  if (!status || Array.isArray(status) || typeof status !== "object") {
    return {};
  }

  return status as Record<string, unknown>;
}

function formatTodoDate(date: string) {
  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function FollowUpsScreen() {
  const { alert } = useAlerts();
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
          const status = normalizeStatus(log.status);
          const followUps = getFollowUps(status);
          const completedFollowUps = getCompletedFollowUps(status);

          return followUps.map((text, index) => ({
            id: `${log.id}-${index}`,
            logId: log.id,
            index,
            text,
            date: formatTodoDate(log.createdAt),
            createdAt: log.createdAt,
            completed: completedFollowUps.includes(index),
            status,
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

  const toggleCompleted = async (todo: FollowUpTodo) => {
    const nextCompleted = !todo.completed;
    const previousTodos = todos;

    const logTodos = todos.filter((item) => item.logId === todo.logId);
    const completedFollowUps = logTodos
      .filter((item) =>
        item.id === todo.id ? nextCompleted : item.completed,
      )
      .map((item) => item.index);
    const nextStatus = {
      ...todo.status,
      completedFollowUps,
    };

    setTodos((currentTodos) =>
      currentTodos.map((item) =>
        item.id === todo.id
          ? { ...item, completed: nextCompleted, status: nextStatus }
          : item.logId === todo.logId
            ? { ...item, status: nextStatus }
            : item,
      ),
    );

    let query = supabase
      .from("garden_logs")
      .update({ status: nextStatus })
      .eq("id", todo.logId);

    if (user?.id) {
      query = query.eq("user_id", user.id);
    }

    const { error } = await query;

    if (error) {
      setTodos(previousTodos);
      alert(
        "Niet opgeslagen",
        "We konden deze opvolging niet bijwerken. Probeer het opnieuw.",
      );
    }
  };

  const openTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <PageContainer
      topNavTitle="Takenlijst"
      activeTab="todo"
      bottomNavShortcut="todo"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ScreenContent paddingTop="$4" gap="$0">
        <YStack gap={32}>
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
                color="#172211"
              />
              <Text color="#172211" fontSize={16} textAlign="center">
                geen open opvolgingen gevonden
              </Text>
            </YStack>
          ) : (
            <>
              {openTodos.length > 0 && (
                <TodoListSection
                  title="Deze week"
                  todos={openTodos}
                  onToggleCompleted={toggleCompleted}
                />
              )}

              {completedTodos.length > 0 && (
                <TodoListSection
                  title="Afgewerkt"
                  todos={completedTodos}
                  onToggleCompleted={toggleCompleted}
                />
              )}
            </>
          )}
        </YStack>
      </ScreenContent>
    </PageContainer>
  );
}

function TodoListSection({
  title,
  todos,
  onToggleCompleted,
}: {
  title: string;
  todos: FollowUpTodo[];
  onToggleCompleted: (todo: FollowUpTodo) => void;
}) {
  return (
    <YStack gap={8}>
      <Text
        fontSize={16}
        fontWeight="700"
        color="#000000"
        fontFamily="$Satoshi"
      >
        {title}
      </Text>

      {todos.map((todo) => (
        <Card
          key={todo.id}
          backgroundColor="#F9F9F9"
          borderRadius={16}
          padding={16}
          opacity={todo.completed ? 0.68 : 1}
          onPress={() => router.push(`/logbook/${todo.logId}` as any)}
          pressStyle={{ scale: 0.98, opacity: 0.9 }}
        >
          <XStack gap={16} alignItems="center">
            <Circle
              size={20}
              borderWidth={3}
              borderColor="#172211"
              backgroundColor={todo.completed ? "#173300" : "white"}
              justifyContent="center"
              alignItems="center"
              onPress={(event) => {
                event?.stopPropagation?.();
                onToggleCompleted(todo);
              }}
              pressStyle={{ scale: 0.9, opacity: 0.8 }}
            >
              {todo.completed && (
                <Ionicons name="checkmark" size={12} color="white" />
              )}
            </Circle>
            <YStack flex={1} gap={5} minWidth={0}>
              <Text
                fontSize={16}
                lineHeight={20}
                color="#172211"
                fontWeight="400"
                fontFamily="$Satoshi"
              >
                {todo.date}
              </Text>
              <Text
                fontSize={16}
                lineHeight={20}
                color="#000000"
                fontWeight="700"
                fontFamily="$Satoshi"
                textDecorationLine={todo.completed ? "line-through" : "none"}
              >
                {todo.text}
              </Text>
            </YStack>
          </XStack>
        </Card>
      ))}
    </YStack>
  );
}
