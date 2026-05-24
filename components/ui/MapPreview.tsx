import React from "react";
import { Platform, View } from "react-native";

interface Garden {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
}

interface MapPreviewProps {
  gardens: Garden[];
}

const DEFAULT_LAT = 50.8798;
const DEFAULT_LNG = 4.7005;

function computeNativeRegion(gardens: Garden[]) {
  const coords = gardens.filter(
    (g) => g.latitude != null && g.longitude != null
  ) as { latitude: number; longitude: number }[];

  if (coords.length === 0) {
    return {
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LNG,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  if (coords.length === 1) {
    return {
      latitude: coords[0].latitude,
      longitude: coords[0].longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  const latitudes = coords.map((c) => c.latitude);
  const longitudes = coords.map((c) => c.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const padding = 0.02;
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat + padding * 2, 0.02),
    longitudeDelta: Math.max(maxLng - minLng + padding * 2, 0.02),
  };
}

function computeWebCenterAndZoom(gardens: Garden[]) {
  const coords = gardens.filter(
    (g) => g.latitude != null && g.longitude != null
  ) as { latitude: number; longitude: number }[];

  if (coords.length === 0) {
    return {
      center: [DEFAULT_LAT, DEFAULT_LNG] as [number, number],
      zoom: 14,
    };
  }

  if (coords.length === 1) {
    return {
      center: [coords[0].latitude, coords[0].longitude] as [number, number],
      zoom: 14,
    };
  }

  const latitudes = coords.map((c) => c.latitude);
  const longitudes = coords.map((c) => c.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const center: [number, number] = [
    (minLat + maxLat) / 2,
    (minLng + maxLng) / 2,
  ];
  const maxSpread = Math.max(maxLat - minLat, maxLng - minLng);

  let zoom = 14;
  if (maxSpread > 0.5) zoom = 10;
  else if (maxSpread > 0.2) zoom = 11;
  else if (maxSpread > 0.1) zoom = 12;
  else if (maxSpread > 0.05) zoom = 13;

  return { center, zoom };
}

export default function MapPreview({ gardens }: MapPreviewProps) {
  if (Platform.OS === "web") {
    const { Map, Marker } = require("pigeon-maps") as any;
    const { center, zoom } = computeWebCenterAndZoom(gardens);
    const validGardens = gardens.filter(
      (g) => g.latitude != null && g.longitude != null
    );

    return (
      <View style={{ width: "100%", height: "100%" }}>
        <Map
          center={center}
          zoom={zoom}
          height={160}
          mouseEvents={false}
          touchEvents={false}
          metaWheelZoom={false}
        >
          {validGardens.map((garden) => (
            <Marker
              key={garden.id}
              anchor={[garden.latitude!, garden.longitude!]}
              width={12}
              height={12}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "#37392B",
                  borderWidth: 2,
                  borderColor: "#EAF0D8",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "#A9D18E",
                  }}
                />
              </View>
            </Marker>
          ))}
        </Map>
      </View>
    );
  }

  const { default: MapView, Marker } = require("react-native-maps") as any;
  const region = computeNativeRegion(gardens);
  const validGardens = gardens.filter(
    (g) => g.latitude != null && g.longitude != null
  );

  return (
    <View style={{ width: "100%", height: "100%" }}>
      <MapView
        style={{ width: "100%", height: "100%" }}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        cacheEnabled
      >
        {validGardens.map((garden) => (
          <Marker
            key={garden.id}
            coordinate={{
              latitude: garden.latitude!,
              longitude: garden.longitude!,
            }}
            title={garden.name}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: "#37392B",
                borderWidth: 2,
                borderColor: "#EAF0D8",
              }}
            />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}
