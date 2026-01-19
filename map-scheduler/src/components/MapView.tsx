import { useEffect, useRef } from 'react';
import type { Appointment } from '../types';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import './MapView.css';

interface MapViewProps {
  appointments: Appointment[];
  selectedId: string | null;
  onSelectAppointment: (id: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function MapView({ appointments, selectedId, onSelectAppointment, onMapClick }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindows = useRef<Map<string, google.maps.InfoWindow>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    loadGoogleMaps(['places']).then(() => {
      map.current = new google.maps.Map(mapContainer.current!, {
        zoom: 12,
        center: { lat: 32.7767, lng: -96.7970 },
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
      });

      if (onMapClick) {
        map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onMapClick(e.latLng.lat(), e.latLng.lng());
          }
        });
      }
    });
  }, [onMapClick]);

  // Update markers
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers and info windows
    markers.current.forEach(marker => marker.setMap(null));
    infoWindows.current.forEach(iw => iw.close());
    markers.current.clear();
    infoWindows.current.clear();

    // Add new markers
    appointments.forEach(apt => {
      const isSelected = apt.id === selectedId;
      const timeStr = apt.time;
      
      const marker = new google.maps.Marker({
        position: { lat: apt.lat, lng: apt.lng },
        map: map.current!,
        title: `${apt.name} - ${timeStr}`,
        icon: createMarkerIcon(apt, isSelected),
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="gmap-popup" style="padding: 12px; min-width: 200px;">
            <strong style="display: block; margin-bottom: 4px; color: #1f2937;">${apt.name}</strong>
            <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">${apt.address}</p>
            <p style="font-weight: 600; color: #3b82f6; margin-top: 8px;">${timeStr}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        // Close all other info windows
        infoWindows.current.forEach((iw, id) => {
          if (id !== apt.id) iw.close();
        });
        infoWindow.open(map.current!, marker);
        onSelectAppointment(apt.id);
      });

      markers.current.set(apt.id, marker);
      infoWindows.current.set(apt.id, infoWindow);
    });

    // Fit bounds
    if (appointments.length > 0 && map.current) {
      const bounds = new google.maps.LatLngBounds();
      appointments.forEach(apt => {
        bounds.extend({ lat: apt.lat, lng: apt.lng });
      });
      map.current.fitBounds(bounds, 50);
    }
  }, [appointments, selectedId, onSelectAppointment]);

  // Update selected marker color
  useEffect(() => {
    if (!map.current) return;

    appointments.forEach(apt => {
      const marker = markers.current.get(apt.id);
      if (marker) {
        marker.setIcon(createMarkerIcon(apt, apt.id === selectedId));
      }
    });
  }, [selectedId, appointments]);

  return <div className="map-view" ref={mapContainer} />;
}

function createMarkerIcon(apt: Appointment, isSelected: boolean): google.maps.Icon {
  const scale = isSelected ? 1.2 : 1;
  const width = Math.round(56 * scale);
  const height = Math.round(72 * scale);
  const timeSize = Math.round(11 * scale);
  const pinColor = isSelected ? '#ed8074' : '#00305b';
  const textColor = isSelected ? '#00305b' : '#ed8074';

  const svg = `
    <svg viewBox="0 0 56 72" xmlns="http://www.w3.org/2000/svg">
      <!-- Pin shape -->
      <path d="M28 0 C41 0 52 11 52 24 C52 38 28 72 28 72 C28 72 4 38 4 24 C4 11 15 0 28 0" fill="${pinColor}" stroke="white" stroke-width="2.5" />
      <!-- Time circle in pin -->
      <circle cx="28" cy="24" r="16" fill="white" stroke="${pinColor}" stroke-width="2" />
      <text x="28" y="28" font-size="${timeSize}px" font-weight="700" font-family="Poppins, sans-serif" text-anchor="middle" fill="${textColor}">${apt.time}</text>
    </svg>
  `;

  const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
  
  return {
    url: dataUrl,
    scaledSize: new google.maps.Size(width, height),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(width / 2, height),
  };
}
