'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Clock, MapPin, Calendar, CheckCircle, XCircle, AlertCircle, LayoutDashboard, ChevronRight, Heart, Star, Plus, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import { handleFirestoreError } from '@/lib/utils';

function CaretakerDashboardContent() {
  const [myServices, setMyServices] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    pricePerHour: '',
    imageUrl: 'https://picsum.photos/seed/care/800/600'
  });
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // Fetch services posted by this caretaker
    const servicesQ = query(
      collection(db, 'services'),
      where('caretakerId', '==', user.uid)
    );

    const unsubscribeServices = onSnapshot(servicesQ, (snapshot) => {
      setMyServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch bookings received by this caretaker
    const bookingsQ = query(
      collection(db, 'bookings'),
      where('caretakerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeBookings = onSnapshot(bookingsQ, (snapshot) => {
      setReceivedBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, 'list', 'bookings');
    });

    return () => {
      unsubscribeServices();
      unsubscribeBookings();
    };
  }, [user]);

  const handlePostService = async (e) => {
    e.preventDefault();
    try {
      const serviceData = {
        ...newService,
        pricePerHour: parseFloat(newService.pricePerHour),
        caretakerId: user.uid,
        id: Math.random().toString(36).substr(2, 9) // Simple ID generation
      };
      await addDoc(collection(db, 'services'), serviceData);
      setShowPostForm(false);
      setNewService({ title: '', description: '', pricePerHour: '', imageUrl: 'https://picsum.photos/seed/care/800/600' });
    } catch (err) {
      handleFirestoreError(err, 'write', 'services');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, 'update', `bookings/${bookingId}`);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await deleteDoc(doc(db, 'services', serviceId));
    } catch (err) {
      handleFirestoreError(err, 'delete', `services/${serviceId}`);
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
              <Star className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Caretaker Dashboard</h1>
              <p className="text-gray-500">Manage your services and bookings</p>
            </div>
          </div>
          <button
            onClick={() => setShowPostForm(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" /> Post New Service
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Received Bookings */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Bookings Received</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {receivedBookings.length === 0 ? (
                  <div className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">No bookings received yet. Post more services to get noticed!</p>
                  </div>
                ) : (
                  receivedBookings.map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Heart className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{booking.serviceTitle}</div>
                            <div className="text-sm text-gray-500">Client: {booking.userName} ({booking.userEmail})</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(booking.status)} uppercase tracking-wider`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 mb-6">
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.duration}h</div>
                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {booking.location.area}</div>
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {booking.createdAt ? format(booking.createdAt.toDate(), 'MMM dd') : ''}</div>
                        <div className="font-bold text-indigo-600">${booking.totalCost}</div>
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                            className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-green-700 transition-all"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                          className="w-full bg-indigo-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* My Services List */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">My Posted Services</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {myServices.length === 0 ? (
                  <div className="col-span-2 py-12 text-center">
                    <p className="text-gray-500">You haven't posted any services yet.</p>
                  </div>
                ) : (
                  myServices.map((service) => (
                    <div key={service.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group relative">
                      <img src={service.imageUrl} className="w-full h-32 object-cover rounded-xl mb-4" alt="" />
                      <h4 className="font-bold text-gray-900 mb-1">{service.title}</h4>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600">${service.pricePerHour}/hr</span>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Stats & Profile */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-md">
                <span className="text-3xl font-bold text-indigo-600">{user.displayName ? user.displayName[0] : user.email[0]}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{user.displayName || 'Caretaker'}</h3>
              <p className="text-gray-500 text-sm mb-6">{user.email}</p>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{receivedBookings.length}</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">${receivedBookings.filter(b => b.status === 'completed').reduce((acc, b) => acc + b.totalCost, 0)}</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Earnings</div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-3xl p-8 text-white">
              <h4 className="font-bold mb-4">Caretaker Tips</h4>
              <ul className="text-sm space-y-3 opacity-90">
                <li>• Keep your profile updated</li>
                <li>• Respond quickly to bookings</li>
                <li>• Provide high-quality care</li>
                <li>• Ask clients for reviews</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Post Service Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Post New Service</h3>
              <button onClick={() => setShowPostForm(false)} className="text-gray-400 hover:text-gray-600"><XCircle /></button>
            </div>
            <form onSubmit={handlePostService} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Title</label>
                <input
                  type="text"
                  required
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Senior Care, Babysitting"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe your service..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Per Hour ($)</label>
                <input
                  type="number"
                  required
                  value={newService.pricePerHour}
                  onChange={(e) => setNewService({ ...newService, pricePerHour: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="25"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg"
              >
                Post Service
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'completed': return 'bg-green-100 text-green-700 border-green-200';
    case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function CaretakerDashboard() {
  return (
    <RoleProtectedRoute allowedRoles={['caretaker', 'admin']}>
      <CaretakerDashboardContent />
    </RoleProtectedRoute>
  );
}
