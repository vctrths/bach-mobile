import React from "react";
import { Map, Marker } from "pigeon-maps";
import { StyleSheet, View } from "react-native";

interface MiniMapProps {
  latitude: number;
  longitude: number;
}

function CustomPin() {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#37392B",
        borderWidth: 3,
        borderColor: "#EAF0D8",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
        transform: [{ translateY: -14 }],
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
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

export default function MiniMap({ latitude, longitude }: MiniMapProps) {
  const center: [number, number] = [latitude, longitude];

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Map
        center={center}
        zoom={14}
        mouseEvents={false}
        touchEvents={false}
        metaWheelZoom={false}
      >
        <Marker anchor={center}>
          <CustomPin />
        </Marker>
      </Map>
    </View>
  );
}
