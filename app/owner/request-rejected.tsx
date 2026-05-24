import Button from "@/components/ui/Button";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Spinner, Text, TextArea, XStack, YStack } from "tamagui";

export default function RequestRejectedScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const [requesterName, setRequesterName] = useState<string>("Tuinzoeker");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("garden_requests")
        .select("user_id")
        .eq("id", requestId)
        .single();

      if (data) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", data.user_id)
          .single();
        if (profileData) {
          setRequesterName(
            `${profileData.first_name} ${profileData.last_name}`.trim()
          );
        }
      }
      setLoading(false);
    };

    fetchRequest();
  }, [requestId]);

  return (
    <ThemedSafeArea>
      <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
        <TopNavPill
          title="Verzoek geweigerd"
          onBackPress={() => router.push("/owner/dashboard")}
        />

        {loading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner size="large" color="$primary" />
          </YStack>
        ) : (
          <>
            <YStack alignItems="center" gap="$4" padding="$6">
              <XStack
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor="rgba(239, 68, 68, 0.15)"
                justifyContent="center"
                alignItems="center"
              >
                <Ionicons name="close" size={44} color="#ef4444" />
              </XStack>
              <Text fontSize="$5" fontWeight="bold" color="$text_dark" textAlign="center">
                Verzoek geweigerd
              </Text>
              <Text fontSize="$4" color="$secondary" textAlign="center">
                Je hebt de aanvraag van {requesterName} afgewezen.
              </Text>
            </YStack>

            <YStack gap="$2">
              <Text fontSize="$3" color="$secondary" fontWeight="500">
                Reden (optioneel)
              </Text>
              <TextArea
                placeholder="Laat weten waarom je de aanvraag hebt afgewezen..."
                value={reason}
                onChangeText={setReason}
                minHeight={100}
                backgroundColor="white"
                borderColor="rgba(23, 51, 0, 0.1)"
                borderWidth={1}
                borderRadius="$6"
                padding="$4"
                fontSize="$4"
                color="$text_dark"
              />
            </YStack>

            <YStack marginTop="auto" paddingBottom="$6">
              <Button
                label="Terug naar dashboard"
                backgroundColor="#173300"
                color="white"
                onPress={() => router.push("/owner/dashboard")}
              />
            </YStack>
          </>
        )}
      </YStack>
    </ThemedSafeArea>
  );
}
