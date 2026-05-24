import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import ScreenContent from "@/components/ui/ScreenContent";
import { supabase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView } from "react-native";
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
  image_url?: string | null;
};

const DAYS = [
  { key: "Ma", label: "Ma", date: 1 },
  { key: "Di", label: "Di", date: 2 },
  { key: "Wo", label: "Wo", date: 3 },
  { key: "Do", label: "Do", date: 4 },
  { key: "Vr", label: "Vr", date: 5 },
  { key: "Za", label: "Za", date: 6 },
  { key: "Zo", label: "Zo", date: 7 },
];

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
        <Text fontSize={14} color="#172211" fontFamily="Inter">
          {current}/{total}
        </Text>
      </YStack>
    </YStack>
  );
}

export default function LogbookScreen() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyCount, setWeeklyCount] = useState(0);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("garden_logs")
        .select("id, title, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching logs:", error);
        return;
      }

      const formattedLogs = (data || []).map((log) => ({
        id: log.id,
        date: new Date(log.created_at).toLocaleDateString("nl-BE"),
        description: log.title || "",
        image_url: null,
      }));

      setLogs(formattedLogs);

      // Count this week's logs
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      const weekLogs = (data || []).filter(
        (log) => new Date(log.created_at) >= startOfWeek
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

  return (
    <ThemedSafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ScreenContent>
          <TopNavPill
            hideBack
            title={
              <XStack alignItems="center" gap="$3">
                <Circle size={50} overflow="hidden">
                  {profile?.profile_image ? (
                    <ExpoImage
                      source={{ uri: profile.profile_image }}
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
                  fontFamily="Inter"
                >
                  {profile?.first_name
                    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
                    : "Victor Thys"}
                </Text>
              </XStack>
            }
          />

          {/* Weekly Progress Card */}
          <Card
            backgroundColor="#F0F3EC"
            borderColor="#E3ECD7"
            borderWidth={1}
            borderRadius={20}
            padding={16}
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={20}
            shadowOffset={{ width: 0, height: 4 }}
          >
            <XStack alignItems="center" gap="$4">
              <CircularProgress current={weeklyCount} total={4} />
              <YStack flex={1} gap="$2">
                <Text
                  fontSize={18}
                  fontWeight="700"
                  color="#172211"
                  fontFamily="Satoshi"
                >
                  Jouw wekelijkse{"\n"}progressie
                </Text>
                <Text fontSize={14} color="#172211" fontFamily="Satoshi">
                  probeer wekelijks 4 dagen voor je planten te zorgen
                </Text>
              </YStack>
            </XStack>
          </Card>

          {/* Action Buttons */}
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
              shadowColor="#000"
              shadowOpacity={0.05}
              shadowRadius={20}
              shadowOffset={{ width: 0, height: 4 }}
            >
              <Text
                fontSize={14}
                color="#172211"
                fontFamily="Satoshi"
                textAlign="center"
              >
                Logboek
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
              shadowColor="#000"
              shadowOpacity={0.05}
              shadowRadius={20}
              shadowOffset={{ width: 0, height: 4 }}
              onPress={() => router.push("/logbook/new" as any)}
              pressStyle={{ scale: 0.96, opacity: 0.8 }}
            >
              <Text
                fontSize={14}
                color="#172211"
                fontFamily="Satoshi"
                textAlign="center"
              >
                Nieuwe log
              </Text>
            </XStack>
          </XStack>

          {/* Mini Calendar */}
          <Card
            backgroundColor="#F0F3EC"
            borderColor="#E3ECD7"
            borderWidth={1}
            borderRadius={20}
            padding={16}
            gap="$4"
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={20}
            shadowOffset={{ width: 0, height: 4 }}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text
                fontSize={20}
                fontWeight="700"
                color="#172211"
                fontFamily="Satoshi"
              >
                Januari
              </Text>
              <Ionicons name="chevron-down" size={18} color="#57594D" />
            </XStack>

            <XStack justifyContent="space-between">
              {DAYS.map((day) => {
                const isLogged = [1, 3, 5].includes(day.date);
                return (
                  <Pressable
                    key={day.key}
                    onPress={() =>
                      router.push(`/logbook/${day.date}` as any)
                    }
                  >
                    <YStack alignItems="center" gap="$1">
                      {isLogged && (
                        <Circle
                          size={8}
                          backgroundColor="#173300"
                        />
                      )}
                      <YStack
                        alignItems="center"
                        gap="$2"
                        padding={8}
                        borderRadius={32}
                        borderWidth={1}
                        borderColor="#EAF0D8"
                        backgroundColor="white"
                        minWidth={44}
                      >
                        <Text
                          fontSize={14}
                          color="rgba(0,0,0,0.6)"
                          fontFamily="Inter"
                        >
                          {day.key}
                        </Text>
                        <Text
                          fontSize={14}
                          color="#172211"
                          fontFamily="Inter"
                        >
                          {String(day.date).padStart(2, "0")}
                        </Text>
                      </YStack>
                    </YStack>
                  </Pressable>
                );
              })}
            </XStack>
          </Card>

          {/* Recent Logs */}
          <YStack gap="$4">
            <Text
              fontSize={20}
              fontWeight="900"
              color="#000000"
              fontFamily="Inter"
            >
              Recente logs
            </Text>

            {loading ? (
              <YStack
                padding="$10"
                justifyContent="center"
                alignItems="center"
              >
                <Spinner size="large" color="primary" />
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
                <Text color="secondary" fontSize="$3" textAlign="center">
                  het is hier nog heel stil...
                </Text>
              </YStack>
            ) : (
              <YStack gap="$3">
                {logs.map((log) => (
                  <XStack
                    key={log.id}
                    backgroundColor="#F0F3EC"
                    borderColor="#EAF0D8"
                    borderWidth={1}
                    borderRadius={12}
                    padding={8}
                    justifyContent="space-between"
                    alignItems="center"
                    onPress={() =>
                      router.push(`/logbook/${log.id}` as any)
                    }
                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                  >
                    <XStack alignItems="center" gap="$2">
                      <ExpoImage
                        source={require("@/assets/images/hero.png")}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 7,
                        }}
                        contentFit="cover"
                      />
                      <YStack gap="$2" width={175}>
                        <Text
                          fontSize={18}
                          fontWeight="700"
                          color="#000000"
                          fontFamily="Satoshi"
                        >
                          {log.date}
                        </Text>
                        <Text
                          fontSize={14}
                          color="rgba(0,0,0,0.6)"
                          fontFamily="Satoshi"
                          numberOfLines={2}
                        >
                          {log.description}
                        </Text>
                      </YStack>
                    </XStack>
                    <XStack
                      width={32}
                      height={32}
                      borderRadius={8}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Circle
                        size={48}
                        backgroundColor="white"
                        borderWidth={1}
                        borderColor="#E3ECD7"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Text
                          fontSize={14}
                          fontWeight="700"
                          color="#172211"
                          fontFamily="Inter"
                        >
                          →
                        </Text>
                      </Circle>
                    </XStack>
                  </XStack>
                ))}
              </YStack>
            )}
          </YStack>
        </ScreenContent>
      </ScrollView>

      <BottomNav
        activeTab="home"
        onMessagePress={() => router.push("/messages" as any)}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
