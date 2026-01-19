import type { LatLng } from '../types';
import { loadGoogleMaps } from './googleMapsLoader';

// Using Open Street Map's Nominatim API for free geocoding
const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  try {
    const response = await fetch(
      `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'map-scheduler-app',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json() as Array<{
      lat?: string;
      lon?: string;
    }>;

    if (data.length === 0) {
      return null;
    }

    const result = data[0];
    if (!result.lat || !result.lon) {
      return null;
    }

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

// Calculate distance between two coordinates in kilometers using Haversine formula
export function calculateDistance(from: LatLng, to: LatLng): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
    Math.cos((to.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearby appointments
export function findNearbyAppointments(
  center: LatLng,
  appointments: Array<LatLng & { id: string }>,
  radiusKm: number = 2
) {
  return appointments
    .map(apt => ({
      id: apt.id,
      distance: calculateDistance(center, apt),
    }))
    .filter(apt => apt.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

// Suggest optimal time slot based on existing appointments
export function suggestOptimalTime(
  appointments: Array<{ date: Date; time: string; duration?: number }>,
  targetDate: Date,
  durationMinutes: number = 30
): string {
  const WORK_START = 9 * 60;  // 09:00
  const WORK_END = 17 * 60;   // 17:00
  const STEP = 15;            // snap to 15-minute increments

  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const snap = (mins: number) => {
    const remainder = mins % STEP;
    return remainder === 0 ? mins : mins + (STEP - remainder);
  };

  // Normalize dates for comparison
  const normalizeDate = (d: Date) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };

  const targetDateNorm = normalizeDate(targetDate);
  const sameDay = appointments.filter(apt => normalizeDate(apt.date) === targetDateNorm);

  if (sameDay.length === 0) return '09:00';

  const intervals = sameDay
    .map(apt => {
      const start = toMinutes(apt.time);
      const duration = apt.duration ?? durationMinutes;
      const end = start + duration;
      return { start, end };
    })
    .sort((a, b) => a.start - b.start);

  let cursor = WORK_START;

  for (const { start, end } of intervals) {
    const candidate = snap(cursor);
    if (candidate + durationMinutes <= start) {
      return formatMinutes(candidate);
    }
    cursor = Math.max(cursor, end);
  }

  // After last appointment
  const lastCandidate = snap(cursor);
  if (lastCandidate + durationMinutes <= WORK_END) {
    return formatMinutes(lastCandidate);
  }

  // Fallback to earliest slot of the day if nothing fits (edge case: overbooked)
  return '09:00';
}

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Calculate drive time between two locations using Google Distance Matrix API
export async function calculateDriveTime(from: LatLng, to: LatLng): Promise<number | null> {
  try {
    await loadGoogleMaps(['routes']);
    
    const service = new google.maps.DistanceMatrixService();
    const response = await service.getDistanceMatrix({
      origins: [{ lat: from.lat, lng: from.lng }],
      destinations: [{ lat: to.lat, lng: to.lng }],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
    });

    if (response.rows[0]?.elements[0]?.duration) {
      return response.rows[0].elements[0].duration.value / 60; // convert seconds to minutes
    }
    return null;
  } catch (error) {
    console.error('Error calculating drive time:', error);
    return null;
  }
}
