'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, getDoc, orderBy } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Shield, Users, Briefcase, DollarSign, CheckCircle, XCircle, Trash2, AlertCircle, LayoutDashboard, ChevronRight, Star, Heart, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import { handleFirestoreError } from '@/lib/utils';

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubApps = onSnapshot(collection(db, 'caretaker_applications'), (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubBookings = onSnapshot(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')), (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubApps();
      unsubBookings();
      unsubServices();
      unsubUsers();
    };
  }, []);

  const handleApproveCaretaker = async (app) => {
    try {
      // 1. Update user role to caretaker
      await updateDoc(doc(db, 'users', app.uid), { role: 'caretaker' });
      // 2. Update application status
      await updateDoc(doc(db, 'caretaker_applications', app.id), { status: 'approved' });
    } catch (err) {
      handleFirestoreError(err, 'update', `users/${app.uid}`);
    }
  };

  const handleRejectCaretaker = async (appId) => {
    try {
      await updateDoc(doc(db, 'caretaker_applications', appId), { status: 'rejected' });
    } catch (err) {
      handleFirestoreError(err, 'update', `caretaker_applications/${appId}`);
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

  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((acc, b) => acc + b.totalCost, 0);

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
            <Shield className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Control Panel</h1>
            <p className="text-gray-500">System-wide management and oversight</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Revenue', value: `$${totalRevenue}`, icon: <DollarSign className="w-6 h-6 text-green-600" />, bg: 'bg-green-50' },
            { label: 'Total Bookings', value: bookings.length, icon: <LayoutDashboard className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50' },
            { label: 'Caretakers', value: users.filter(u => u.role === 'caretaker').length, icon: <Briefcase className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50' },
            { label: 'Active Users', value: users.length, icon: <Users className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'applications', label: 'Caretaker Requests', count: applications.filter(a => a.status === 'pending').length },
            { id: 'bookings', label: 'All Bookings', count: bookings.length },
            { id: 'services', label: 'Services', count: services.length },
            { id: 'users', label: 'Users', count: users.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-600 border border-gray-100'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {activeTab === 'applications' && (
            <div className="divide-y divide-gray-50">
              {applications.length === 0 ? (
                <div className="p-20 text-center text-gray-400">No applications found</div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="p-8 flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">{app.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          app.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                          app.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-sm text-gray-500">
                        <div><span className="font-bold text-gray-400 uppercase text-[10px] block">Email</span> {app.email}</div>
                        <div><span className="font-bold text-gray-400 uppercase text-[10px] block">NID</span> {app.nid}</div>
                        <div><span className="font-bold text-gray-400 uppercase text-[10px] block">Contact</span> {app.contact}</div>
                        <div><span className="font-bold text-gray-400 uppercase text-[10px] block">Applied On</span> {app.createdAt ? format(app.createdAt.toDate(), 'MMM dd, yyyy') : ''}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 italic">
                        "{app.experience}"
                      </div>
                    </div>
                    {app.status === 'pending' && (
                      <div className="flex md:flex-col gap-3 justify-center">
                        <button
                          onClick={() => handleApproveCaretaker(app)}
                          className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectCaretaker(app.id)}
                          className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Service</th>
                    <th className="px-8 py-4">Client</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Total</th>
                    <th className="px-8 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-bold text-gray-900">{booking.serviceTitle}</td>
                      <td className="px-8 py-6 text-sm text-gray-600">{booking.userName}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          booking.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                          booking.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-bold text-indigo-600">${booking.totalCost}</td>
                      <td className="px-8 py-6 text-sm text-gray-400">
                        {booking.createdAt ? format(booking.createdAt.toDate(), 'MMM dd, yyyy') : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-gray-50 rounded-3xl p-6 border border-gray-100 group relative">
                  <img src={service.imageUrl} className="w-full h-40 object-cover rounded-2xl mb-4 shadow-sm" alt="" />
                  <h4 className="font-bold text-gray-900 mb-1">{service.title}</h4>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600">${service.pricePerHour}/hr</span>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Name</th>
                    <th className="px-8 py-4">Email</th>
                    <th className="px-8 py-4">Role</th>
                    <th className="px-8 py-4">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-bold text-gray-900">{u.name}</td>
                      <td className="px-8 py-6 text-sm text-gray-600">{u.email}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                          u.role === 'caretaker' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gray-50 text-gray-600 border-gray-100'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500">{u.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RoleProtectedRoute allowedRoles={['admin']}>
      <AdminDashboardContent />
    </RoleProtectedRoute>
  );
}
