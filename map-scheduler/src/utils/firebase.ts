import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, connectFirestoreEmulator } from 'firebase/firestore';
import type { Appointment } from '../types';
import { logError, parseFirebaseError } from './errors';

// Validate Firebase config
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    'Missing Firebase environment variables:',
    missingEnvVars.join(', '),
    '\nPlease add these to your Vercel Environment Variables or .env.local file'
  );
}

// Initialize Firebase - Replace with your config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Connect to emulator in development if needed
if (process.env.NODE_ENV === 'development' && import.meta.env.VITE_USE_FIRESTORE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (e) {
    // Emulator already connected or not available
  }
}

// Get all appointments for a rep
export async function getRepAppointments(repId: string): Promise<Appointment[]> {
  if (!repId || typeof repId !== 'string') {
    logError('getRepAppointments', 'Invalid repId', { repId });
    return [];
  }

  try {
    const q = query(collection(db, 'appointments'), where('repId', '==', repId));
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        appointments.push({
          id: doc.id,
          name: data.name || '',
          address: data.address || '',
          lat: data.lat || 0,
          lng: data.lng || 0,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date || 0),
          time: data.time || '',
          duration: data.duration || 30,
          notes: data.notes || '',
          status: data.status || 'scheduled',
        });
      } catch (docError) {
        logError('getRepAppointments - doc parsing', docError, { docId: doc.id });
      }
    });
    
    return appointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    const errorInfo = parseFirebaseError(error);
    logError('getRepAppointments', error, { repId, errorCode: errorInfo.code });
    return [];
  }
}

// Add appointment
export async function addAppointment(
  repId: string,
  appointment: Omit<Appointment, 'id'>
): Promise<string | null> {
  if (!repId || typeof repId !== 'string') {
    logError('addAppointment', 'Invalid repId', { repId });
    return null;
  }

  if (!appointment.name || !appointment.address) {
    logError('addAppointment', 'Missing required fields', { 
      appointment: { name: !!appointment.name, address: !!appointment.address }
    });
    return null;
  }

  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      repId,
      ...appointment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    logError('addAppointment', 'success', { appointmentId: docRef.id, repId });
    return docRef.id;
  } catch (error) {
    const errorInfo = parseFirebaseError(error);
    logError('addAppointment', error, { repId, errorCode: errorInfo.code });
    return null;
  }
}

// Update appointment
export async function updateAppointment(
  appointmentId: string,
  updates: Partial<Appointment>
): Promise<boolean> {
  if (!appointmentId || typeof appointmentId !== 'string') {
    logError('updateAppointment', 'Invalid appointmentId', { appointmentId });
    return false;
  }

  try {
    await updateDoc(doc(db, 'appointments', appointmentId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    const errorInfo = parseFirebaseError(error);
    logError('updateAppointment', error, { appointmentId, errorCode: errorInfo.code });
    return false;
  }
}

// Delete appointment
export async function deleteAppointment(appointmentId: string): Promise<boolean> {
  if (!appointmentId || typeof appointmentId !== 'string') {
    logError('deleteAppointment', 'Invalid appointmentId', { appointmentId });
    return false;
  }

  try {
    await deleteDoc(doc(db, 'appointments', appointmentId));
    return true;
  } catch (error) {
    const errorInfo = parseFirebaseError(error);
    logError('deleteAppointment', error, { appointmentId, errorCode: errorInfo.code });
    return false;
  }
}

// Get or create rep
export async function getOrCreateRep(repId: string): Promise<{ id: string; createdAt: Date }> {
  if (!repId || typeof repId !== 'string') {
    logError('getOrCreateRep', 'Invalid repId', { repId });
    return {
      id: repId || 'unknown',
      createdAt: new Date(),
    };
  }

  try {
    // Check if rep exists
    const q = query(collection(db, 'reps'), where('repId', '==', repId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const repDoc = querySnapshot.docs[0].data();
      return {
        id: repId,
        createdAt: repDoc.createdAt?.toDate?.() || new Date(),
      };
    }
    
    // Create new rep
    await addDoc(collection(db, 'reps'), {
      repId,
      createdAt: serverTimestamp(),
    });
    
    return {
      id: repId,
      createdAt: new Date(),
    };
  } catch (error) {
    const errorInfo = parseFirebaseError(error);
    logError('getOrCreateRep', error, { repId, errorCode: errorInfo.code });
    return {
      id: repId,
      createdAt: new Date(),
    };
  }
}
