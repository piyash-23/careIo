'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { SERVICES, LOCATIONS } from '@/lib/constants';
import { motion } from 'motion/react';
import { Clock, MapPin, CreditCard, CheckCircle, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { handleFirestoreError } from '@/lib/utils';
import ProtectedRoute from '@/components/ProtectedRoute';

function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id;
  const [service, setService] = useState(null);
  const [loadingService, setLoadingService] = useState(true);
  const user = auth.currentUser;

  const [duration, setDuration] = useState(1);
  const [location, setLocation] = useState({
    division: '',
    district: '',
    city: '',
    area: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchService() {
      // Check static services first
      const staticService = SERVICES.find(s => s.id === serviceId);
      if (staticService) {
        setService(staticService);
        setLoadingService(false);
        return;
      }

      // Check Firestore
      try {
        const serviceDoc = await getDoc(doc(db, 'services', serviceId));
        if (serviceDoc.exists()) {
          setService({ id: serviceDoc.id, ...serviceDoc.data() });
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        router.push('/');
      } finally {
        setLoadingService(false);
      }
    }
    fetchService();
  }, [serviceId, router]);

  if (loadingService || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!service) return null;

  const totalCost = duration * service.pricePerHour;

  const handleLocationChange = (e) => {
    setLocation({ ...location, [e.target.name]: e.target.value });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');

    if (!location.division || !location.district || !location.city || !location.area || !location.address) {
      setError('Please fill in all location details');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        serviceId: service.id,
        serviceTitle: service.title,
        userId: user.uid,
        userName: user.displayName || 'User',
        userEmail: user.email || '',
        caretakerId: service.caretakerId || null, // Include caretakerId if available
        duration,
        location,
        totalCost,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      // Mock invoice call
      try {
        await fetch('/api/invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            bookingId: docRef.id,
            totalCost,
            serviceTitle: service.title
          })
        });
      } catch (invoiceErr) {
        console.error('Failed to send invoice:', invoiceErr);
      }

      setSuccess(true);
      setTimeout(() => router.push('/my-bookings'), 2000);
    } catch (err) {
      handleFirestoreError(err, 'write', 'bookings');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center border border-green-100"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-8">Your booking for {service.title} has been received. Redirecting to your bookings...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 bg-indigo-50/50">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-indigo-600" /> Booking Details
                </h2>
              </div>

              <form onSubmit={handleBooking} className="p-8 space-y-8">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Duration (Hours)</label>
                  <div className="flex items-center gap-6">
                    <input
                      type="range"
                      min="1"
                      max="24"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="w-16 text-center font-bold text-2xl text-indigo-600">{duration}h</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" /> Service Location
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Division</label>
                      <select
                        name="division"
                        required
                        value={location.division}
                        onChange={handleLocationChange}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="">Select Division</option>
                        {LOCATIONS.divisions.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">District</label>
                      <select
                        name="district"
                        required
                        value={location.district}
                        onChange={handleLocationChange}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="">Select District</option>
                        {location.division && (LOCATIONS.districts[location.division] || []).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                      <select
                        name="city"
                        required
                        value={location.city}
                        onChange={handleLocationChange}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="">Select City</option>
                        {location.district && (LOCATIONS.cities[location.district] || []).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Area</label>
                      <select
                        name="area"
                        required
                        value={location.area}
                        onChange={handleLocationChange}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="">Select Area</option>
                        {location.city && (LOCATIONS.areas[location.city] || []).map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Address</label>
                    <textarea
                      name="address"
                      required
                      value={location.address}
                      onChange={handleLocationChange}
                      rows={3}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="House no, Road no, Landmark..."
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? 'Processing...' : <><CreditCard className="w-6 h-6" /> Confirm Booking</>}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-bold text-gray-900">Order Summary</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <img src={service.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <div className="font-bold text-gray-900">{service.title}</div>
                      <div className="text-sm text-gray-500">${service.pricePerHour}/hr</div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Duration</span>
                      <span>{duration} Hours</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Service Charge</span>
                      <span>${service.pricePerHour} × {duration}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Cost</span>
                    <span className="text-2xl font-bold text-indigo-600">${totalCost}</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-600 rounded-3xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6" />
                  <h4 className="font-bold">Care Guarantee</h4>
                </div>
                <p className="text-sm text-indigo-100 opacity-90 leading-relaxed">
                  Your safety is our priority. All bookings are covered by our care guarantee and 24/7 support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Booking() {
  return (
    <ProtectedRoute>
      <BookingContent />
    </ProtectedRoute>
  );
}
