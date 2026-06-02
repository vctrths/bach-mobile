import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image as ExpoImage } from "@/lib/image";
import { router, useLocalSearchParams } from "expo-router";
import { safeBack } from "@/utils/navigation";
import React, { useEffect, useState } from "react";
import { Spinner, Text, XStack, YStack, Circle, ScrollView } from "tamagui";
import { Platform } from "react-native";
import { supabase, toCamelCase } from "@/utils/supabase";
import { type Garden } from "@/types/garden";
import MiniMap from "../../components/ui/MiniMap";
import { APPLIANCE_MAP } from "@/components/ui/ApplianceBadges";
import { getDemoGarden, getGardenLookupId } from "@/utils/demoGardens";

export default function GardenDetailsScreen() {
  const { id } = useLocalSearchParams();
  const gardenId = Array.isArray(id) ? id[0] : id;
  const [garden, setGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppliance, setSelectedAppliance] = useState<string | null>(null);

  const toggleAppliance = (key: string) => {
    setSelectedAppliance(current => current === key ? null : key);
  };

  useEffect(() => {
    async function fetchData() {
      const lookupId = getGardenLookupId(gardenId);
      if (!lookupId) return;

      try {
        const [gardenRes] = await Promise.all([
          supabase
            .from("gardens")
            .select("*, owner:profiles!owner_id(first_name, last_name, profile_image, description, rating)")
            .eq("id", lookupId)
            .single()
        ]);

        if (gardenRes.data) {
          const gardenData = toCamelCase<Garden>(gardenRes.data);
          setGarden(gardenData);
          return;
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        const demoGarden = getDemoGarden(gardenId);
        if (demoGarden) {
          setGarden(demoGarden);
        }
        setLoading(false);
      }
    }

    if (gardenId) fetchData();
  }, [gardenId]);

  if (loading) {
    return (
      <PageContainer showBottomNav={false}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$primary" />
        </YStack>
      </PageContainer>
    );
  }

  if (!garden) {
    return (
      <PageContainer showBottomNav={false}>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Text fontSize="$5" color="$text_dark">
            Tuin niet gevonden
          </Text>
          <Button
            label="Terug"
            onPress={() => safeBack()}
          />
        </YStack>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      topNavTitle={garden.name}
      activeTab="home"
      topNavHeight={76}
    >
      <YStack paddingHorizontal="$4" gap="$8">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          marginHorizontal="$-4"
          paddingHorizontal="$4"
          contentContainerStyle={{ gap: 16 }}
        >
          {[garden.imageUrl, garden.imageUrl, garden.imageUrl].map((url, index) => (
            <YStack
              key={index}
              width={250}
              height={167}
              borderRadius={8}
              overflow="hidden"
              backgroundColor="$borderColor"
            >
              {url ? (
                <ExpoImage
                  source={{ uri: url }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <YStack flex={1} justifyContent="center" alignItems="center">
                  <Ionicons name="image-outline" size={32} color="$text_light" />
                </YStack>
              )}
            </YStack>
          ))}
        </ScrollView>

        <YStack gap="$4">
          <Text fontFamily="$Satoshi" fontWeight="900" fontSize={20} color="$text_dark">
            Beschrijving
          </Text>
          <Text
            fontFamily="$Satoshi"
            fontSize={16}
            color="$text_dark"
            lineHeight={22}
            textAlign="justify"
          >
            {garden.description ?? "Geen beschrijving beschikbaar."}
          </Text>
        </YStack>

        <YStack gap="$4">
          <Text fontFamily="$Satoshi" fontWeight="900" fontSize={20} color="$text_dark">
            Locatie
          </Text>
          <YStack borderRadius={10} overflow="hidden" height={244} backgroundColor="$borderColor">
            {garden.latitude && garden.longitude ? (
              <MiniMap latitude={garden.latitude} longitude={garden.longitude} />
            ) : (
              <ExpoImage
                source={require("@/assets/images/garden-details/map_placeholder.png")}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            )}
          </YStack>
        </YStack>

        <YStack gap="$4">
          <Text fontFamily="$Satoshi" fontWeight="900" fontSize={20} color="$text_dark">
            Aanwezig
          </Text>
          {(() => {
            const validAppliances = garden.appliances?.filter((key) => !!APPLIANCE_MAP[key]) || [];
            
            if (validAppliances.length > 0) {
              return (
                <XStack gap="$3" flexWrap="wrap" alignItems="center">
                  {validAppliances.map((key) => {
                    const appliance = APPLIANCE_MAP[key];
                    const isSelected = selectedAppliance === key;
                    
                    return (
                      <XStack
                        key={key}
                        backgroundColor={isSelected ? "#173300" : "#F1F3EC"}
                        height={50}
                        paddingHorizontal={isSelected ? 16 : 0}
                        width={isSelected ? "auto" : 50}
                        minWidth={50}
                        borderRadius={100}
                        justifyContent="center"
                        alignItems="center"
                        borderWidth={1}
                        borderColor={isSelected ? "#173300" : "#E3ECD7"}
                        onPress={() => toggleAppliance(key)}
                        gap={isSelected ? "$2" : 0}
                        pressStyle={{ scale: 0.95 }}
                      >
                        <MaterialCommunityIcons 
                          name={appliance.icon} 
                          size={24} 
                          color={isSelected ? "#FFF" : "#172211"} 
                        />
                        {isSelected && (
                            <Text 
                            fontFamily="$Satoshi" 
                            fontWeight="900" 
                            fontSize={14} 
                            color="#FFF" 
                            textTransform="uppercase"
                          >
                            {appliance.label}
                          </Text>
                        )}
                      </XStack>
                    );
                  })}
                </XStack>
              );
            }
            return (
              <YStack
                padding="$6"
                backgroundColor="$background_secondary"
                borderRadius={16}
                justifyContent="center"
                alignItems="center"
                gap="$2"
                borderWidth={1}
                borderColor="$borderColor"
                borderStyle="dashed"
              >
                <MaterialCommunityIcons name="information-outline" size={32} color="$secondary" />
                <Text fontSize={16} fontWeight="bold" color="$text_dark" textAlign="center">
                  Geen voorzieningen
                </Text>
                <Text fontSize={14} color="$secondary" textAlign="center" paddingHorizontal="$4">
                  Er zijn voor deze tuin nog geen specifieke voorzieningen opgegeven.
                </Text>
              </YStack>
            );
          })()}
        </YStack>

        <YStack
          padding="$5"
          backgroundColor="#F1F3EC"
          borderRadius={24}
          gap="$4"
          marginTop="$4"
        >
          <XStack gap="$4" alignItems="center">
            {garden.owner?.profileImage ? (
              <ExpoImage
                source={{ uri: garden.owner.profileImage }}
                style={{ width: 64, height: 64, borderRadius: 32 }}
              />
            ) : (
              <Circle size={64} backgroundColor="$borderColor" justifyContent="center" alignItems="center">
                <Ionicons name="person" size={32} color="$secondary" />
              </Circle>
            )}
            <YStack flex={1}>
              <Text fontFamily="$Satoshi" fontWeight="900" fontSize={22} color="$text_dark">
                {garden.owner?.firstName} {garden.owner?.lastName}
              </Text>
              <XStack alignItems="center" gap="$1">
                <Ionicons name="star" size={16} color="#EAB308" />
                <Text fontFamily="$Satoshi" fontWeight="900" fontSize={16} color="$text_dark">
                  {garden.owner?.rating?.toFixed(1) ?? "5.0"}
                </Text>
              </XStack>
            </YStack>
          </XStack>

          <Text
            fontFamily="$Satoshi"
            fontSize={15}
            color="$text_dark"
            lineHeight={20}
          >
            {garden.owner?.description ?? "Hoi! Ik ben de eigenaar van deze tuin. Laten we samenwerken om er iets moois van te maken."}
          </Text>
        </YStack>
      </YStack>

      <YStack padding="$4" paddingBottom={Platform.OS === "ios" ? 34 : 16} backgroundColor="$canvas">
        <Button
          label="Verstuur aanvraag"
          variant="primary"
          onPress={() => router.push(`/garden/${garden.id}/request`)}
        />
      </YStack>
    </PageContainer>
  );
}
