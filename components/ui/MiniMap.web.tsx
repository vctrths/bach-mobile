import {
  groenLeafletMarkerIcon,
  groenLeafletStyles,
} from "@/components/ui/leafletPins";
import "leaflet/dist/leaflet.css";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

interface MiniMapProps {
  latitude: number;
  longitude: number;
}

export default function MiniMap({ latitude, longitude }: MiniMapProps) {
  const center = useMemo<[number, number]>(
    () => [latitude, longitude],
    [latitude, longitude],
  );

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <style>{`
        ${groenLeafletStyles}
        .leaflet-control-attribution {
          display: none;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={14}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        touchZoom={false}
        zoomControl={false}
        attributionControl={false}
        style={styles.map}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center} icon={groenLeafletMarkerIcon} interactive={false} />
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },
});
