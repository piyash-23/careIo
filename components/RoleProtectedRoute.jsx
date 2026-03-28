'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let role = 'user';
        
        if (userDoc.exists()) {
          role = userDoc.data().role;
        } else {
          // Admin email check
          const adminEmail = 'arafat.ahmed2004@gmail.com';
          if (user.email === adminEmail) {
            role = 'admin';
          }
        }

        if (allowedRoles.includes(role)) {
          setAuthorized(true);
        } else {
          // Redirect to their own dashboard if they try to access another one
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error('Error in RoleProtectedRoute:', err);
        router.replace('/');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-bold tracking-widest uppercase text-sm">Verifying Permissions...</p>
        </div>
      </div>
    );
  }

  return authorized ? children : null;
}
