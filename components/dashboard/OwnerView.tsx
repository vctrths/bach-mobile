import Button from "@/components/ui/Button";
import GardenCard from "@/components/ui/GardenCard";
import { type Garden } from "@/types/garden";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { Card, Circle, Spinner, Text, XStack, YStack } from "tamagui";

type ApprovedGardener = {
  id: string;
  gardenId: string;
  gardenerId: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  days: string[];
  gardenName?: string;
};

type GardenRequest = {
  id: string;
  gardenId: string;
  userId: string;
  motivation: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  days: string[];
  startDate: string | null;
  collaborationType: string | null;
  profiles: {
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
};

const DAY_LETTERS = ["M", "D", "W", "D", "V", "Z", "Z"];

const DAY_KEY_TO_INDEX: Record<string, number> = {
  M: 0,
  D: 1,
  W: 2,
  Do: 3,
  V: 4,
  Za: 5,
  Zo: 6,
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
        .select("id, name, location, image_url, owner:profiles!owner_id(rating)")
        .eq("owner_id", user.id)
        .limit(10);

      if (gardensRes.data) {
        setGardens(gardensRes.data.map((g) => toCamelCase(g)) as Garden[]);
      }

      const gardenIds = (gardensRes.data ?? []).map((g) => g.id);

      if (gardenIds.length === 0) {
        setGardeners([]);
        setRequests([]);
        return;
      }

      const [collaborationsRes, requestsRes] = await Promise.all([
        supabase
          .from("collaborations")
          .select(
            `id, garden_id, gardener_id, days, profiles:gardener_id(first_name, last_name, profile_image), gardens(name)`
          )
          .eq("status", "active")
          .eq("owner_id", user.id)
          .limit(20),
        supabase
          .from("garden_requests")
          .select(
            `id, garden_id, user_id, motivation, status, created_at, days, start_date, collaboration_type, profiles(first_name, last_name, profile_image)`,
          )
          .eq("status", "pending")
          .in("garden_id", gardenIds)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (collaborationsRes.data) {
        const mappedGardeners = (collaborationsRes.data as any[]).map((r) => {
          const camelProfiles = toCamelCase(r.profiles || {}) as any;
          const camelGardens = toCamelCase(r.gardens || {}) as any;
          return {
            id: r.id,
            gardenId: r.garden_id,
            gardenerId: r.gardener_id,
            firstName: camelProfiles?.firstName ?? "Tuinzoeker",
            lastName: camelProfiles?.lastName ?? "",
            profileImage: camelProfiles?.profileImage ?? null,
            days: r.days ?? [],
            gardenName: camelGardens?.name ?? "Onbekende tuin",
          };
        });
        setGardeners(mappedGardeners);
      }

      if (requestsRes.data) {
        setRequests(
          requestsRes.data.map((r) => {
            const camel = toCamelCase(r) as any;
            return {
              ...camel,
              profiles: toCamelCase(r.profiles || {}),
            };
          }) as unknown as GardenRequest[],
        );
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

  const findOrCreateConversation = async (
    ownerId: string,
    gardenerId: string
  ) => {
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${ownerId},user2_id.eq.${gardenerId}),and(user1_id.eq.${gardenerId},user2_id.eq.${ownerId})`
      )
      .maybeSingle();

    if (existing) return existing.id;

    const { data: newConv } = await supabase
      .from("conversations")
      .insert({ user1_id: ownerId, user2_id: gardenerId })
      .select("id")
      .single();

    return newConv?.id;
  };

  const handleChat = async (request: GardenRequest) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const conversationId = await findOrCreateConversation(
      user.id,
      request.userId
    );
    if (conversationId) {
      router.push(`/messages/${conversationId}` as any);
    }
  };

  const handleAccept = async (request: GardenRequest) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setRequests((prev) => prev.filter((r) => r.id !== request.id));

      await supabase
        .from("garden_requests")
        .update({ status: "approved" })
        .eq("id", request.id);

      await supabase.from("collaborations").insert({
        garden_id: request.gardenId,
        gardener_id: request.userId,
        owner_id: user.id,
        request_id: request.id,
        days: request.days ?? [],
        start_date: request.startDate ?? null,
        collaboration_type: request.collaborationType ?? null,
        status: "active",
      });

      router.push(`/owner/request-accepted?requestId=${request.id}`);
    } catch (error) {
      console.error("Error accepting request:", error);
      fetchData();
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));

      await supabase
        .from("garden_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      router.push(`/owner/request-rejected?requestId=${requestId}`);
    } catch (error) {
      console.error("Error rejecting request:", error);
      fetchData();
    }
  };

  const CollaborationsPlaceholder = () => (
    <Card
      backgroundColor="white"
      borderColor="#E3ECD7"
      borderWidth={1}
      borderRadius={16}
      padding="$6"
      alignItems="center"
      justifyContent="center"
      gap="$3"
    >
      <Ionicons name="people-outline" size={40} color="#173300" />
      <Text color="$text_dark" fontSize="$4" fontWeight="600" textAlign="center">
        Geen actieve samenwerkingen
      </Text>
    </Card>
  );

  const PlanningPlaceholder = () => (
    <Card
      backgroundColor="white"
      borderColor="#E3ECD7"
      borderWidth={1}
      borderRadius={16}
      padding="$6"
      alignItems="center"
      justifyContent="center"
      gap="$3"
    >
      <Ionicons name="calendar-outline" size={40} color="#173300" />
      <Text color="$text_dark" fontSize="$4" fontWeight="600" textAlign="center">
        Bekijk je logboek voor planning
      </Text>
    </Card>
  );

  const RequestsPlaceholder = () => (
    <Card
      backgroundColor="white"
      borderColor="#E3ECD7"
      borderWidth={1}
      borderRadius={16}
      padding="$6"
      alignItems="center"
      justifyContent="center"
      onPress={() => router.push("/notifications")}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      gap="$3"
    >
      <Ionicons name="copy-outline" size={40} color="#173300" />
      <Text color="$text_dark" fontSize="$4" fontWeight="600" textAlign="center">
        Geen nieuwe aanvragen
      </Text>
    </Card>
  );

  return (
    <YStack paddingHorizontal="$4" paddingBottom="$4" gap="$6">
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
                  pressStyle={{ scale: 0.98, opacity: 0.9 }}
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
          <YStack gap="$2">
            <Text fontSize={24} fontWeight="900" color="$text_dark">
              Jouw planning
            </Text>

            {gardeners.length > 0 ? (
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
                  <XStack
                    key={gardener.id}
                    alignItems="center"
                    gap="$1"
                    onPress={() =>
                      router.push(("/collaboration/" + gardener.id) as any)
                    }
                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                  >
                    <Text
                      width={56}
                      color="#56594D"
                      fontSize={16}
                      fontWeight="500"
                      numberOfLines={1}
                    >
                      {gardener.firstName}
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
                              boxShadow="0px 0px 2px #FFE696"
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
            ) : (
              <PlanningPlaceholder />
            )}
          </YStack>

          {/* Actieve samenwerkingen Section */}
          <YStack gap="$2">
            <Text fontSize={24} fontWeight="900" color="$text_dark">
              Actieve samenwerkingen
            </Text>
            {gardeners.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$4" paddingVertical="$2">
                  {gardeners.map((gardener) => (
                    <Card
                      key={gardener.id}
                      width={260}
                      backgroundColor="#F0F3EC"
                      borderColor="#E3ECD7"
                      borderWidth={1}
                      borderRadius={16}
                      padding={12}
                      onPress={() =>
                        router.push(("/collaboration/" + gardener.id) as any)
                      }
                      pressStyle={{ scale: 0.98, opacity: 0.9 }}
                    >
                      <XStack gap="$3" alignItems="center">
                        <Circle
                          size={48}
                          backgroundColor="rgba(23, 51, 0, 0.08)"
                          overflow="hidden"
                        >
                          {gardener.profileImage ? (
                            <XStack width="100%" height="100%">
                              <img
                                src={gardener.profileImage}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: 24,
                                }}
                              />
                            </XStack>
                          ) : (
                            <MaterialCommunityIcons
                              name="account-outline"
                              size={22}
                              color="#173300"
                            />
                          )}
                        </Circle>
                        <YStack flex={1}>
                          <Text
                            fontSize={16}
                            fontWeight="700"
                            color="$text_dark"
                            numberOfLines={1}
                          >
                            {gardener.firstName} {gardener.lastName}
                          </Text>
                          <XStack alignItems="center" gap={4}>
                            <Ionicons
                              name="leaf"
                              size={12}
                              color="$primary"
                            />
                            <Text
                              fontSize={13}
                              color="#56594D"
                              numberOfLines={1}
                            >
                              {gardener.gardenName}
                            </Text>
                          </XStack>
                        </YStack>
                      </XStack>
                    </Card>
                  ))}
                </XStack>
              </ScrollView>
            ) : (
              <CollaborationsPlaceholder />
            )}
          </YStack>

          {/* Openstaande aanvragen */}
          <YStack gap="$2">
            <Text fontSize={24} fontWeight="900" color="$text_dark">
              Openstaande aanvragen {requests.length > 0 ? `(${requests.length})` : ""}
            </Text>
            {requests.length > 0 ? (
              requests.map((request) => (
                <Card
                  key={request.id}
                  backgroundColor="white"
                  borderColor="#E3ECD7"
                  borderWidth={1}
                  borderRadius={16}
                  padding="$3"
                  marginBottom="$2"
                >
                  <YStack gap="$3">
                    {/* Requester info */}
                    <XStack gap="$3" alignItems="center">
                      <Circle
                        size={48}
                        backgroundColor="rgba(23, 51, 0, 0.08)"
                        overflow="hidden"
                      >
                        {request.profiles?.profileImage ? (
                          <XStack width="100%" height="100%">
                            <img
                              src={request.profiles.profileImage}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 24,
                              }}
                            />
                          </XStack>
                        ) : (
                          <MaterialCommunityIcons
                            name="account-outline"
                            size={22}
                            color="#173300"
                          />
                        )}
                      </Circle>
                      <YStack flex={1} gap="$1">
                        <Text
                          fontSize="$4"
                          fontWeight="bold"
                          color="$text_dark"
                        >
                          {request.profiles?.firstName ?? "Tuinzoeker"}{" "}
                          {request.profiles?.lastName ?? ""}
                        </Text>
                        <Text fontSize="$2" color="#56594D">
                          {new Date(request.createdAt).toLocaleDateString(
                            "nl-NL",
                          )}
                        </Text>
                      </YStack>
                    </XStack>

                    {/* Motivation */}
                    {request.motivation && (
                      <Text fontSize="$3" color="#56594D" numberOfLines={3}>
                        &ldquo;{request.motivation}&rdquo;
                      </Text>
                    )}

                    {/* Days and type info */}
                    <XStack gap="$2" flexWrap="wrap">
                      {request.collaborationType && (
                        <YStack
                          backgroundColor="rgba(23, 51, 0, 0.06)"
                          borderRadius="$4"
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                        >
                          <Text fontSize="$2" color="#173300">
                            {request.collaborationType}
                          </Text>
                        </YStack>
                      )}
                      {request.days?.length > 0 && (
                        <YStack
                          backgroundColor="rgba(23, 51, 0, 0.06)"
                          borderRadius="$4"
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                        >
                          <Text fontSize="$2" color="#173300">
                            {request.days.join(", ")}
                          </Text>
                        </YStack>
                      )}
                    </XStack>

                    {/* Chat button */}
                    <Button
                      label="Chatten"
                      onPress={() => handleChat(request)}
                    />

                    {/* Action buttons */}
                    <XStack gap="$2">
                      <Button
                        label="Afwijzen"
                        variant="decline"
                        flex={1}
                        onPress={() => handleReject(request.id)}
                      />
                      <Button
                        label="Accepteren"
                        variant="accept"
                        flex={1}
                        onPress={() => handleAccept(request)}
                      />
                    </XStack>
                  </YStack>
                </Card>
              ))
            ) : (
              <RequestsPlaceholder />
            )}
          </YStack>
        </>
      )}
    </YStack>
  );
}
