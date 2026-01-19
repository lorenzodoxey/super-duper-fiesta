import { useEffect, useState } from 'react';
import { Plus, Trash2, MapPin, Clock, FileText, CheckCircle, XCircle, AlertCircle, CalendarDays, ArrowLeft } from 'lucide-react';
import { format, formatDistance } from 'date-fns';
import type { Appointment } from '../types';
import { calculateDriveTime } from '../utils/geocoding';
import './SidePanel.css';

interface SidePanelProps {
  appointments: Appointment[];
  selectedAppointment: Appointment | undefined;
  onSelectAppointment: (id: string) => void;
  onAddAppointment: () => void;
  onUpdateAppointment: (id: string, updates: Partial<Appointment>) => void;
  onDeleteAppointment: (id: string) => void;
  distanceUnit: 'km' | 'mi';
  onDistanceUnitChange: (unit: 'km' | 'mi') => void;
}

export default function SidePanel({
  appointments,
  selectedAppointment,
  onSelectAppointment,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  distanceUnit,
  onDistanceUnitChange,
}: SidePanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [lastDetailId, setLastDetailId] = useState<string | null>(null);
  const [driveTimes, setDriveTimes] = useState<Record<string, number | null>>({});

  // Sort by date and time
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    // If same date, sort by time
    return a.time.localeCompare(b.time);
  });

  // Calculate drive times between consecutive appointments
  useEffect(() => {
    const calculateConsecutiveDriveTimes = async () => {
      const times: Record<string, number | null> = {};
      for (let i = 0; i < sortedAppointments.length - 1; i++) {
        const current = sortedAppointments[i];
        const next = sortedAppointments[i + 1];
        const driveTime = await calculateDriveTime(
          { lat: current.lat, lng: current.lng },
          { lat: next.lat, lng: next.lng }
        );
        times[current.id] = driveTime;
      }
      setDriveTimes(times);
    };
    calculateConsecutiveDriveTimes();
  }, [sortedAppointments]);

  useEffect(() => {
    if (selectedAppointment && selectedAppointment.id !== lastDetailId) {
      setShowDetails(true);
      setLastDetailId(selectedAppointment.id);
    }
  }, [selectedAppointment, lastDetailId]);

  return (
    <div className="side-panel">
      <div className="panel-header">
        <h1>Appointment Schedule</h1>
        <button className="btn-primary btn-add" onClick={onAddAppointment}>
          <Plus size={18} />
          New
        </button>
      </div>

      {(!showDetails || !selectedAppointment) && (
        <div className="appointments-list">
          <div className="list-header">
            <div>
              <h3>Appointments</h3>
              <p className="list-sub">{sortedAppointments.length || 'No'} on this day</p>
            </div>
          </div>

          <div className="list-container timeline-list">
            {sortedAppointments.map((apt, idx) => (
              <div key={apt.id}>
                <button
                  className={`appointment-card ${selectedAppointment?.id === apt.id ? 'active' : ''} status-${apt.status}`}
                  onClick={() => {
                    onSelectAppointment(apt.id);
                    setShowDetails(true);
                    setLastDetailId(apt.id);
                  }}
                >
                  <div className="card-rail" aria-hidden />
                  <div className="card-content">
                    <div className="card-row">
                      <span className="card-name">{apt.name}</span>
                      <span className={`status-pill status-${apt.status}`}>{apt.status}</span>
                    </div>
                    <div className="card-meta">
                      <span className="meta-chip"><Clock size={14} />{apt.time}</span>
                      <span className="meta-chip"><CalendarDays size={14} />{format(apt.date, 'MMM d')}</span>
                    </div>
                    <div className="card-address">
                      <MapPin size={14} />
                      <span>{apt.address}</span>
                    </div>
                  </div>
                </button>
                {idx < sortedAppointments.length - 1 && driveTimes[apt.id] !== null && (
                  <div className="drive-time-indicator">
                    ↓ {Math.round(driveTimes[apt.id]!)} min drive
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showDetails && selectedAppointment && (
        <div className="detail-view">
          <div className="detail-top">
            <button className="back-button" onClick={() => setShowDetails(false)}>
              <ArrowLeft size={16} />
              <span>Back to list</span>
            </button>
            <button
              className="btn-danger btn-small"
              onClick={() => onDeleteAppointment(selectedAppointment.id)}
              title="Delete appointment"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="detail-header">
            <div>
              <p className="detail-label">Selected</p>
              <h2>{selectedAppointment.name}</h2>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-item">
              <MapPin size={16} />
              <div>
                <label>Address</label>
                <p>{selectedAppointment.address}</p>
              </div>
            </div>

            <div className="detail-item">
              <Clock size={16} />
              <div>
                <label>Date & Time</label>
                <p>{format(selectedAppointment.date, 'MMM d, yyyy')} · {selectedAppointment.time}</p>
                <p className="time-distance">
                  {formatDistance(selectedAppointment.date, new Date(), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="detail-item">
              <Clock size={16} />
              <div>
                <label>Duration</label>
                <p>{selectedAppointment.duration} minutes</p>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div className="detail-item">
                <FileText size={16} />
                <div>
                  <label>Notes</label>
                  <p>{selectedAppointment.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="detail-actions">
            <select
              className="status-select"
              value={selectedAppointment.status}
              onChange={(e) =>
                onUpdateAppointment(selectedAppointment.id, {
                  status: e.target.value as 'scheduled' | 'completed' | 'cancelled',
                })
              }
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="settings-card-bottom">
            <span className="settings-label">Units</span>
            <select
              value={distanceUnit}
              onChange={(e) => onDistanceUnitChange(e.target.value as 'km' | 'mi')}
              className="settings-select-small"
            >
              <option value="km">km</option>
              <option value="mi">mi</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
