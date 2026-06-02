import PageContainer from "@/components/ui/PageContainer";
import ScreenContent from "@/components/ui/ScreenContent";
import { supabase, toCamelCase } from "@/utils/supabase";
import { Image as ExpoImage } from "@/lib/image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Card, H2, Spinner, Text, XStack, YStack } from "tamagui";

const DEFAULT_FALLBACK = {
  tasks: [
    "Onkruid verwijderd rond tomaten en sla",
    "Tomatenplanten opgebonden en onderste bladeren gesnoeid",
    "Compost toegevoegd aan kruidenbed",
    "Sla geoogst (± 6 kroppen)",
    "Bedden licht losgemaakt en bewaterd",
  ],
  observations:
    "De tomatenplanten groeien voorspoedig en beginnen de eerste vruchten te vormen. " +
    "De sla heeft goed aangeslagen en kan binnenkort opnieuw geoogst worden. " +
    "Wel opgemerkt dat er wat slakkenactiviteit is rond de jonge planten. " +
    "De grondvochtigheid lijkt optimaal na de regen van gisteren.",
  followUps: [
    "Slakkenval plaatsen bij volgende bezoek",
    "Sla bladeren inspecteren op ziekte",
    "Grond opnieuw laten testen",
  ],
};

type FollowUpDetail = {
  text: string;
  dueDate: string | null;
};

function normalizeFollowUps(followUps: unknown): FollowUpDetail[] {
  if (!Array.isArray(followUps)) {
    return DEFAULT_FALLBACK.followUps.map((text) => ({
      text,
      dueDate: null,
    }));
  }

  return followUps
    .map((item): FollowUpDetail | null => {
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
    .filter((item): item is FollowUpDetail => item !== null);
}

function formatDueDate(date: string | null) {
  if (!date) return null;
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;
  const parsedDate = new Date(year, month - 1, day);

  return parsedDate.toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function LogDetailScreen() {
  const { id } = useLocalSearchParams();
  const [log, setLog] = useState<{
    date: string;
    title: string;
    imageUrl: string | null;
    tasks: string[];
    observations: string;
    followUps: FollowUpDetail[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const { data, error } = await supabase
          .from("garden_logs")
          .select("id, title, status, image_url, created_at")
          .eq("id", id as string)
          .single();

        if (error) {
          console.error("Error fetching log:", error);
          return;
        }

        const camelData = toCamelCase<any>(data);
        const status = camelData.status || {};
        setLog({
          title: camelData.title,
          imageUrl: camelData.imageUrl ?? null,
          date: new Date(camelData.createdAt).toLocaleDateString("nl-BE"),
          tasks: status.tasks || DEFAULT_FALLBACK.tasks,
          observations: status.observations || DEFAULT_FALLBACK.observations,
          followUps: normalizeFollowUps(status.followUps),
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (typeof id === "string" && id.length > 5) {
      fetchLog();
    } else if (typeof id === "string") {
      setLog({
        title: `Log van dag ${id}`,
        imageUrl: null,
        date: `${id}/01/2025`,
        tasks: DEFAULT_FALLBACK.tasks,
        observations: DEFAULT_FALLBACK.observations,
        followUps: normalizeFollowUps(DEFAULT_FALLBACK.followUps),
      });
      setLoading(false);
    }
  }, [id]);

  const pageTitle = log?.date
    ? new Date(
        log.date.split("/").reverse().join("-")
      ).toLocaleDateString("nl-BE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Log details";

  return (
    <PageContainer
      topNavTitle={pageTitle}
      activeTab="home"
    >
      <ScreenContent>
        {loading ? (
          <YStack padding="$10" justifyContent="center" alignItems="center">
            <Spinner size="large" color="$primary" />
          </YStack>
        ) : (
          <>
            <Card
              elevation={2}
              borderRadius="$6"
              overflow="hidden"
              height={200}
            >
              <ExpoImage
                source={
                  log?.imageUrl
                    ? { uri: log.imageUrl }
                    : require("@/assets/images/hero.png")
                }
                style={{ width: "100%", height: 200 }}
                contentFit="cover"
              />
            </Card>

            {log && (
              <Text fontSize="$4" color="$secondary" fontWeight="500">
                {log.date}
              </Text>
            )}

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
                  {(log?.tasks || []).map((task, index) => (
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
                  {log?.observations || ""}
                </Text>
              </Card>
            </YStack>

            <YStack gap="$3">
              <H2 color="$text_dark" fontWeight="bold" fontSize="$5">
                Opvolgingen
              </H2>
              <YStack gap="$2">
                {(log?.followUps || []).map((item, index) => (
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
                      <YStack flex={1} gap="$1">
                        <Text
                          fontSize="$4"
                          color="$text_dark"
                          lineHeight={22}
                        >
                          {item.text}
                        </Text>
                        {formatDueDate(item.dueDate) && (
                          <Text fontSize="$2" color="$secondary">
                            Do-datum: {formatDueDate(item.dueDate)}
                          </Text>
                        )}
                      </YStack>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            </YStack>
          </>
        )}
      </ScreenContent>
    </PageContainer>
  );
}
