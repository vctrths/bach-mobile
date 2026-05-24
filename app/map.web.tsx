import React, { useEffect, useState } from "react";
import { Map, Marker, ZoomControl } from "pigeon-maps";
import { router } from "expo-router";
import { supabase } from "@/utils/supabase";
import TopNavPill from "@/components/ui/TopNavPill";
import BottomNav from "@/components/ui/BottomNav";
import { YStack, Text, Spinner, XStack } from "tamagui";
import { Image as ExpoImage } from "@/lib/image";
import { StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Garden {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  image_url: string;
  rating: number;
}

const INITIAL_CENTER: [number, number] = [50.8798, 4.7005];
const INITIAL_ZOOM = 12;

function CustomPin({ isActive }: { isActive: boolean }) {
  return (
    <View
      style={{
        width: isActive ? 36 : 28,
        height: isActive ? 36 : 28,
        borderRadius: isActive ? 18 : 14,
        backgroundColor: "#37392B",
        borderWidth: 3,
        borderColor: "#EAF0D8",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
        transform: [{ translateY: -14 }],
      }}
    >
      <View
        style={{
          width: isActive ? 10 : 6,
          height: isActive ? 10 : 6,
          borderRadius: isActive ? 5 : 3,
          backgroundColor: "#A9D18E",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -8,
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 8,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: "#37392B",
        }}
      />
    </View>
  );
}

function GardenPopup({
  garden,
  onClose,
  onNavigate,
}: {
  garden: Garden;
  onClose: () => void;
  onNavigate: () => void;
}) {
  return (
    <Pressable onPress={onClose} style={StyleSheet.absoluteFillObject}>
      <YStack
        position="absolute"
        bottom={120}
        left={20}
        right={20}
        backgroundColor="white"
        borderRadius="16"
        padding="16"
        gap="12"
        shadowColor="rgba(0,0,0,0.15)"
        shadowOffset={{ width: 0, height: 4 }}
        shadowRadius={12}
        elevation={5}
        borderWidth={1}
        borderColor="#E3ECD7"
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <YStack gap="8">
            {garden.image_url && (
              <ExpoImage
                source={{ uri: garden.image_url }}
                style={{ width: "100%", height: 120, borderRadius: 12 }}
                contentFit="cover"
              />
            )}
            <YStack gap="2">
              <Text fontWeight="700" fontSize="18" color="#172211">
                {garden.name}
              </Text>
              <XStack alignItems="center" gap="4">
                <Text fontSize="14" color="#57594D">
                  {garden.location}
                </Text>
                <Text fontSize="14" color="#57594D">
                  {" · "}
                </Text>
                <Text fontSize="14" color="#37392B">
                  {"★".repeat(Math.round(garden.rating))}
                </Text>
              </XStack>
            </YStack>
            <Pressable onPress={onNavigate}>
              <View
                style={{
                  backgroundColor: "#37392B",
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 100,
                  alignItems: "center",
                }}
              >
                <Text color="white" fontWeight="600" fontSize="15">
                  Bekijk details
                </Text>
              </View>
            </Pressable>
          </YStack>
        </Pressable>
      </YStack>
    </Pressable>
  );
}

export default function MapScreen() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchGardens();
  }, []);

  async function fetchGardens() {
    const { data } = await supabase
      .from("gardens")
      .select("id, name, location, latitude, longitude, image_url, rating");
    if (data) setGardens(data);
    setLoading(false);
  }

  const gardensWithCoords = gardens.filter(
    (g) => g.latitude != null && g.longitude != null
  );

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {loading ? (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
            },
          ]}
        >
          <Spinner size="large" color="#37392B" />
        </View>
      ) : (
        <>
          <Map
            defaultCenter={INITIAL_CENTER}
            defaultZoom={INITIAL_ZOOM}
            minZoom={6}
            maxZoom={18}
            mouseEvents={true}
            touchEvents={true}
            metaWheelZoom={true}
          >
            {gardensWithCoords.map((garden) => (
              <Marker
                key={garden.id}
                anchor={[garden.latitude, garden.longitude]}
                onClick={() => setSelectedGarden(garden)}
              >
                <CustomPin isActive={selectedGarden?.id === garden.id} />
              </Marker>
            ))}
            <ZoomControl style={{ right: 16, top: insets.top + 80 }} />
          </Map>

          {selectedGarden && (
            <GardenPopup
              garden={selectedGarden}
              onClose={() => setSelectedGarden(null)}
              onNavigate={() => router.push(`/garden/${selectedGarden.id}`)}
            />
          )}
        </>
      )}

      <YStack
        position="absolute"
        top={insets.top}
        left={0}
        right={0}
        paddingHorizontal={16}
      >
        <TopNavPill title="Kaart" />
      </YStack>

      <BottomNav activeTab="map" />
    </View>
  );
}
