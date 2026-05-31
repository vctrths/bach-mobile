import L from "leaflet";

export const groenLeafletMarkerIcon = L.divIcon({
  className: "groen-leaflet-marker",
  html: `
    <div class="groen-leaflet-pin">
      <span class="groen-leaflet-pin-core"></span>
    </div>
  `,
  iconSize: [34, 42],
  iconAnchor: [17, 41],
  popupAnchor: [0, -38],
});

export const groenLeafletActiveMarkerIcon = L.divIcon({
  className: "groen-leaflet-marker groen-leaflet-marker-active",
  html: `
    <div class="groen-leaflet-pin groen-leaflet-pin-active">
      <span class="groen-leaflet-pin-core"></span>
    </div>
  `,
  iconSize: [42, 50],
  iconAnchor: [21, 49],
  popupAnchor: [0, -46],
});

export const groenLeafletStyles = `
  .leaflet-container {
    width: 100%;
    height: 100%;
    font-family: Satoshi, Helvetica, Arial, sans-serif;
    background: #eef3e8;
    outline: none;
  }
  .leaflet-control-zoom {
    border: 0 !important;
    border-radius: 18px !important;
    box-shadow: 0 8px 22px rgba(23, 34, 17, 0.18);
    overflow: hidden;
  }
  .leaflet-control-zoom a {
    width: 42px !important;
    height: 42px !important;
    line-height: 40px !important;
    border: 0 !important;
    color: #172211 !important;
    background: rgba(255, 255, 255, 0.94) !important;
    font-size: 24px !important;
    font-weight: 700;
  }
  .leaflet-control-zoom a:first-child {
    border-bottom: 1px solid rgba(23, 34, 17, 0.08) !important;
  }
  .leaflet-control-zoom a:hover,
  .leaflet-control-zoom a:focus {
    background: #eaf0d8 !important;
    color: #172211 !important;
  }
  .leaflet-control-attribution {
    border-radius: 12px 0 0 0;
    color: #57594d;
    font-size: 10px;
  }
  .leaflet-popup-content-wrapper {
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(23, 34, 17, 0.18);
  }
  .leaflet-popup-content {
    margin: 12px;
  }
  .leaflet-popup-tip {
    box-shadow: 0 8px 24px rgba(23, 34, 17, 0.12);
  }
  .groen-leaflet-marker {
    background: transparent;
    border: 0;
  }
  .groen-leaflet-pin {
    width: 30px;
    height: 30px;
    border: 3px solid #ffffff;
    border-radius: 50% 50% 50% 8px;
    background: #172211;
    box-shadow: 0 8px 18px rgba(23, 34, 17, 0.32);
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotate(-45deg);
    transform-origin: center;
  }
  .groen-leaflet-pin-active {
    width: 38px;
    height: 38px;
    background: #173300;
    border-color: #eaf0d8;
    box-shadow: 0 10px 24px rgba(23, 51, 0, 0.36);
  }
  .groen-leaflet-pin-core {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #ffffff;
    display: block;
    transform: rotate(45deg);
  }
  .groen-leaflet-pin-active .groen-leaflet-pin-core {
    width: 11px;
    height: 11px;
    background: #d4e1ae;
  }
`;
