import React from "react";
import { Map, Marker } from "pigeon-maps";

interface MiniMapProps {
  latitude: number;
  longitude: number;
}

export default function MiniMap({ latitude, longitude }: MiniMapProps) {
  return (
    <Map
      defaultCenter={[latitude, longitude]}
      defaultZoom={14}
      mouseEvents={false}
      touchEvents={false}
    >
      <Marker anchor={[latitude, longitude]} color="#37392B" />
    </Map>
  );
}
