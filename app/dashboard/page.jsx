'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';

function DashboardRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let role = 'user'; // Default role

        if (userDoc.exists()) {
          role = userDoc.data().role;
        } else {
          // If no profile exists, check if it's the admin email
          const adminEmail = 'arafat.ahmed2004@gmail.com';
          if (user.email === adminEmail) {
            role = 'admin';
          }
          
          // Create the missing profile document
          try {
            const { setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              name: user.displayName || user.email.split('@')[0],
              email: user.email,
              role: role,
              createdAt: new Date().toISOString()
            });
          } catch (createErr) {
            console.error('Error creating missing profile:', createErr);
          }
        }
        
        router.replace(`/dashboard/${role}`);
      } catch (err) {
        console.error('Error fetching role for redirect:', err);
        // Fallback to user dashboard if something goes wrong but user is authenticated
        router.replace('/dashboard/user');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-indigo-600 font-bold tracking-widest uppercase text-sm">Loading Dashboard...</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardRedirect />
    </ProtectedRoute>
  );
}
