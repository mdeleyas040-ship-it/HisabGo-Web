import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { AppFinancialData } from '../types/backup';

export interface CloudSyncResult {
  success: boolean;
  error?: string;
  timestamp?: string;
}

export interface CloudUserData {
  data: AppFinancialData;
  updatedAt: unknown;
  clientUpdatedAt: string;
  schemaVersion: number;
}

/**
 * Saves or updates user financial data to Cloud Firestore under `users/{uid}`
 */
export async function uploadUserDataToCloud(
  uid: string,
  financialData: AppFinancialData
): Promise<CloudSyncResult> {
  if (!db) {
    return {
      success: false,
      error: 'ফায়ারবেস ডেটাবেস সংযোগ কনফিগার করা নেই।',
    };
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    const nowIso = new Date().toISOString();

    await setDoc(
      userDocRef,
      {
        data: financialData,
        updatedAt: serverTimestamp(),
        clientUpdatedAt: nowIso,
        schemaVersion: 1,
      },
      { merge: true }
    );

    return {
      success: true,
      timestamp: nowIso,
    };
  } catch (err: unknown) {
    console.error('Firestore upload error:', err);
    const message = err instanceof Error ? err.message : 'অজানা ক্লাউড ত্রুটি';
    return {
      success: false,
      error: `ক্লাউডে ডাটা সংরক্ষণ ব্যর্থ হয়েছে: ${message}`,
    };
  }
}

/**
 * Fetches user financial data from Cloud Firestore under `users/{uid}`
 */
export async function fetchUserDataFromCloud(
  uid: string
): Promise<{ success: boolean; data?: AppFinancialData; clientUpdatedAt?: string; error?: string }> {
  if (!db) {
    return {
      success: false,
      error: 'ফায়ারবেস ডেটাবেস সংযোগ কনফিগার করা নেই।',
    };
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      return {
        success: true,
        data: undefined, // No remote data yet (new user)
      };
    }

    const docData = docSnap.data() as CloudUserData;
    return {
      success: true,
      data: docData.data,
      clientUpdatedAt: docData.clientUpdatedAt,
    };
  } catch (err: unknown) {
    console.error('Firestore fetch error:', err);
    const message = err instanceof Error ? err.message : 'অজানা ক্লাউড ত্রুটি';
    return {
      success: false,
      error: `ক্লাউড থেকে ডাটা লোড ব্যর্থ হয়েছে: ${message}`,
    };
  }
}
