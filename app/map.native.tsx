import React, { useEffect, useState } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import { router } from "expo-router";
import { supabase, toCamelCase } from "@/utils/supabase";
import TopNavPill from "@/components/ui/TopNavPill";
import BottomNav from "@/components/ui/BottomNav";
import { YStack, Text, Image, Spinner } from "tamagui";
import { StyleSheet, View } from "react-native";
import { Garden } from "@/types/garden";

export default function MapScreen() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGardens();
  }, []);

  async function fetchGardens() {
    const { data } = await supabase
      .from("gardens")
      .select("id, name, location, latitude, longitude, image_url, owner:profiles!owner_id(rating)");
    if (data) setGardens(toCamelCase<Garden[]>(data));
    setLoading(false);
  }

  const initialRegion = {
    latitude: 50.8798,
    longitude: 4.7005,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {loading ? (
        <View style={[StyleSheet.absoluteFillObject, { justifyContent: "center", alignItems: "center", backgroundColor: "white" }]}>
          <Spinner size="large" color="$primary" />
        </View>
      ) : (
        <MapView style={StyleSheet.absoluteFillObject} initialRegion={initialRegion}>
          {gardens.map(
            (garden) =>
              garden.latitude &&
              garden.longitude && (
                <Marker
                  key={garden.id}
                  coordinate={{
                    latitude: garden.latitude!,
                    longitude: garden.longitude!,
                  }}
                  title={garden.name}
                  description={garden.location || ""}
                  onCalloutPress={() =>
                    router.push(`/garden/${garden.id}`)
                  }
                >
                  <Callout>
                    <YStack padding="$2" maxWidth={180}>
                      {garden.imageUrl && (
                        <Image
                          source={{ uri: garden.imageUrl }}
                          width={160}
                          height={80}
                          borderRadius="$2"
                        />
                      )}
                      <Text fontWeight="600" fontSize="$3" marginTop="$1">
                        {garden.name}
                      </Text>
                      <Text color="$secondary" fontSize="$2">
                        {garden.location} · {garden.owner?.rating ? "★".repeat(Math.round(garden.owner.rating)) : "Nieuw"}
                      </Text>
                    </YStack>
                  </Callout>
                </Marker>
              )
          )}
        </MapView>
      )}

      <TopNavPill title="Kaart" hideBack />

      <BottomNav activeTab="map" />
    </View>
  );
}

