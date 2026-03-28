'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { handleFirestoreError } from '@/lib/utils';
import { motion } from 'motion/react';
import { Clock, MapPin, Calendar, CheckCircle, XCircle, AlertCircle, LayoutDashboard, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';

function MyBookingsContent() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
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

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' });
    } catch (err) {
      handleFirestoreError(err, 'update', `bookings/${bookingId}`);
    }
  };

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
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
            <p className="text-gray-500">Track and manage your care service requests</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't made any care service bookings. Explore our services to get started.</p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20"
            >
              Explore Services <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-bold text-gray-900">{booking.serviceTitle}</h3>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(booking.status)} uppercase tracking-wider`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Duration</div>
                          <div className="font-semibold">{booking.duration} Hours</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</div>
                          <div className="font-semibold truncate max-w-[200px]">{booking.location.area}, {booking.location.city}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Booked On</div>
                          <div className="font-semibold">
                            {booking.createdAt ? format(booking.createdAt.toDate(), 'MMM dd, yyyy') : 'Pending...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-4 pt-6 md:pt-0 md:pl-8 md:border-l border-gray-100">
                    <div className="text-center md:text-right">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Cost</div>
                      <div className="text-3xl font-bold text-indigo-600">${booking.totalCost}</div>
                    </div>
                    
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-100"
                      >
                        <XCircle className="w-5 h-5" /> Cancel Booking
                      </button>
                    )}
                    
                    {booking.status === 'completed' && (
                      <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-6 py-3 rounded-xl border border-green-100">
                        <CheckCircle className="w-5 h-5" /> Service Completed
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyBookings() {
  return (
    <ProtectedRoute>
      <MyBookingsContent />
    </ProtectedRoute>
  );
}
