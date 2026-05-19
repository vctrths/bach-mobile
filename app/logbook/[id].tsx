import BottomNav from "@/components/ui/BottomNav";
import ThemedSafeArea from "@/components/ui/ThemedSafeArea";
import TopNavPill from "@/components/ui/TopNavPill";
import { supabase } from "@/utils/supabase";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Card, H2, Spinner, Text, XStack, YStack } from "tamagui";

const MOCK_TASKS = [
  "Onkruid verwijderd rond tomaten en sla",
  "Tomatenplanten opgebonden en onderste bladeren gesnoeid",
  "Compost toegevoegd aan kruidenbed",
  "Sla geoogst (± 6 kroppen)",
  "Bedden licht losgemaakt en bewaterd",
];

const MOCK_OBSERVATIONS =
  "De tomatenplanten groeien voorspoedig en beginnen de eerste vruchten te vormen. " +
  "De sla heeft goed aangeslagen en kan binnenkort opnieuw geoogst worden. " +
  "Wel opgemerkt dat er wat slakkenactiviteit is rond de jonge planten. " +
  "De grondvochtigheid lijkt optimaal na de regen van gisteren.";

const MOCK_FOLLOW_UPS = [
  "Slakkenval plaatsen bij volgende bezoek",
  "Sla bladeren inspecteren op ziekte",
  "Grond opnieuw laten testen",
];

export default function LogDetailScreen() {
  const { id } = useLocalSearchParams();
  const [log, setLog] = useState<{ date: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const { data, error } = await supabase
          .from("garden_logs")
          .select("id, title, created_at")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching log:", error);
          return;
        }

        setLog({
          title: data.title,
          date: new Date(data.created_at).toLocaleDateString("nl-BE"),
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (typeof id === "string" && id.length > 5) {
      fetchLog();
    } else {
      setLog({ title: `Log van dag ${id}`, date: `${id}/01/2025` });
      setLoading(false);
    }
  }, [id]);

  const title = log?.date
    ? new Date(
        log.date.split("/").reverse().join("-")
      ).toLocaleDateString("nl-BE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Log details";

  return (
    <ThemedSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack flex={1} paddingHorizontal="$4" paddingVertical="$6" gap="$6">
          <TopNavPill
            title={title}
            onBackPress={() => router.back()}
          />

          {loading ? (
            <YStack padding="$10" justifyContent="center" alignItems="center">
              <Spinner size="large" color="$primary" />
            </YStack>
          ) : (
            <>
              {/* Hero Image */}
              <Card
                elevation={2}
                borderRadius="$6"
                overflow="hidden"
                height={200}
              >
                <ExpoImage
                  source={require("@/assets/images/hero.png")}
                  style={{ width: "100%", height: 200 }}
                  contentFit="cover"
                />
              </Card>

              {/* Date Label */}
              {log && (
                <Text fontSize="$4" color="$secondary" fontWeight="500">
                  {log.date}
                </Text>
              )}

              {/* Uitgevoerde taken */}
              <YStack gap="$3">
                <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
                  Uitgevoerde taken:
                </H2>
                <Card
                  elevation={2}
                  backgroundColor="white"
                  borderColor="rgba(23, 51, 0, 0.1)"
                  borderWidth={1}
                  borderRadius="$6"
                  padding="$4"
                  gap="$3"
                >
                  <YStack gap="$3">
                    {MOCK_TASKS.map((task, index) => (
                      <XStack key={index} gap="$3" alignItems="flex-start">
                        <XStack
                          width={20}
                          height={20}
                          borderRadius={6}
                          backgroundColor="rgba(23, 51, 0, 0.08)"
                          justifyContent="center"
                          alignItems="center"
                          marginTop={2}
                        >
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#173300"
                          />
                        </XStack>
                        <Text
                          fontSize="$4"
                          color="$text_dark"
                          flex={1}
                          lineHeight={22}
                        >
                          {task}
                        </Text>
                      </XStack>
                    ))}
                  </YStack>
                </Card>
              </YStack>

              {/* Observaties */}
              <YStack gap="$3">
                <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
                  Observaties:
                </H2>
                <Card
                  elevation={2}
                  backgroundColor="white"
                  borderColor="rgba(23, 51, 0, 0.1)"
                  borderWidth={1}
                  borderRadius="$6"
                  padding="$4"
                >
                  <Text fontSize="$4" color="$text_dark" lineHeight={22}>
                    {MOCK_OBSERVATIONS}
                  </Text>
                </Card>
              </YStack>

              {/* Opvolgingen */}
              <YStack gap="$3">
                <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
                  Opvolgingen
                </H2>
                <YStack gap="$2">
                  {MOCK_FOLLOW_UPS.map((item, index) => (
                    <Card
                      key={index}
                      elevation={2}
                      backgroundColor="white"
                      borderColor="rgba(239, 68, 68, 0.2)"
                      borderWidth={1}
                      borderRadius="$6"
                      padding="$4"
                    >
                      <XStack gap="$3" alignItems="center">
                        <XStack
                          width={20}
                          height={20}
                          borderRadius={10}
                          borderWidth={2}
                          borderColor="#ef4444"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Ionicons
                            name="alert-circle"
                            size={12}
                            color="#ef4444"
                          />
                        </XStack>
                        <Text
                          fontSize="$4"
                          color="$text_dark"
                          flex={1}
                          lineHeight={22}
                        >
                          {item}
                        </Text>
                      </XStack>
                    </Card>
                  ))}
                </YStack>
              </YStack>
            </>
          )}
        </YStack>
      </ScrollView>

      <BottomNav
        activeTab="home"
        onHomePress={() => router.push("/dashboard")}
        onMessagePress={() => router.push("/messages" as any)}
        onProfilePress={() => router.push("/profile")}
      />
    </ThemedSafeArea>
  );
}
