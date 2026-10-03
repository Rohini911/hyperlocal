import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom SVG Icons for Emergency Services
const createCustomIcon = (type, label = "") => {
  let color = "#ef4444";
  let iconSvg = "⚠️";
  
  if (type === "Ambulance") {
    color = "#3b82f6";
    iconSvg = "🚑";
  } else if (type === "Police") {
    color = "#f59e0b";
    iconSvg = "🚓";
  } else if (type === "Fire") {
    color = "#f97316";
    iconSvg = "🚒";
  } else if (type === "citizen") {
    color = "#ef4444";
    iconSvg = "📍";
  } else if (type === "picker") {
    color = "#10b981";
    iconSvg = "🎯";
  }

  const html = `
    <div style="
      position: relative;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      font-size: 20px;
      cursor: pointer;
      transform: translate(-50%, -50%);
    ">
      <span>${iconSvg}</span>
      ${label ? `<div style="position:absolute; bottom:-22px; white-space:nowrap; background:#111827; color:#f8fafc; font-size:11px; font-weight:bold; padding:2px 8px; border-radius:10px; border:1px solid rgba(255,255,255,0.2);">${label}</div>` : ''}
    </div>
  `;

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: html,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
};

// Component to handle draggable map pin picker
function LocationPicker({ position, onPositionChange }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    }
  });

  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          onPositionChange(latlng.lat, latlng.lng);
        }
      },
    }),
    [onPositionChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
      icon={createCustomIcon("picker", "Drag Pin to Incident")}
    >
      <Popup>
        <div style="text-align: center; color: #111;">
          <strong>Incident Location</strong><br/>
          Drag pin or click map to reposition
        </div>
      </Popup>
    </Marker>
  );
}

// Component to auto-center bounds smoothly when coordinates or route updates
function AutoBounds({ points }) {
  const map = useMap();
  const pointsKey = useMemo(() => JSON.stringify(points), [points]);

  useEffect(() => {
    if (!points || points.length === 0) return;
    try {
      const validPoints = points.filter(p => p && typeof p[0] === 'number' && typeof p[1] === 'number');
      if (validPoints.length === 1) {
        map.setView(validPoints[0], 14, { animate: false });
      } else if (validPoints.length > 1) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: false });
      }
    } catch (e) {
      console.warn("Error fitting bounds", e);
    }
  }, [pointsKey, map]);

  return null;
}

export default function MapComponent({
  center = [12.9716, 77.5946],
  zoom = 14,
  height = "380px",
  incidentLocation = null,
  incidentLabel = "Emergency Location",
  responderLocation = null,
  responderType = "Ambulance",
  responderLabel = "Assigned Unit",
  routeCoordinates = [],
  pickerMode = false,
  pickerCoords = null,
  onPickerCoordsChange = null,
  additionalMarkers = []
}) {
  const boundsPoints = useMemo(() => {
    const pts = [];
    if (incidentLocation) pts.push([incidentLocation.lat, incidentLocation.lng]);
    if (responderLocation) pts.push([responderLocation.lat, responderLocation.lng]);
    if (pickerCoords && pickerMode) pts.push([pickerCoords.lat, pickerCoords.lng]);
    if (routeCoordinates && routeCoordinates.length > 0) {
      pts.push(...routeCoordinates);
    }
    return pts;
  }, [incidentLocation, responderLocation, pickerCoords, pickerMode, routeCoordinates]);

  const mapCenter = useMemo(() => {
    if (incidentLocation) return [incidentLocation.lat, incidentLocation.lng];
    if (pickerCoords) return [pickerCoords.lat, pickerCoords.lng];
    return center;
  }, [incidentLocation, pickerCoords, center]);

  return (
    <div style={{ width: "100%", height, position: "relative", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoBounds points={boundsPoints} />

        {/* Picker mode */}
        {pickerMode && pickerCoords && onPickerCoordsChange && (
          <LocationPicker position={pickerCoords} onPositionChange={onPickerCoordsChange} />
        )}

        {/* Incident Marker */}
        {incidentLocation && (
          <Marker
            position={[incidentLocation.lat, incidentLocation.lng]}
            icon={createCustomIcon("citizen", incidentLabel)}
          >
            <Popup>
              <div style={{ color: "#000", padding: "4px" }}>
                <b style={{ color: "#ef4444" }}>🚨 {incidentLabel}</b>
                <p style={{ fontSize: "12px", margin: "4px 0" }}>Lat: {incidentLocation.lat.toFixed(5)}, Lng: {incidentLocation.lng.toFixed(5)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Responder Marker */}
        {responderLocation && (
          <Marker
            position={[responderLocation.lat, responderLocation.lng]}
            icon={createCustomIcon(responderType, responderLabel)}
          >
            <Popup>
              <div style={{ color: "#000", padding: "4px" }}>
                <b style={{ color: "#3b82f6" }}>{responderLabel} ({responderType})</b>
                <p style={{ fontSize: "12px", margin: "4px 0" }}>Simulated Live Vehicle</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Additional markers (e.g. for admin fleet overview) */}
        {additionalMarkers.map((m, idx) => (
          <Marker
            key={idx}
            position={[m.lat, m.lng]}
            icon={createCustomIcon(m.type, m.label)}
          >
            <Popup>
              <div style={{ color: "#000" }}>
                <strong>{m.title || m.label}</strong>
                <p style={{ fontSize: "11px" }}>{m.subtitle}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Polyline */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#3b82f6"
            weight={6}
            opacity={0.85}
            dashArray="1, 8"
            lineCap="round"
          />
        )}
      </MapContainer>
    </div>
  );
}
