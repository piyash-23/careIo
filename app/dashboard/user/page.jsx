'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Clock, MapPin, Calendar, CheckCircle, XCircle, AlertCircle, LayoutDashboard, ChevronRight, Heart, Star } from 'lucide-react';
import { format } from 'date-fns';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import { handleFirestoreError } from '@/lib/utils';

function UserDashboardContent() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'list', 'bookings');
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Dashboard</h1>
              <p className="text-gray-500">Welcome back, {user.displayName || 'User'}</p>
            </div>
          </div>
          <Link
            href="/services"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 w-fit"
          >
            Book New Service <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Recent Bookings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
                <Link href="/my-bookings" className="text-indigo-600 font-semibold text-sm hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {bookings.length === 0 ? (
                  <div className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">No bookings found. Start by exploring our services!</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <Heart className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{booking.serviceTitle}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {booking.duration}h • ${booking.totalCost}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(booking.status)} uppercase tracking-wider`}>
                          {booking.status}
                        </span>
                        <div className="text-[10px] text-gray-400 font-medium">
                          {booking.createdAt ? format(booking.createdAt.toDate(), 'MMM dd, yyyy') : '...'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
                  <p className="text-indigo-100 mb-6 opacity-90">Our support team is available 24/7 to assist you with your care needs.</p>
                  <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-all">
                    Contact Support
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Heart className="w-32 h-32" />
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Become a Caretaker</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">Earn money by providing care services to families in your community.</p>
                  <Link href="/apply-caretaker" className="bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all inline-block">
                    Apply Now
                  </Link>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                  <Star className="w-32 h-32 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Profile Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-md">
                <span className="text-3xl font-bold text-indigo-600">{user.displayName ? user.displayName[0] : user.email[0]}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{user.displayName || 'User'}</h3>
              <p className="text-gray-500 text-sm mb-6">{user.email}</p>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Reviews</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-bold text-gray-900 mb-4">Account Security</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Email Verified</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">NID Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <RoleProtectedRoute allowedRoles={['user', 'caretaker', 'admin']}>
      <UserDashboardContent />
    </RoleProtectedRoute>
  );
}
