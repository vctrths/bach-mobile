import BottomNav from "@/components/ui/BottomNav";
import TopNavPill from "@/components/ui/TopNavPill";
import {
  groenLeafletActiveMarkerIcon,
  groenLeafletMarkerIcon,
  groenLeafletStyles,
} from "@/components/ui/leafletPins";
import { Image as ExpoImage } from "@/lib/image";
import { type Garden } from "@/types/garden";
import { supabase, toCamelCase } from "@/utils/supabase";
import { router } from "expo-router";
import "leaflet/dist/leaflet.css";
import React, { type CSSProperties, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import { Spinner, Text, XStack, YStack } from "tamagui";

const INITIAL_CENTER: [number, number] = [50.8798, 4.7005];
const INITIAL_ZOOM = 12;
const MAP_TOP_OFFSET = 92;
const MAP_BOTTOM_OFFSET = 118;
const MAP_VERTICAL_CHROME = MAP_TOP_OFFSET + MAP_BOTTOM_OFFSET;

const mapContainerStyle: CSSProperties = {
  height: `calc(100vh - ${MAP_VERTICAL_CHROME}px)`,
  width: "100%",
};

function GardenPopupContent({ garden }: { garden: Garden }) {
  return (
    <YStack width={240} gap={10}>
      {garden.imageUrl && (
        <ExpoImage
          source={{ uri: garden.imageUrl }}
          style={{ width: "100%", height: 120, borderRadius: 12 }}
          contentFit="cover"
        />
      )}
      <YStack gap={2}>
        <Text fontWeight="700" fontSize={18} color="#172211">
          {garden.name}
        </Text>
        <XStack alignItems="center" gap={4}>
          <Text fontSize={14} color="#57594D">
            {garden.location}
          </Text>
          <Text fontSize={14} color="#57594D">
            {" · "}
          </Text>
          <Text fontSize={14} color="#37392B">
            {garden.owner?.rating
              ? "★".repeat(Math.round(garden.owner.rating))
              : "Nieuw"}
          </Text>
        </XStack>
      </YStack>
      <Pressable onPress={() => router.push(`/garden/${garden.id}`)}>
        <View style={styles.detailsButton}>
          <Text color="white" fontWeight="600" fontSize={15}>
            Bekijk details
          </Text>
        </View>
      </Pressable>
    </YStack>
  );
}

export default function MapScreen() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);

  useEffect(() => {
    fetchGardens();
  }, []);

  async function fetchGardens() {
    const { data } = await supabase
      .from("gardens")
      .select(
        "id, name, location, latitude, longitude, image_url, owner:profiles!owner_id(rating)",
      );
    if (data) setGardens(toCamelCase<Garden[]>(data));
    setLoading(false);
  }

  const gardensWithCoords = useMemo(
    () =>
      gardens.filter(
        (garden): garden is Garden & { latitude: number; longitude: number } =>
          garden.latitude != null && garden.longitude != null,
      ),
    [gardens],
  );

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <style>{groenLeafletStyles}</style>

      <View style={styles.mapFrame}>
        {loading ? (
          <View style={styles.loading}>
            <Spinner size="large" color="#37392B" />
          </View>
        ) : (
          <MapContainer
            center={INITIAL_CENTER}
            zoom={INITIAL_ZOOM}
            minZoom={6}
            maxZoom={18}
            zoomControl={false}
            scrollWheelZoom
            style={mapContainerStyle}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="topright" />
            {gardensWithCoords.map((garden) => (
              <Marker
                key={garden.id}
                position={[garden.latitude, garden.longitude]}
                icon={
                  selectedGardenId === garden.id
                    ? groenLeafletActiveMarkerIcon
                    : groenLeafletMarkerIcon
                }
                eventHandlers={{
                  click: () => setSelectedGardenId(garden.id),
                  popupclose: () => setSelectedGardenId(null),
                }}
              >
                <Popup>
                  <GardenPopupContent garden={garden} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </View>

      <TopNavPill title="Kaart" hideBack />
      <BottomNav activeTab="map" />
    </View>
  );
}

const styles = StyleSheet.create({
  detailsButton: {
    alignItems: "center",
    backgroundColor: "#37392B",
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  loading: {
    alignItems: "center",
    backgroundColor: "white",
    height: "100%",
    justifyContent: "center",
  },
  mapFrame: {
    backgroundColor: "#eef3e8",
    bottom: MAP_BOTTOM_OFFSET,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: MAP_TOP_OFFSET,
  },
});
