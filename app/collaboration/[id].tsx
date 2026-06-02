import PageContainer from "@/components/ui/PageContainer";
import ScreenContent from "@/components/ui/ScreenContent";
import Button from "@/components/ui/Button";
import RatingPicker from "@/components/ui/RatingPicker";
import { supabase, toCamelCase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import { Collaboration } from "@/types/garden";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { BlurView } from "expo-blur";
import { Card, H2, Spinner, Text, XStack, YStack, TextArea, Circle } from "tamagui";
import { Image as ExpoImage } from "@/lib/image";

export default function CollaborationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);

  const fetchCollaboration = useCallback(async () => {
    if (!id || !user) return;

    try {
      const { data } = await supabase
        .from("collaborations")
        .select(`
          *,
          gardens(*),
          profiles:gardener_id(first_name, last_name, profile_image)
        `)
        .eq("id", id as string)
        .single();

      if (data) {
        setCollaboration(toCamelCase<Collaboration>(data));
        
        const { data: reviewData } = await supabase
          .from("reviews")
          .select("id")
          .eq("collaboration_id", id as string)
          .eq("reviewer_id", user.id)
          .maybeSingle();
        
        if (reviewData) setHasReviewed(true);
      }
    } catch (err) {
      console.error("Error fetching collaboration:", err);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchCollaboration();
  }, [fetchCollaboration]);

  const handleEndCollaboration = async () => {
    if (!collaboration) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("collaborations")
        .update({ 
          status: "ended",
          ended_at: new Date().toISOString(),
          ended_by: user?.id
        })
        .eq("id", id as string);

      if (!error) {
        const otherPartyId = user?.id === collaboration.ownerId 
          ? collaboration.gardenerId 
          : collaboration.ownerId;
        
        if (otherPartyId) {
          await supabase.from("notifications").insert({
            user_id: otherPartyId,
            type: "reminder",
            title: "Samenwerking beëindigd",
            body: "Laat een beoordeling achter over je ervaring!",
            related_id: id as string
          });
        }

        await fetchCollaboration();
      }
    } catch (err) {
      console.error("Error ending collaboration:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!collaboration || userRating === 0) return;
    setSubmitting(true);
    try {
      const isOwner = user?.id === collaboration.ownerId;
      const targetId = isOwner ? collaboration.gardenerId : collaboration.ownerId;
      const targetType = "user";

      const { error } = await supabase.from("reviews").insert({
        collaboration_id: id as string,
        reviewer_id: user!.id,
        target_id: targetId,
        target_type: targetType,
        rating: userRating,
        comment: comment
      });

      if (!error) {
        setHasReviewed(true);
      } else {
        console.error("Review error:", error.message);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer topNavTitle="Samenwerking">
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$primary" />
        </YStack>
      </PageContainer>
    );
  }

  if (!collaboration) return null;

  const isEnded = collaboration.status === "ended";
  const partnerName = user?.id === collaboration.ownerId 
    ? `${collaboration.profiles?.firstName} ${collaboration.profiles?.lastName}`
    : "Tuineigenaar";

  return (
    <PageContainer
      topNavTitle="Samenwerking details"
      activeTab="home"
    >
      <ScreenContent>
        <YStack gap="$6">
          <Card
            elevation={2}
            backgroundColor="white"
            borderRadius="$6"
            overflow="hidden"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <YStack height={150} position="relative">
              {collaboration.gardens?.imageUrl ? (
                <ExpoImage
                  source={{ uri: collaboration.gardens.imageUrl }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <YStack flex={1} backgroundColor="$background_secondary" justifyContent="center" alignItems="center">
                   <Ionicons name="leaf" size={48} color="$text_light" />
                </YStack>
              )}
              <YStack
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                padding="$3"
                backgroundColor="rgba(0,0,0,0.4)"
              >
                <Text color="white" fontWeight="bold" fontSize="$5">
                  {collaboration.gardens?.name}
                </Text>
                <XStack gap="$1" alignItems="center">
                  <Ionicons name="location" size={14} color="white" />
                  <Text color="white" fontSize="$2">
                    {collaboration.gardens?.location}
                  </Text>
                </XStack>
              </YStack>
            </YStack>
          </Card>

          <XStack alignItems="center" gap="$4">
            <Circle size={60} overflow="hidden" backgroundColor="$background_secondary">
              {collaboration.profiles?.profileImage ? (
                <ExpoImage
                  source={{ uri: collaboration.profiles.profileImage }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Ionicons name="person" size={30} color="$text_light" />
              )}
            </Circle>
            <YStack flex={1}>
              <Text fontSize="$3" color="$secondary">Je werkt samen met</Text>
              <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                {partnerName}
              </Text>
            </YStack>
            <XStack
               backgroundColor={isEnded ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)"}
               paddingHorizontal="$3"
               paddingVertical="$1"
               borderRadius="$10"
            >
              <Text 
                fontSize="$2" 
                fontWeight="bold" 
                color={isEnded ? "#ef4444" : "#22c55e"}
                textTransform="capitalize"
              >
                {collaboration.status}
              </Text>
            </XStack>
          </XStack>

          <YStack gap="$3">
            <H2 fontSize="$5" color="$text_dark" fontWeight="bold">Afspraken</H2>
            <Card padding="$4" backgroundColor="white" borderRadius="$4" borderWidth={1} borderColor="$borderColor">
              <YStack gap="$2">
                <XStack justifyContent="space-between">
                  <Text color="$secondary">Type:</Text>
                  <Text fontWeight="600">{collaboration.collaborationType}</Text>
                </XStack>
                <XStack justifyContent="space-between">
                  <Text color="$secondary">Dagen:</Text>
                  <Text fontWeight="600">{collaboration.days.join(", ")}</Text>
                </XStack>
                <XStack justifyContent="space-between">
                  <Text color="$secondary">Gestart op:</Text>
                  <Text fontWeight="600">{new Date(collaboration.createdAt).toLocaleDateString('nl-BE')}</Text>
                </XStack>
              </YStack>
            </Card>
          </YStack>

          {isEnded && !hasReviewed && (
            <Card
              position="relative"
              backgroundColor="rgba(240, 243, 236, 0.6)"
              borderRadius="$8"
              borderWidth={1}
              borderColor="rgba(227, 236, 215, 0.8)"
              padding="$5"
              gap="$4"
              overflow="hidden"
            >
              <BlurView
                intensity={30}
                tint="light"
                experimentalBlurMethod="dimezisBlurView"
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
              />
              <YStack gap="$2">
                <Text fontSize="$5" fontWeight="bold" color="$text_dark">
                  Hoe was je ervaring?
                </Text>
                <Text fontSize="$3" color="$secondary">
                  Laat {partnerName} weten hoe de samenwerking verliep.
                </Text>
              </YStack>

              <YStack alignItems="center" gap="$4" marginVertical="$2">
                <RatingPicker rating={userRating} onRatingChange={setUserRating} size={40} />
              </YStack>

              <TextArea
                placeholder="Schrijf een korte beoordeling..."
                value={comment}
                onChangeText={setComment}
                backgroundColor="white"
                borderColor="$borderColor"
                borderRadius="$4"
                minHeight={100}
              />

              <Button
                label={submitting ? "Versturen..." : "Beoordeling plaatsen"}
                onPress={handleSubmitReview}
                disabled={userRating === 0 || submitting}
              />
            </Card>
          )}

          {hasReviewed && (
             <XStack 
               backgroundColor="rgba(34, 197, 94, 0.1)" 
               padding="$4" 
               borderRadius="$6" 
               alignItems="center" 
               gap="$3"
             >
               <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
               <Text color="#173300" fontWeight="600">Bedankt voor je beoordeling!</Text>
             </XStack>
          )}

          {!isEnded && (
            <Button
              label={submitting ? "Verwerken..." : "Samenwerking beëindigen"}
              variant="decline"
              onPress={handleEndCollaboration}
              disabled={submitting}
            />
          )}

          <Button
            label="Chat openen"
            variant="secondary"
            onPress={() => router.push("/messages")}
          />
        </YStack>
      </ScreenContent>
    </PageContainer>
  );
}
