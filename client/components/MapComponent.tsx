"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix lỗi mất icon mặc định của Leaflet trong Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const customIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component điều chỉnh khung hình bản đồ để bao trọn các điểm
function MapUpdater({ locations }: { locations: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);
  return null;
}

// Import useMap hook
import { useMap } from "react-leaflet";

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

interface MapProps {
  locations: Location[];
  center: [number, number]; // Tọa độ trung tâm mặc định
}

export default function MapComponent({ locations, center }: MapProps) {
  // Tạo đường nối giữa các điểm (Polyline)
  const polylinePositions = locations.map(
    (loc) => [loc.lat, loc.lng] as [number, number]
  );

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Tự động zoom map theo các điểm */}
      <MapUpdater locations={locations} />

      {/* Vẽ các điểm Marker */}
      {locations.map((loc, index) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customIcon}>
          <Popup>
            <div className="text-center">
              <strong className="block text-blue-600">
                Điểm số {index + 1}
              </strong>
              {loc.name}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Vẽ đường nối */}
      {locations.length > 1 && (
        <Polyline
          positions={polylinePositions}
          pathOptions={{
            color: "blue",
            weight: 4,
            dashArray: "10, 10",
            opacity: 0.6,
          }}
        />
      )}
    </MapContainer>
  );
}
