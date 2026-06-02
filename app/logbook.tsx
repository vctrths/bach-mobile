import PageContainer from "@/components/ui/PageContainer";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl } from "react-native";
import {
  Card,
  Circle,
  Spinner,
  Text,
  XStack,
  YStack,
} from "tamagui";
import Svg, { Circle as SvgCircle } from "react-native-svg";

type RecentLog = {
  id: string;
  date: string;
  description: string;
  imageUrl?: string | null;
};

const DAY_LABELS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function getWeekDays(offset = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + offset * 7);
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function CircularProgress({
  current,
  total,
  size = 89,
}: {
  current: number;
  total: number;
  size?: number;
}) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / total, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <YStack
      width={size}
      height={size}
      justifyContent="center"
      alignItems="center"
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <SvgCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E3ECD7"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <SvgCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="#172211"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <YStack
        width={43}
        height={43}
        borderRadius={21.5}
        backgroundColor="white"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize={14} color="#172211" fontFamily="$Satoshi">
          {current}/{total}
        </Text>
      </YStack>
    </YStack>
  );
}

interface LogbookScreenProps {
  standalone?: boolean;
}

export default function LogbookScreen({ standalone = true }: LogbookScreenProps) {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const today = useMemo(() => new Date(), []);
  const monthName = useMemo(
    () =>
      capitalize(
        weekDays[0].toLocaleDateString("nl-BE", { month: "long" })
      ),
    [weekDays]
  );

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("garden_logs")
        .select("id, title, image_url, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching logs:", error);
        return;
      }

      const camelData = (data || []).map((log) => toCamelCase(log)) as any[];

      const formattedLogs = camelData.map((log) => ({
        id: log.id,
        date: new Date(log.createdAt).toLocaleDateString("nl-BE"),
        description: log.title || "",
        imageUrl: log.imageUrl ?? null,
      }));

      setLogs(formattedLogs);

      const actives = new Set<string>();
      camelData.forEach((log) => {
        actives.add(formatDateKey(new Date(log.createdAt)));
      });
      setActiveDates(actives);

      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() + mondayOffset);
      startOfWeek.setHours(0, 0, 0, 0);

      const weekLogs = camelData.filter(
        (log) => new Date(log.createdAt) >= startOfWeek
      );
      setWeeklyCount(Math.min(weekLogs.length, 4));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const hasLogs = logs.length > 0;

  const content = (
    <YStack gap="$4" paddingBottom="$4" paddingHorizontal="$5">
      <Card
        backgroundColor="#F0F3EC"
        borderColor="#E3ECD7"
        borderWidth={1}
        borderRadius={20}
        padding={16}
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.05)"
      >
        <XStack alignItems="center" gap="$4">
          <CircularProgress current={weeklyCount} total={4} />
          <YStack flex={1} gap="$2">
            <Text
              fontSize={18}
              fontWeight="700"
              color="#172211"
              fontFamily="$Satoshi"
            >
              Jouw wekelijkse{"\n"}progressie
            </Text>
            <Text fontSize={14} color="#172211" fontFamily="$Satoshi">
              probeer wekelijks 4 dagen voor je planten te zorgen
            </Text>
          </YStack>
        </XStack>
      </Card>

      <XStack gap="$4">
        <XStack
          flex={1}
          backgroundColor="#F0F3EC"
          borderRadius={20}
          borderWidth={1}
          borderColor="#E3ECD7"
          padding={16}
          justifyContent="center"
          alignItems="center"
          boxShadow="0px 4px 20px rgba(0, 0, 0, 0.05)"
          onPress={() => router.push("/logbook/opvolgingen" as any)}
          pressStyle={{ scale: 0.96, opacity: 0.8 }}
        >
          <Text
            fontSize={14}
            color="#172211"
            fontFamily="$Satoshi"
            textAlign="center"
          >
            Opvolgingen
          </Text>
        </XStack>
        <XStack
          flex={1}
          backgroundColor="#F0F3EC"
          borderRadius={20}
          borderWidth={1}
          borderColor="#E3ECD7"
          padding={16}
          justifyContent="center"
          alignItems="center"
          boxShadow="0px 4px 20px rgba(0, 0, 0, 0.05)"
          onPress={() => router.push("/logbook/new" as any)}
          pressStyle={{ scale: 0.96, opacity: 0.8 }}
        >
          <Text
            fontSize={14}
            color="#172211"
            fontFamily="$Satoshi"
            textAlign="center"
          >
            Nieuwe log
          </Text>
        </XStack>
      </XStack>

      <Card
        backgroundColor="#F0F3EC"
        borderColor="#E3ECD7"
        borderWidth={1}
        borderRadius={20}
        padding={16}
        gap="$4"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.05)"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <Text
            fontSize={20}
            fontWeight="700"
            color="#172211"
            fontFamily="$Satoshi"
          >
            {monthName}
          </Text>
          <XStack alignItems="center" gap="$3">
            <Pressable onPress={() => setWeekOffset((prev) => prev - 1)}>
              <Ionicons name="chevron-back" size={20} color="#57594D" />
            </Pressable>
            <Pressable onPress={() => setWeekOffset((prev) => prev + 1)}>
              <Ionicons name="chevron-forward" size={20} color="#57594D" />
            </Pressable>
          </XStack>
        </XStack>

        <XStack justifyContent="space-between">
          {weekDays.map((dayDate, index) => {
            const dateKey = formatDateKey(dayDate);
            const isLogged = activeDates.has(dateKey);
            const isToday = isSameDay(dayDate, today);
            const dayLabel = DAY_LABELS[index];
            const dayNum = String(dayDate.getDate()).padStart(2, "0");

            return (
              <Pressable
                key={dateKey}
                onPress={() =>
                  router.push(`/logbook/${dayDate.getDate()}` as any)
                }
              >
                <YStack alignItems="center" gap="$1">
                  <Circle
                    size={8}
                    backgroundColor={isLogged ? "#173300" : "transparent"}
                  />
                  <YStack
                    alignItems="center"
                    gap="$2"
                    padding={8}
                    borderRadius={32}
                    borderWidth={1}
                    borderColor={isToday ? "#173300" : "#EAF0D8"}
                    backgroundColor={isToday ? "#173300" : "white"}
                    minWidth={44}
                  >
                    <Text
                      fontSize={14}
                      color={isToday ? "white" : "rgba(0,0,0,0.6)"}
                      fontFamily="$Satoshi"
                    >
                      {dayLabel}
                    </Text>
                    <Text
                      fontSize={14}
                      color={isToday ? "white" : "#172211"}
                      fontFamily="$Satoshi"
                    >
                      {dayNum}
                    </Text>
                  </YStack>
                </YStack>
              </Pressable>
            );
          })}
        </XStack>
      </Card>

      <YStack gap="$4">
        <Text
          fontSize={20}
          fontWeight="900"
          color="#000000"
          fontFamily="$Satoshi"
        >
          Recente logs
        </Text>

        {loading ? (
          <YStack
            padding="$10"
            justifyContent="center"
            alignItems="center"
          >
            <Spinner size="large" color="$primary" />
          </YStack>
        ) : !hasLogs ? (
          <YStack
            padding="$6"
            alignItems="center"
            gap="$2"
            backgroundColor="rgba(23, 51, 0, 0.03)"
            borderRadius="$6"
          >
            <Ionicons name="leaf-outline" size={48} color="#57594D" />
            <Text color="$secondary" fontSize="$3" textAlign="center">
              het is hier nog heel stil...
            </Text>
          </YStack>
        ) : (
          <YStack gap="$3">
            {logs.map((log) => (
              <Card
                key={log.id}
                backgroundColor="#F0F3EC"
                borderColor="#E3ECD7"
                borderWidth={1}
                borderRadius={16}
                padding={10}
                width="100%"
                boxShadow="0px 4px 20px rgba(23, 51, 0, 0.06)"
                onPress={() =>
                  router.push(`/logbook/${log.id}` as any)
                }
                pressStyle={{ scale: 0.98, opacity: 0.9 }}
              >
                <XStack
                  width="100%"
                  justifyContent="space-between"
                  alignItems="stretch"
                  gap="$3"
                  minHeight={76}
                >
                  <XStack flex={1} alignItems="flex-start" gap="$3" minWidth={0}>
                    <ExpoImage
                      source={
                        log.imageUrl
                          ? { uri: log.imageUrl }
                          : require("@/assets/images/hero.png")
                      }
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: 10,
                      }}
                      contentFit="cover"
                    />
                    <YStack flex={1} minWidth={0} gap={1} paddingTop={0}>
                      <Text
                        fontSize={16}
                        lineHeight={17}
                        fontWeight="700"
                        color="#000000"
                        fontFamily="$Satoshi"
                      >
                        {log.date}
                      </Text>
                      <Text
                        fontSize={14}
                        lineHeight={16}
                        color="rgba(0,0,0,0.6)"
                        fontFamily="$Satoshi"
                        numberOfLines={2}
                      >
                        {log.description}
                      </Text>
                    </YStack>
                  </XStack>

                  <Circle
                    size={40}
                    backgroundColor="white"
                    borderWidth={1}
                    borderColor="#E3ECD7"
                    alignSelf="center"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text
                      fontSize={14}
                      fontWeight="700"
                      color="#172211"
                      fontFamily="$Satoshi"
                    >
                      →
                    </Text>
                  </Circle>
                </XStack>
              </Card>
            ))}
          </YStack>
        )}
      </YStack>
    </YStack>
  );

  if (!standalone) {
    return content;
  }

  return (
    <PageContainer
      hideBack
      topNavTitle={
        <XStack alignItems="center" gap="$3">
          <Circle size={50} overflow="hidden">
            {profile?.profileImage ? (
              <ExpoImage
                source={{ uri: profile.profileImage }}
                style={{ width: 50, height: 50 }}
                contentFit="cover"
              />
            ) : (
              <XStack
                width={50}
                height={50}
                backgroundColor="#E3ECD7"
                justifyContent="center"
                alignItems="center"
              >
                <Ionicons name="person" size={22} color="#57594D" />
              </XStack>
            )}
          </Circle>
          <Text
            fontSize={16}
            fontWeight="700"
            color="#000000"
            fontFamily="$Satoshi"
          >
            {profile?.firstName
              ? `${profile.firstName} ${profile.lastName || ""}`.trim()
              : "Victor Thys"}
          </Text>
        </XStack>
      }
      activeTab="home"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {content}
    </PageContainer>
  );
}
