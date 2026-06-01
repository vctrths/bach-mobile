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
  dueDate: string | null;
  createdAt: string;
  completed: boolean;
  status: Record<string, unknown>;
};

type LogStatus = {
  followUps?: unknown;
  completedFollowUps?: unknown;
};

type FollowUpValue = {
  text: string;
  dueDate: string | null;
};

function getFollowUps(status: LogStatus | null | undefined) {
  if (!Array.isArray(status?.followUps)) {
    return [];
  }

  return status.followUps
    .map((item): FollowUpValue | null => {
      if (typeof item === "string") {
        const text = item.trim();
        return text ? { text, dueDate: null } : null;
      }

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const followUp = item as Record<string, unknown>;
      const text = typeof followUp.text === "string" ? followUp.text.trim() : "";
      if (!text) return null;

      return {
        text,
        dueDate:
          typeof followUp.dueDate === "string" && followUp.dueDate
            ? followUp.dueDate
            : null,
      };
    })
    .filter((item): item is FollowUpValue => item !== null);
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

function parseDateOnly(date: string | null) {
  if (!date) return null;
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function getStartOfWeek(date: Date) {
  const nextDate = new Date(date);
  const dayOfWeek = nextDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  nextDate.setDate(nextDate.getDate() + mondayOffset);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function getWeekOffset(date: Date) {
  const todayWeek = getStartOfWeek(new Date());
  const targetWeek = getStartOfWeek(date);
  const diffMs = targetWeek.getTime() - todayWeek.getTime();
  return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
}

function getOpenTodoGroups(todos: FollowUpTodo[]) {
  const groups = [
    { key: "this-week", title: "Deze week", todos: [] as FollowUpTodo[] },
    { key: "next-week", title: "Volgende week", todos: [] as FollowUpTodo[] },
    { key: "previous-week", title: "Vorige week", todos: [] as FollowUpTodo[] },
    { key: "later", title: "Later", todos: [] as FollowUpTodo[] },
    { key: "earlier", title: "Eerder", todos: [] as FollowUpTodo[] },
    { key: "no-date", title: "Zonder datum", todos: [] as FollowUpTodo[] },
  ];

  todos.forEach((todo) => {
    const dueDate = parseDateOnly(todo.dueDate);
    if (!dueDate) {
      groups[5].todos.push(todo);
      return;
    }

    const weekOffset = getWeekOffset(dueDate);
    if (weekOffset === 0) groups[0].todos.push(todo);
    else if (weekOffset === 1) groups[1].todos.push(todo);
    else if (weekOffset === -1) groups[2].todos.push(todo);
    else if (weekOffset > 1) groups[3].todos.push(todo);
    else groups[4].todos.push(todo);
  });

  return groups
    .map((group) => ({
      ...group,
      todos: group.todos.sort((a, b) => {
        const aDate =
          parseDateOnly(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bDate =
          parseDateOnly(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      }),
    }))
    .filter((group) => group.todos.length > 0);
}

function formatTodoDate(date: string | null) {
  if (!date) return "Geen do-datum";
  const parsedDate = parseDateOnly(date);
  if (!parsedDate) return "Geen do-datum";

  return parsedDate.toLocaleDateString("nl-BE", {
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

          return followUps.map((followUp, index) => ({
            id: `${log.id}-${index}`,
            logId: log.id,
            index,
            text: followUp.text,
            date: formatTodoDate(followUp.dueDate),
            dueDate: followUp.dueDate,
            createdAt: log.createdAt,
            completed: completedFollowUps.includes(index),
            status,
          }));
        })
        .sort((a, b) => {
          const aDate =
            parseDateOnly(a.dueDate)?.getTime() ??
            new Date(a.createdAt).getTime();
          const bDate =
            parseDateOnly(b.dueDate)?.getTime() ??
            new Date(b.createdAt).getTime();
          return aDate - bDate;
        });

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
  const openTodoGroups = getOpenTodoGroups(openTodos);

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
              {openTodoGroups.map((group) => (
                <TodoListSection
                  key={group.key}
                  title={group.title}
                  todos={group.todos}
                  onToggleCompleted={toggleCompleted}
                />
              ))}

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
