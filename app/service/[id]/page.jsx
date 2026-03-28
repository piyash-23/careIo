'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { SERVICES as STATIC_SERVICES } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { CheckCircle, Clock, Shield, ArrowLeft, Calendar } from 'lucide-react';

export default function ServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id;
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      // Check static services first
      const staticService = STATIC_SERVICES.find(s => s.id === serviceId);
      if (staticService) {
        setService(staticService);
        setLoading(false);
        return;
      }

      // Check Firestore
      try {
        const serviceDoc = await getDoc(doc(db, 'services', serviceId));
        if (serviceDoc.exists()) {
          setService({ id: serviceDoc.id, ...serviceDoc.data() });
        }
      } catch (err) {
        console.error('Error fetching service:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Service Not Found</h2>
        <Link href="/" className="text-indigo-600 font-bold hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl overflow-hidden shadow-2xl h-[400px] lg:h-[600px]"
          >
            <img
              src={service.imageUrl}
              alt={service.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mb-6 w-fit">
              Premium Care
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">{service.title}</h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {service.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {[
                { icon: <Shield className="w-5 h-5" />, text: 'Verified Caretakers' },
                { icon: <Clock className="w-5 h-5" />, text: '24/7 Availability' },
                { icon: <CheckCircle className="w-5 h-5" />, text: 'Secure Payments' },
                { icon: <Calendar className="w-5 h-5" />, text: 'Flexible Booking' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="text-indigo-600">{item.icon}</div>
                  {item.text}
                </div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-500 font-medium">Service Charge</span>
                <span className="text-3xl font-bold text-gray-900">${service.pricePerHour}/hr</span>
              </div>
              <Link
                href={`/booking/${service.id}`}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-3"
              >
                Book Service Now
              </Link>
            </div>

            <div className="text-gray-500 text-sm text-center">
              No hidden charges. Pay only for the hours you use.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
