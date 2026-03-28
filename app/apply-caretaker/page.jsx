'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Shield, Briefcase, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { handleFirestoreError } from '@/lib/utils';

function ApplyCaretakerContent() {
  const router = useRouter();
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingApp, setExistingApp] = useState(null);
  const [checking, setChecking] = useState(true);

  const [formData, setFormData] = useState({
    experience: '',
    nid: '',
    contact: ''
  });

  useEffect(() => {
    async function checkApplication() {
      if (!user) return;
      try {
        const appDoc = await getDoc(doc(db, 'caretaker_applications', user.uid));
        if (appDoc.exists()) {
          setExistingApp(appDoc.data());
        }
        
        // Also pre-fill NID and contact from profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData(prev => ({
            ...prev,
            nid: userData.nid || '',
            contact: userData.contact || ''
          }));
        }
      } catch (err) {
        console.error('Error checking application:', err);
      } finally {
        setChecking(false);
      }
    }
    checkApplication();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const applicationData = {
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        nid: formData.nid,
        contact: formData.contact,
        experience: formData.experience,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'caretaker_applications', user.uid), applicationData);
      setSuccess(true);
    } catch (err) {
      handleFirestoreError(err, 'write', `caretaker_applications/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (success || (existingApp && existingApp.status === 'pending')) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center border border-indigo-100"
        >
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Pending</h2>
          <p className="text-gray-600 mb-8">
            Your application to become a caretaker has been received and is currently under review by our administrators.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                <Briefcase className="text-white w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Become a Caretaker</h2>
              <p className="text-gray-500">Share your caregiving skills with families in need</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Experience & Skills</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    required
                    rows={5}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Tell us about your previous experience in caregiving, certifications, and why you want to join..."
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm NID</label>
                  <input
                    type="text"
                    required
                    value={formData.nid}
                    onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Contact</label>
                  <input
                    type="tel"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ApplyCaretaker() {
  return (
    <ProtectedRoute>
      <ApplyCaretakerContent />
    </ProtectedRoute>
  );
}
