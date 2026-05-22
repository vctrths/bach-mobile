import React, { useEffect, useState } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import { router } from "expo-router";
import { supabase } from "@/utils/supabase";
import TopNavPill from "@/components/ui/TopNavPill";
import { YStack, Text, Image, Spinner } from "tamagui";
import { StyleSheet, View } from "react-native";
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

export default function MapScreen() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
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
                    latitude: garden.latitude,
                    longitude: garden.longitude,
                  }}
                  title={garden.name}
                  description={garden.location}
                  onCalloutPress={() =>
                    router.push(`/garden/${garden.id}`)
                  }
                >
                  <Callout>
                    <YStack padding="$2" maxWidth={180}>
                      {garden.image_url && (
                        <Image
                          source={{ uri: garden.image_url }}
                          width={160}
                          height={80}
                          borderRadius="$2"
                        />
                      )}
                      <Text fontWeight="600" fontSize="$3" marginTop="$1">
                        {garden.name}
                      </Text>
                      <Text color="$secondary" fontSize="$2">
                        {garden.location} · {"★".repeat(Math.round(garden.rating))}
                      </Text>
                    </YStack>
                  </Callout>
                </Marker>
              )
          )}
        </MapView>
      )}

      <YStack position="absolute" top={insets.top} left={0} right={0} paddingHorizontal="$4">
        <TopNavPill title="Kaart" />
      </YStack>
    </View>
  );
}


