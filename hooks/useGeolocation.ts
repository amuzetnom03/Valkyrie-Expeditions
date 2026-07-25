'use client';

import { useState, useEffect } from 'react';
import { getDb, getAuthClient } from '@/lib/firebase';
import { doc, setDoc, Timestamp, collection } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';

export function useGeolocation(expeditionId: string, isTracking: boolean) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuthClient();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isTracking || !user) return;

    const db = getDb();
    if (!db) return;

    let watchId: number;

    const startTracking = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, altitude, speed } = position.coords;
          
          try {
            const memberRef = doc(db, 'expeditions', expeditionId, 'members', user.uid);
            await setDoc(memberRef, {
              id: user.uid,
              name: user.displayName || 'Anonymous Explorer',
              role: 'Expedition Member',
              lat: latitude,
              lng: longitude,
              alt: altitude || 0,
              speed: speed || 0,
              hr: 0, // Placeholder for external sensor
              battery: 100, // Placeholder
              status: 'active',
              updatedAt: Timestamp.now(),
              isUser: true
            }, { merge: true });
          } catch (err) {
            console.error('Error updating location:', err);
            setError('Failed to update location in database');
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError(err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    };

    startTracking();

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, user, expeditionId]);

  const joinMission = async () => {
    const auth = getAuthClient();
    if (!auth) return;
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error('Auth error:', err);
      setError('Failed to join mission');
    }
  };

  const triggerEmergency = async (type: 'HELI_EVAC' | 'MEDICAL') => {
    const auth = getAuthClient();
    const db = getDb();
    if (!auth || !auth.currentUser || !db) return;

    const user = auth.currentUser;

    // Get current position for the alert
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude, altitude } = position.coords;
      
      try {
        const alertRef = doc(collection(db, 'expeditions', expeditionId, 'alerts'));
        await setDoc(alertRef, {
          id: alertRef.id,
          userId: user.uid,
          userName: user.displayName || 'Expedition Member',
          lat: latitude,
          lng: longitude,
          alt: altitude || 0,
          type,
          timestamp: Timestamp.now()
        });

        // Update member status to emergency
        const memberRef = doc(db, 'expeditions', expeditionId, 'members', user.uid);
        await setDoc(memberRef, { 
          status: 'emergency',
          updatedAt: Timestamp.now()
        }, { merge: true });

      } catch (err) {
        console.error('Failed to trigger emergency:', err);
        setError('CRITICAL: Emergency signal failed to broadcast');
      }
    });
  };

  return { user, error, joinMission, triggerEmergency };
}
