import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import type { Appointment } from '../types';

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

// Get all appointments for a rep
export async function getRepAppointments(repId: string): Promise<Appointment[]> {
  try {
    const q = query(collection(db, 'appointments'), where('repId', '==', repId));
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        name: data.name,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        date: data.date.toDate ? data.date.toDate() : new Date(data.date),
        time: data.time,
        duration: data.duration,
        notes: data.notes,
        status: data.status,
      });
    });
    
    return appointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

// Add appointment
export async function addAppointment(
  repId: string,
  appointment: Omit<Appointment, 'id'>
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      repId,
      ...appointment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding appointment:', error);
    return null;
  }
}

// Update appointment
export async function updateAppointment(
  appointmentId: string,
  updates: Partial<Appointment>
): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating appointment:', error);
    return false;
  }
}

// Delete appointment
export async function deleteAppointment(appointmentId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'appointments', appointmentId));
    return true;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return false;
  }
}

// Get or create rep
export async function getOrCreateRep(repId: string): Promise<{ id: string; createdAt: Date }> {
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
    console.error('Error creating rep:', error);
    return {
      id: repId,
      createdAt: new Date(),
    };
  }
}
