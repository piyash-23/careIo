'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { Heart, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            // Check if it's the admin email
            const adminEmail = 'arafat.ahmed2004@gmail.com';
            if (currentUser.email === adminEmail) {
              setRole('admin');
            } else {
              setRole('user'); // Default to user if no doc exists
            }
          }
        } catch (err) {
          console.error('Error fetching role:', err);
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
              <Heart className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Care.IO</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Home</Link>
            <Link href="/services" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Services</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {role === 'user' && (
                  <Link href="/apply-caretaker" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                    Become a Caretaker
                  </Link>
                )}
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium max-w-[120px] truncate">{user.displayName || user.email}</span>
                      {role && <span className="text-[10px] uppercase tracking-wider text-indigo-500 font-bold leading-none">{role}</span>}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Login</Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
