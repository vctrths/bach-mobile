import Button from "@/components/ui/Button";
import GardenCard from "@/components/ui/GardenCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { supabase } from "@/utils/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { Card, Spinner, Text, XStack, YStack } from "tamagui";
import { type Garden } from "@/types/garden";

type ApprovedGardener = {
  id: string;
  garden_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  profile_image: string | null;
  days: string[];
};

type GardenRequest = {
  id: string;
  garden_id: string;
  user_id: string;
  motivation: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const DAY_LETTERS = ["M", "D", "W", "D", "V", "Z", "Z"];

const DAY_KEY_TO_INDEX: Record<string, number> = {
  M: 0,   // maandag
  D: 1,   // dinsdag
  W: 2,   // woensdag
  Do: 3,  // donderdag
  V: 4,   // vrijdag
  Za: 5,  // zaterdag
  Zo: 6,  // zondag
};

function getActiveDayIndices(days: string[]): Set<number> {
  const indices = new Set<number>();
  for (const day of days) {
    const index = DAY_KEY_TO_INDEX[day];
    if (index !== undefined) {
      indices.add(index);
    }
  }
  return indices;
}

export default function OwnerView() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [gardeners, setGardeners] = useState<ApprovedGardener[]>([]);
  const [requests, setRequests] = useState<GardenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const todayIndex = new Date().getDay();
  const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const gardensRes = await supabase
        .from("gardens")
        .select("id, name, rating, location, image_url")
        .eq("owner_id", user.id)
        .limit(10);

      if (gardensRes.data) setGardens(gardensRes.data as Garden[]);

      const gardenIds = (gardensRes.data as unknown as Garden[] ?? []).map((g) => g.id);

      if (gardenIds.length === 0) {
        setGardeners([]);
        setRequests([]);
        return;
      }

      const [gardenersRes, requestsRes] = await Promise.all([
        supabase
          .from("garden_requests")
          .select(
            `id, garden_id, user_id, days, profiles(first_name, last_name, profile_image)`
          )
          .eq("status", "approved")
          .in("garden_id", gardenIds)
          .limit(20),
        supabase
          .from("garden_requests")
          .select(
            `id, garden_id, user_id, motivation, status, created_at, profiles(first_name, last_name, profile_image)`
          )
          .eq("status", "pending")
          .in("garden_id", gardenIds)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (gardenersRes.data) {
        const mappedGardeners = (gardenersRes.data as any[]).map((r) => ({
          id: r.id,
          garden_id: r.garden_id,
          user_id: r.user_id,
          first_name: r.profiles?.first_name ?? "Tuinzoeker",
          last_name: r.profiles?.last_name ?? "",
          profile_image: r.profiles?.profile_image ?? null,
          days: r.days ?? [],
        }));
        setGardeners(mappedGardeners);
      }

      if (requestsRes.data) {
        setRequests(requestsRes.data as unknown as GardenRequest[]);
      }
    } catch (error) {
      console.error("Error fetching owner dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const locationText = gardens[0]?.location ?? "Leuven, BE";

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <YStack paddingHorizontal="$4" paddingBottom="$4" gap="$6">
        <DashboardHeader
          title="Locatie"
          location={locationText}
          searchPlaceholder="Zoeken naar een tuin"
        />

        {loading ? (
          <XStack padding="$10" justifyContent="center">
            <Spinner size="large" color="$primary" />
          </XStack>
        ) : (
          <>
            {/* Tuinen Section */}
            <YStack gap="$2">
              <Text fontSize={24} fontWeight="900" color="$text_dark">
                Tuinen
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$4">
                  {gardens.map((garden) => (
                    <GardenCard
                      key={garden.id}
                      garden={garden}
                      onPress={() =>
                        router.push(("/garden/" + garden.id) as any)
                      }
                    />
                  ))}
                  <Card
                    width={160}
                    height={180}
                    backgroundColor="$primary"
                    borderRadius="$6"
                    justifyContent="center"
                    alignItems="center"
                    onPress={() => router.push("/garden/create")}
                    pressStyle={{ scale: 0.98, opacity: 0.8 }}
                  >
                    <Ionicons name="add" size={40} color="white" />
                    <Text color="white" fontSize="$3" marginTop="$2">
                      Tuin toevoegen
                    </Text>
                  </Card>
                </XStack>
              </ScrollView>
            </YStack>

            {/* Jouw Planning Section */}
            {gardeners.length > 0 && (
              <YStack gap="$2">
                <Text fontSize={24} fontWeight="900" color="$text_dark">
                  Jouw planning
                </Text>

                <YStack gap="$3" padding="$2">
                  {/* Day header row */}
                  <XStack alignItems="center" gap="$1">
                    <Text
                      width={56}
                      color="#56594D"
                      fontSize={16}
                      fontWeight="500"
                    >
                      Dag
                    </Text>
                    {DAY_LETTERS.map((letter, i) => (
                      <YStack
                        key={i}
                        flex={1}
                        alignItems="center"
                        justifyContent="center"
                        height={32}
                        borderRadius={16}
                        backgroundColor={
                          i === adjustedTodayIndex ? "#173300" : "transparent"
                        }
                        opacity={i === adjustedTodayIndex ? 1 : 0.4}
                      >
                        <Text
                          color={
                            i === adjustedTodayIndex ? "#F5FFF3" : "#36392B"
                          }
                          fontSize={16}
                          fontWeight={i === adjustedTodayIndex ? "900" : "500"}
                        >
                          {letter}
                        </Text>
                      </YStack>
                    ))}
                  </XStack>

                  {/* Gardener rows */}
                  {gardeners.map((gardener) => (
                    <XStack key={gardener.id} alignItems="center" gap="$1">
                      <Text
                        width={56}
                        color="#56594D"
                        fontSize={16}
                        fontWeight="500"
                        numberOfLines={1}
                      >
                        {gardener.first_name}
                      </Text>
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                        const activeDays = getActiveDayIndices(gardener.days);
                        const isActive = activeDays.has(i);
                        return (
                          <YStack
                            key={i}
                            flex={1}
                            alignItems="center"
                            justifyContent="center"
                            height={32}
                          >
                            {isActive ? (
                              <YStack
                                width={32}
                                height={32}
                                borderRadius={16}
                                backgroundColor="#FFEDB3"
                                style={{
                                  shadowColor: "#FFE696",
                                  shadowOffset: { width: 0, height: 0 },
                                  shadowOpacity: 1,
                                  shadowRadius: 2,
                                  elevation: 2,
                                }}
                              />
                            ) : (
                              <YStack
                                width={32}
                                height={32}
                                borderRadius={16}
                                backgroundColor="transparent"
                              />
                            )}
                          </YStack>
                        );
                      })}
                    </XStack>
                  ))}
                </YStack>
              </YStack>
            )}

            {/* Openstaande aanvragen */}
            {requests.length > 0 && (
              <YStack gap="$2">
                <Text fontSize={24} fontWeight="900" color="$text_dark">
                  Openstaande aanvragen ({requests.length})
                </Text>
                {requests.map((request) => (
                  <Card
                    key={request.id}
                    backgroundColor="white"
                    borderColor="#E3ECD7"
                    borderWidth={1}
                    borderRadius={16}
                    padding="$3"
                    marginBottom="$2"
                    onPress={() =>
                      router.push(`/garden/${request.garden_id}`)
                    }
                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                  >
                    <YStack gap="$2">
                      <XStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text
                          fontSize="$4"
                          fontWeight="bold"
                          color="$text_dark"
                        >
                          Aanvraag voor tuin
                        </Text>
                        <Text fontSize="$2" color="#56594D">
                          {new Date(request.created_at).toLocaleDateString(
                            "nl-NL"
                          )}
                        </Text>
                      </XStack>
                      <Text
                        fontSize="$3"
                        color="#56594D"
                        numberOfLines={2}
                      >
                        {request.motivation}
                      </Text>
                    </YStack>
                  </Card>
                ))}
              </YStack>
            )}

            {/* Empty state */}
            {gardens.length === 0 && (
              <YStack padding="$10" alignItems="center" gap="$4">
                <MaterialCommunityIcons
                  name="tree-outline"
                  size={64}
                  color="#56594D"
                />
                <Text fontSize="$4" color="$text_dark" textAlign="center">
                  Je hebt nog geen tuinen
                </Text>
                <Button
                  label="Tuin toevoegen"
                  size="$4"
                  backgroundColor="#173300"
                  onPress={() => router.push("/garden/create")}
                />
              </YStack>
            )}
          </>
        )}
      </YStack>
    </ScrollView>
  );
}
