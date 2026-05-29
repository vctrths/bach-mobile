import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

interface MiniMapProps {
  latitude: number;
  longitude: number;
}

const markerIcon = L.divIcon({
  className: "groen-leaflet-marker",
  html: `
    <div class="groen-leaflet-pin">
      <span></span>
    </div>
  `,
  iconSize: [32, 40],
  iconAnchor: [16, 36],
});

export default function MiniMap({ latitude, longitude }: MiniMapProps) {
  const center = useMemo<[number, number]>(
    () => [latitude, longitude],
    [latitude, longitude],
  );

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <style>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          background: #eef3e8;
        }
        .leaflet-control-attribution {
          display: none;
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
        .groen-leaflet-pin span {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #A9D18E;
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
        <Marker position={center} icon={markerIcon} interactive={false} />
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
