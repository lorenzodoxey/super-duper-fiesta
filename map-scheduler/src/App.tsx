import { useState, useCallback, useEffect } from 'react';
import { Calendar, LogOut, AlertCircle } from 'lucide-react';
import './App.css';
import MapView from './components/MapView';
import SidePanel from './components/SidePanel';
import AppointmentForm from './components/AppointmentForm';
import DateSelector from './components/DateSelector';
import RepSelector from './components/RepSelector';
import Pricing from './components/Pricing';
import type { Appointment } from './types';
import { getRepAppointments, addAppointment, updateAppointment, deleteAppointment, getOrCreateRep } from './utils/firebase';
import { parseFirebaseError } from './utils/errors';

export default function App() {
  const [repId, setRepId] = useState<string | null>(() => {
    // Check localStorage for saved rep ID
    return localStorage.getItem('repId');
  });

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      name: 'John Smith',
      address: '400 S Akard St, Dallas, TX 75202',
      lat: 32.7763,
      lng: -96.7969,
      date: new Date(2026, 0, 17, 10, 0),
      time: '10:00',
      duration: 30,
      notes: 'Interested in solar panels',
      status: 'scheduled',
    },
    {
      id: '2',
      name: 'Jane Doe',
      address: '2000 Ross Ave, Dallas, TX 75201',
      lat: 32.7879,
      lng: -96.7990,
      date: new Date(2026, 0, 17, 11, 0),
      time: '11:00',
      duration: 30,
      notes: 'Follow-up call',
      status: 'scheduled',
    },
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 17));
  const [selectedId, setSelectedId] = useState<string | null>(appointments[0]?.id || null);
  const [showForm, setShowForm] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('mi');
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Load appointments from Firebase when rep ID is set
  useEffect(() => {
    if (!repId) return;

    const loadAppointments = async () => {
      setLoadingAppointments(true);
      setError(null);
      try {
        // Initialize rep in Firebase
        await getOrCreateRep(repId);
        
        // Load their appointments
        const firebaseAppointments = await getRepAppointments(repId);
        
        // If they have appointments, use those. Otherwise, use demo data for first time
        if (firebaseAppointments.length > 0) {
          setAppointments(firebaseAppointments);
          if (firebaseAppointments.length > 0) {
            setSelectedId(firebaseAppointments[0].id);
          }
        }
      } catch (error) {
        const errorInfo = parseFirebaseError(error);
        setError(errorInfo.userMessage);
        console.error('Error loading appointments:', error);
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, [repId]);

  // Filter appointments by selected date or show all
  const appointmentsForDate = showAllAppointments 
    ? appointments 
    : appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return (
          aptDate.getFullYear() === selectedDate.getFullYear() &&
          aptDate.getMonth() === selectedDate.getMonth() &&
          aptDate.getDate() === selectedDate.getDate()
        );
      });

  const addAppointmentHandler = useCallback((appointment: Omit<Appointment, 'id'>) => {
    const addToFirebase = async () => {
      if (!repId) {
        setError('Please sign in first');
        return;
      }
      
      setError(null);
      try {
        const id = await addAppointment(repId, appointment);
        if (id) {
          const newAppointment: Appointment = {
            ...appointment,
            id,
          };
          setAppointments(prev => [...prev, newAppointment]);
          setSelectedId(id);
          setSelectedDate(appointment.date);
          setShowForm(false);
          setPendingLocation(null);
        } else {
          setError('Failed to save appointment. Please try again.');
        }
      } catch (error) {
        const errorInfo = parseFirebaseError(error);
        setError(errorInfo.userMessage);
        console.error('Error adding appointment:', error);
      }
    };

    addToFirebase();
  }, [repId]);

  const updateAppointmentHandler = useCallback((id: string, updates: Partial<Appointment>) => {
    const updateInFirebase = async () => {
      setError(null);
      try {
        const success = await updateAppointment(id, updates);
        if (success) {
          setAppointments(prev =>
            prev.map(apt => (apt.id === id ? { ...apt, ...updates } : apt))
          );
        } else {
          setError('Failed to update appointment. Please try again.');
        }
      } catch (error) {
        const errorInfo = parseFirebaseError(error);
        setError(errorInfo.userMessage);
        console.error('Error updating appointment:', error);
      }
    };

    updateInFirebase();
  }, []);

  const deleteAppointmentHandler = useCallback((id: string) => {
    const deleteFromFirebase = async () => {
      setError(null);
      try {
        const success = await deleteAppointment(id);
        if (success) {
          setAppointments(prev => prev.filter(apt => apt.id !== id));
          if (selectedId === id) {
            setSelectedId(appointments.find(a => a.id !== id)?.id || null);
          }
        } else {
          setError('Failed to delete appointment. Please try again.');
        }
      } catch (error) {
        const errorInfo = parseFirebaseError(error);
        setError(errorInfo.userMessage);
        console.error('Error deleting appointment:', error);
      }
    };

    deleteFromFirebase();
  }, [appointments, selectedId]);

  const selectedAppointment = appointments.find(apt => apt.id === selectedId);

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>MHM Map Scheduler</h1>
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <button 
          className={`btn-all-appointments ${showAllAppointments ? 'active' : ''}`}
          onClick={() => setShowAllAppointments(!showAllAppointments)}
          title={showAllAppointments ? 'Show current day' : 'Show all appointments'}
        >
          <Calendar size={18} />
          <span>{showAllAppointments ? 'All' : 'Day'}</span>
        </button>
        <button
          className="btn-pricing"
          onClick={() => setShowPricing(!showPricing)}
          title="View pricing"
        >
          💳 Plans
        </button>
        <button
          className="btn-logout"
          onClick={() => {
            localStorage.removeItem('repId');
            setRepId(null);
          }}
          title="Switch user"
        >
          <LogOut size={18} />
        </button>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button 
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}

      {loadingAppointments && (
        <div className="loading-banner">
          <span>Loading your appointments...</span>
        </div>
      )}
      
      <div className="app-main">
        <MapView
          appointments={appointmentsForDate}
          selectedId={selectedId}
          onSelectAppointment={setSelectedId}
          onMapClick={(lat, lng) => {
            setPendingLocation({ lat, lng });
            setShowForm(true);
          }}
        />
        <SidePanel
          appointments={appointmentsForDate}
          selectedAppointment={selectedAppointment}
          onSelectAppointment={setSelectedId}
          onAddAppointment={() => {
            setPendingLocation(null);
            setShowForm(true);
          }}
          onUpdateAppointment={updateAppointmentHandler}
          onDeleteAppointment={deleteAppointmentHandler}
          distanceUnit={distanceUnit}
          onDistanceUnitChange={setDistanceUnit}
        />
      </div>

      {showForm && (
        <AppointmentForm
          onSubmit={addAppointmentHandler}
          onCancel={() => {
            setShowForm(false);
            setPendingLocation(null);
          }}
          existingAppointments={appointments}
          suggestedDate={selectedDate}
          initialLocation={pendingLocation}
          distanceUnit={distanceUnit}
        />
      )}

      {showPricing && (
        <Pricing 
          repId={repId}
          onClose={() => setShowPricing(false)}
        />
      )}

      {!repId && (
        <RepSelector 
          onRepSelected={(newRepId) => {
            setRepId(newRepId);
          }}
        />
      )}
    </div>
  );
}
