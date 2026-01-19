export interface Appointment {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  date: Date;
  time: string;
  duration: number; // in minutes
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface LatLng {
  lat: number;
  lng: number;
}
