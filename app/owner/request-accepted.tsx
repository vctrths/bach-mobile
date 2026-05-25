import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Card, Spinner, Text, XStack, YStack } from "tamagui";

export default function RequestAcceptedScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const [requesterName, setRequesterName] = useState<string>("Tuinzoeker");
  const [motivation, setMotivation] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) { setLoading(false); return; }
      const { data } = await supabase.from("garden_requests").select("motivation, user_id").eq("id", requestId).single();
      if (data) {
        setMotivation(data.motivation ?? "");
        const { data: profileData } = await supabase.from("profiles").select("first_name, last_name").eq("id", data.user_id).single();
        if (profileData) setRequesterName(`${profileData.first_name} ${profileData.last_name}`.trim());
      }
      setLoading(false);
    };
    fetchRequest();
  }, [requestId]);

  return (
    <PageContainer topNavTitle="Verzoek geaccepteerd" onBackPress={() => router.push("/dashboard")}>
      {loading ? (
        <YStack flex={1} justifyContent="center" alignItems="center"><Spinner size="large" color="$primary" /></YStack>
      ) : (
        <YStack flex={1} gap="$6">
          <YStack alignItems="center" gap="$4" padding="$6">
            <XStack width={80} height={80} borderRadius={40} backgroundColor="rgba(34, 197, 94, 0.15)" justifyContent="center" alignItems="center">
              <Ionicons name="checkmark" size={44} color="#22c55e" />
            </XStack>
            <Text fontSize="$5" fontWeight="bold" color="$text_dark" textAlign="center">Verzoek geaccepteerd!</Text>
            <Text fontSize="$4" color="$secondary" textAlign="center">Je hebt de aanvraag goedgekeurd. Start nu een gesprek met de tuinzoeker.</Text>
          </YStack>
          <Card elevation={2} backgroundColor="rgba(227, 236, 215, 0.5)" borderColor="rgba(227, 236, 215, 0.85)" borderWidth={1} borderRadius="$6" padding="$4" gap="$2">
            <Text fontSize="$3" color="$secondary" fontWeight="500">Tuinzoeker</Text>
            <Text fontSize="$4" color="$text_dark" fontWeight="600">{requesterName}</Text>
            <Text fontSize="$3" color="$secondary">{motivation || "Wil graag helpen in de tuin."}</Text>
          </Card>
          <YStack gap="$3" marginTop="auto" paddingBottom="$6">
            <Button label="Ga naar chat" backgroundColor="#173300" color="white" onPress={() => router.push("/messages" as any)} />
            <Button label="Terug naar dashboard" backgroundColor="transparent" color="#173300" onPress={() => router.push("/dashboard")} />
          </YStack>
        </YStack>
      )}
    </PageContainer>
  );
}
