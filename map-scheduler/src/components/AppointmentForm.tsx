import { useEffect, useRef, useState } from 'react';
import { X, MapPin, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Appointment } from '../types';
import { geocodeAddress, calculateDistance, suggestOptimalTime, calculateDriveTime } from '../utils/geocoding';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import './AppointmentForm.css';

interface AppointmentFormProps {
  onSubmit: (appointment: Omit<Appointment, 'id'>) => void;
  onCancel: () => void;
  existingAppointments: Appointment[];
  suggestedDate: Date;
  initialLocation?: { lat: number; lng: number } | null;
  distanceUnit: 'km' | 'mi';
}

interface FormData {
  name: string;
  address: string;
  date: string;
  time: string;
  duration: string;
  notes: string;
}

interface FormError {
  field: string;
  message: string;
}

const formatDistanceValue = (km: number, unit: 'km' | 'mi') => {
  if (Number.isNaN(km)) return '';
  if (unit === 'mi') return `${(km * 0.621371).toFixed(1)} mi`;
  return `${km.toFixed(1)} km`;
};

const ADDRESS_LOOKUP_DELAY_MS = 400;

export default function AppointmentForm({
  onSubmit,
  onCancel,
  existingAppointments,
  suggestedDate,
  initialLocation,
  distanceUnit,
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    date: format(suggestedDate, 'yyyy-MM-dd'),
    time: suggestOptimalTime(existingAppointments, suggestedDate),
    duration: '30',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [addressBusy, setAddressBusy] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [nearbyAppointments, setNearbyAppointments] = useState<Array<Appointment & { distance: number; driveTime: number | null }>>([]);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [daySuggestion, setDaySuggestion] = useState<string | null>(null);
  const [closestAppointments, setClosestAppointments] = useState<Array<Appointment & { distance: number; driveTime: number | null }>>([]);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const addressTimerRef = useRef<number | null>(null);
  const selectedCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    loadGoogleMaps(['places']).then(() => {
      if (addressInputRef.current && !autocompleteRef.current) {
        autocompleteRef.current = new google.maps.places.Autocomplete(addressInputRef.current, {
          fields: ['formatted_address', 'geometry', 'name'],
          types: ['address'],
        });
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current!.getPlace();
          if (!place || !place.geometry || !place.geometry.location) return;
          const formatted = place.formatted_address || addressInputRef.current!.value;
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          selectedCoordsRef.current = { lat, lng };
          setFormData(prev => ({ ...prev, address: formatted }));
          updateSuggestions({ lat, lng });
        });
      }
    });
  }, []);

  // Seed location if clicked on map
  useEffect(() => {
    if (initialLocation) {
      setLoading(true);
      geocodeAddress(`${initialLocation.lat}, ${initialLocation.lng}`)
        .then(addr => {
          if (addr) {
            selectedCoordsRef.current = { lat: initialLocation.lat, lng: initialLocation.lng };
            setFormData(prev => ({ ...prev, address: `${initialLocation.lat}, ${initialLocation.lng}` }));
            updateSuggestions({ lat: initialLocation.lat, lng: initialLocation.lng });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [initialLocation]);

  useEffect(() => {
    if (selectedCoordsRef.current) {
      updateSuggestions(selectedCoordsRef.current);
    }
  }, [distanceUnit]);

  // Update suggestions when duration changes
  useEffect(() => {
    if (selectedCoordsRef.current) {
      updateSuggestions(selectedCoordsRef.current);
    }
  }, [formData.duration]);

  const updateSuggestions = async (coords: { lat: number; lng: number }) => {
    if (!existingAppointments.length) {
      setDaySuggestion(null);
      setClosestAppointments([]);
      return;
    }

    // Calculate distance for all appointments and sort
    const withDistance = existingAppointments
      .map(apt => ({
        ...apt,
        distance: calculateDistance(coords, { lat: apt.lat, lng: apt.lng }),
        driveTime: null as number | null,
      }))
      .sort((a, b) => a.distance - b.distance);

    // Get top 3 closest appointments and fetch their drive times
    const topThree = withDistance.slice(0, 3);
    for (const apt of topThree) {
      apt.driveTime = await calculateDriveTime(coords, { lat: apt.lat, lng: apt.lng });
    }

    setClosestAppointments(topThree);

    // Use the closest appointment to suggest a day
    const primary = withDistance[0];
    if (!primary) {
      setDaySuggestion(null);
      return;
    }

    // Suggest time for that date
    const suggestedDate = new Date(primary.date);
    const durationMin = parseInt(formData.duration) || 30;
    const suggestedTime = suggestOptimalTime(
      existingAppointments,
      suggestedDate,
      durationMin
    );

    // Update form with suggested date and time
    setFormData(prev => ({
      ...prev,
      date: format(suggestedDate, 'yyyy-MM-dd'),
      time: suggestedTime,
    }));

    const driveTimeStr = primary.driveTime ? ` · ${Math.round(primary.driveTime)} min drive` : '';
    setDaySuggestion(
      `${format(suggestedDate, 'EEE, MMM d')} · near ${formatDistanceValue(primary.distance, distanceUnit)}${driveTimeStr} · try ${suggestedTime}`
    );
  };

  const validateForm = () => {
    const newErrors: FormError[] = [];

    if (!formData.name.trim()) {
      newErrors.push({ field: 'name', message: 'Name is required' });
    }
    if (!formData.address.trim()) {
      newErrors.push({ field: 'address', message: 'Address is required' });
    }
    if (!formData.date) {
      newErrors.push({ field: 'date', message: 'Date is required' });
    }
    if (!formData.time) {
      newErrors.push({ field: 'time', message: 'Time is required' });
    }
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.push({ field: 'duration', message: 'Duration must be greater than 0' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setFormData(prev => ({ ...prev, address }));
    selectedCoordsRef.current = null;

    // clear existing timer
    if (addressTimerRef.current) {
      window.clearTimeout(addressTimerRef.current);
    }

    if (address.trim().length < 5) {
      setAddressBusy(false);
      setNearbyAppointments([]);
      return;
    }

    setAddressBusy(true);
    addressTimerRef.current = window.setTimeout(async () => {
      try {
        const coords = await geocodeAddress(address);
        if (coords) {
          selectedCoordsRef.current = coords;
          updateSuggestions(coords);
          const nearbyRadiusKm = distanceUnit === 'mi' ? 1.6 : 2;
          const nearby = existingAppointments
            .map(apt => ({
              ...apt,
              distance: calculateDistance(coords, { lat: apt.lat, lng: apt.lng }),
              driveTime: null as number | null,
            }))
            .filter(apt => apt.distance < nearbyRadiusKm)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3);

          // Fetch drive times for nearby appointments
          for (const apt of nearby) {
            apt.driveTime = await calculateDriveTime(coords, { lat: apt.lat, lng: apt.lng });
          }

          setNearbyAppointments(nearby);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      } finally {
        setAddressBusy(false);
      }
    }, ADDRESS_LOOKUP_DELAY_MS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const coords = selectedCoordsRef.current ?? await geocodeAddress(formData.address);

      if (!coords) {
        setErrors([{ field: 'address', message: 'Could not find address' }]);
        setLoading(false);
        return;
      }

      const [hours, minutes] = formData.time.split(':').map(Number);
      const [y, m, d] = formData.date.split('-').map(Number);
      // Build local date to avoid timezone shifting a day backward
      const date = new Date(y, (m ?? 1) - 1, d ?? 1, hours ?? 0, minutes ?? 0, 0, 0);

      onSubmit({
        name: formData.name.trim(),
        address: formData.address.trim(),
        lat: coords.lat,
        lng: coords.lng,
        date,
        time: formData.time,
        duration: parseInt(formData.duration),
        notes: formData.notes.trim(),
        status: 'scheduled',
      });
    } catch (err) {
      setErrors([{ field: 'form', message: 'Error creating appointment' }]);
    } finally {
      setLoading(false);
    }
  };

  const hasError = (field: string) => errors.some(e => e.field === field);
  const getError = (field: string) => errors.find(e => e.field === field)?.message;

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <div className="form-header">
          <h2>New Appointment</h2>
          <button className="btn-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="appointment-form">
          {errors.some(e => e.field === 'form') && (
            <div className="form-error">
              <AlertCircle size={16} />
              {getError('form')}
            </div>
          )}

          <div className="form-group">
            {closestAppointments.length > 0 && (
              <div className="closest-list">
                <p className="closest-label">Closest appointments:</p>
                {closestAppointments.map(apt => (
                  <div key={apt.id} className="closest-item">
                    <span className="closest-name">{apt.name}</span>
                    <span className="closest-meta">{format(apt.date, 'EEE MMM d')} · {apt.time}</span>
                    <span className="closest-distance">
                      {formatDistanceValue(apt.distance, distanceUnit)}
                      {apt.driveTime ? ` · ${Math.round(apt.driveTime)}m` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <label>Contact Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Smith"
              className={hasError('name') ? 'error' : ''}
            />
            {hasError('name') && <span className="error-text">{getError('name')}</span>}
          </div>

          <div className="form-group">
            <label>Address *</label>
            <div className="input-wrapper">
              <MapPin size={16} className="input-icon" />
              <input
                type="text"
                ref={addressInputRef}
                value={formData.address}
                onChange={handleAddressChange}
                placeholder="123 Main St, New York, NY"
                className={hasError('address') ? 'error' : ''}
                aria-busy={addressBusy}
              />
            </div>
            {hasError('address') && <span className="error-text">{getError('address')}</span>}
            {daySuggestion && (
              <div className="day-suggestion">Suggested day: {daySuggestion}</div>
            )}

            {nearbyAppointments.length > 0 && (
              <div className="nearby-appointments">
                <p className="nearby-label">Nearby appointments:</p>
                {nearbyAppointments.map(apt => (
                  <div key={apt.id} className="nearby-item">
                    <span className="nearby-name">{apt.name}</span>
                    <span className="nearby-distance">
                      {formatDistanceValue(apt.distance, distanceUnit)}
                      {apt.driveTime ? ` · ${Math.round(apt.driveTime)}m` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={hasError('date') ? 'error' : ''}
              />
              {hasError('date') && <span className="error-text">{getError('date')}</span>}
            </div>

            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className={hasError('time') ? 'error' : ''}
              />
              {hasError('time') && <span className="error-text">{getError('time')}</span>}
            </div>
          </div>

          <div className="details-toggle" onClick={() => setDetailsOpen(prev => !prev)}>
            <span>Additional details</span>
            <span className={`chevron ${detailsOpen ? 'open' : ''}`}>▾</span>
          </div>

          {detailsOpen && (
            <div className="details-section">
              <div className="form-group">
                <label>Duration (minutes) *</label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className={hasError('duration') ? 'error' : ''}
                />
                {hasError('duration') && <span className="error-text">{getError('duration')}</span>}
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this appointment..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
