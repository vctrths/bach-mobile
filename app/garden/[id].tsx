import PageContainer from "@/components/ui/PageContainer";
import Button from "@/components/ui/Button";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image as ExpoImage } from "@/lib/image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { H1, H2, Spinner, Text, XStack, YStack, Circle, ScrollView } from "tamagui";
import { supabase, toCamelCase } from "@/utils/supabase";
import { type Garden } from "@/types/garden";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";
import { APPLIANCE_MAP } from "@/components/ui/ApplianceBadges";

export default function GardenDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [garden, setGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppliance, setSelectedAppliance] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [gardenRes] = await Promise.all([
          supabase
            .from("gardens")
            .select("*, owner:profiles!owner_id(first_name, last_name, profile_image, description, rating)")
            .eq("id", id as string)
            .single()
        ]);

        if (gardenRes.data) {
          const gardenData = toCamelCase<Garden>(gardenRes.data);
          setGarden(gardenData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

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
            backgroundColor="$background"
            color="$white"
            onPress={() => router.back()}
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
        {/* Horizontal Image Gallery */}
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

        {/* Beschrijving Section */}
        <YStack gap="$4">
          <Text fontFamily="Inter" fontWeight="900" fontSize={20} color="$text_dark">
            Beschrijving
          </Text>
          <Text
            fontFamily="Inter"
            fontSize={16}
            color="$text_dark"
            lineHeight={22}
            textAlign="justify"
          >
            {garden.description ?? "Geen beschrijving beschikbaar."}
          </Text>
        </YStack>

        {/* Locatie Section */}
        <YStack gap="$4">
          <Text fontFamily="Inter" fontWeight="900" fontSize={20} color="$text_dark">
            Locatie
          </Text>
          <YStack borderRadius={10} overflow="hidden" height={244} backgroundColor="$borderColor">
            {garden.latitude && garden.longitude ? (
              <MapView
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                  latitude: garden.latitude,
                  longitude: garden.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: garden.latitude,
                    longitude: garden.longitude,
                  }}
                />
              </MapView>
            ) : (
              <ExpoImage
                source={require("@/assets/images/garden-details/map_placeholder.png")}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            )}
          </YStack>
        </YStack>

        {/* Aanwezig Section */}
        <YStack gap="$4">
          <Text fontFamily="Inter" fontWeight="900" fontSize={20} color="$text_dark">
            Aanwezig
          </Text>
          {(() => {
            const validAppliances = garden.appliances?.filter((key) => !!APPLIANCE_MAP[key]) || [];
            
            if (validAppliances.length > 0) {
              return (
                <XStack gap="$3" flexWrap="wrap" alignItems="center" animation="quick">
                  {validAppliances.map((key) => {
                    const appliance = APPLIANCE_MAP[key];
                    const isSelected = selectedAppliance === key;
                    
                    return (
                      <XStack
                        key={key}
                        animation="quick"
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
                        onPress={() => setSelectedAppliance(isSelected ? null : key)}
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
                            fontFamily="Inter" 
                            fontWeight="900" 
                            fontSize={14} 
                            color="#FFF" 
                            textTransform="uppercase"
                            animation="quick"
                            enterStyle={{ opacity: 0, scale: 0.5 }}
                            exitStyle={{ opacity: 0, scale: 0.5 }}
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

        {/* Extra informatie Section */}
        <YStack gap="$4">
          <Text fontFamily="Inter" fontWeight="900" fontSize={20} color="$text_dark">
            Extra informatie
          </Text>
          <YStack gap="$2">
            {[
              { label: "Grootte", value: "40 m²" },
              { label: "Opgepast", value: "hond aanwezig" },
              { label: "Toegang", value: "Via zijpoort" },
              { label: "Verwachting eigenaar", value: "Geen pesticides" },
            ].map((item, idx) => (
              <XStack key={idx} gap="$1" alignItems="center">
                <Text fontSize={16} color="$text_dark">• </Text>
                <Text fontSize={16} color="$text_dark" fontWeight="bold">{item.label}:</Text>
                <Text fontSize={16} color="$text_dark"> {item.value}</Text>
              </XStack>
            ))}
          </YStack>
        </YStack>

        {/* Owner Profile Section */}
        <YStack gap="$4" alignItems="center">
          <Circle size={167} overflow="hidden" backgroundColor="$borderColor">
            {garden.owner?.profileImage ? (
              <ExpoImage
                source={{ uri: garden.owner.profileImage }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <ExpoImage
                source={require("@/assets/images/garden-details/owner_victor.png")}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            )}
          </Circle>
          <Text fontFamily="Inter" fontWeight="900" fontSize={20} color="$text_dark">
            Wie is {garden.owner?.firstName ?? "Victor"}?
          </Text>
          <Text
            fontFamily="Inter"
            fontSize={16}
            color="$text_dark"
            lineHeight={22}
            textAlign="justify"
          >
            {garden.owner?.description ?? "Geen beschrijving beschikbaar."}
          </Text>
        </YStack>

        {/* CTA Section */}
        <YStack
          backgroundColor="$background_secondary"
          borderRadius={32}
          padding="$6"
          gap="$4"
          alignItems="stretch"
          marginBottom="$4"
        >
          <Text
            fontFamily="Inter"
            fontWeight="900"
            fontSize={20}
            color="$text_dark"
            textAlign="center"
          >
            Is dit de tuin voor jou?
          </Text>
          <Button
            label="Stuur verzoek"
            backgroundColor="#173300"
            color="#F5FFF3"
            borderRadius={64}
            paddingVertical={12}
            onPress={() => router.push(`/garden/${id}/request` as any)}
          />
        </YStack>
      </YStack>
    </PageContainer>
  );
}