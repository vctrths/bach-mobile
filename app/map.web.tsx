import BottomNav from "@/components/ui/BottomNav";
import TopNavPill from "@/components/ui/TopNavPill";
import { Image as ExpoImage } from "@/lib/image";
import { type Garden } from "@/types/garden";
import { supabase, toCamelCase } from "@/utils/supabase";
import { router } from "expo-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import { Spinner, Text, XStack, YStack } from "tamagui";

const INITIAL_CENTER: [number, number] = [50.8798, 4.7005];
const INITIAL_ZOOM = 12;

const markerIcon = L.divIcon({
  className: "groen-leaflet-marker",
  html: `
    <div class="groen-leaflet-pin">
      <span></span>
    </div>
  `,
  iconSize: [32, 40],
  iconAnchor: [16, 36],
  popupAnchor: [0, -34],
});

const activeMarkerIcon = L.divIcon({
  className: "groen-leaflet-marker groen-leaflet-marker-active",
  html: `
    <div class="groen-leaflet-pin active">
      <span></span>
    </div>
  `,
  iconSize: [40, 48],
  iconAnchor: [20, 44],
  popupAnchor: [0, -42],
});

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
      <style>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          font-family: Satoshi, Helvetica, Arial, sans-serif;
          background: #eef3e8;
        }
        .leaflet-control-attribution {
          font-size: 10px;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(23, 34, 17, 0.18);
        }
        .leaflet-popup-content {
          margin: 12px;
        }
        .groen-leaflet-marker {
          background: transparent;
          border: 0;
        }
        .groen-leaflet-pin {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: #37392B;
          border: 3px solid #EAF0D8;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .groen-leaflet-pin.active {
          width: 36px;
          height: 36px;
          transform: translate(-4px, -8px);
        }
        .groen-leaflet-pin span {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #A9D18E;
        }
        .groen-leaflet-pin.active span {
          width: 10px;
          height: 10px;
        }
        .groen-leaflet-pin::after {
          content: "";
          position: absolute;
          bottom: -9px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 10px solid #37392B;
        }
      `}</style>

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
          style={styles.map}
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
              icon={selectedGardenId === garden.id ? activeMarkerIcon : markerIcon}
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
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "white",
    justifyContent: "center",
  },
  map: {
    height: "100%",
    width: "100%",
  },
});
