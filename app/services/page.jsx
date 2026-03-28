'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { SERVICES as STATIC_SERVICES } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { ArrowRight, Shield, Clock, Star, Heart, Search } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
      const dbServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Combine static services with DB services
      const combined = [...dbServices];
      STATIC_SERVICES.forEach(s => {
        if (!combined.find(c => c.id === s.id)) {
          combined.push(s);
        }
      });
      setServices(combined);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mb-6"
          >
            <Heart className="w-4 h-4" />
            Our Care Services
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Professional Care for <span className="text-indigo-600">Every Need</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
            We offer a wide range of specialized caregiving services designed to provide comfort, safety, and peace of mind for you and your family.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search services (e.g. Senior Care, Babysitting)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border border-gray-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm text-lg"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group flex flex-col h-full"
              >
                <div className="h-64 relative overflow-hidden">
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl font-bold text-indigo-600 shadow-xl border border-white/20">
                    ${service.pricePerHour}/hr
                  </div>
                </div>
                <div className="p-10 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed flex-grow">
                    {service.description}
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {[
                      { icon: <Shield className="w-4 h-4" />, text: 'Verified Caretakers' },
                      { icon: <Clock className="w-4 h-4" />, text: 'Flexible Hours' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-medium text-gray-500">
                        <div className="text-indigo-500">{item.icon}</div>
                        {item.text}
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/service/${service.id}`}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-500/20"
                  >
                    View Details <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Trust Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-24 bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Need a Custom Care Plan?</h2>
              <p className="text-xl text-indigo-100 mb-10 opacity-90">
                Our team can help you design a personalized care schedule that fits your specific requirements and budget.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl">
                  Contact Support
                </button>
                <div className="flex items-center gap-3 px-6 py-4 bg-indigo-500/30 backdrop-blur-sm rounded-2xl border border-indigo-400/30">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-bold">4.9/5 Average Rating</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Families', value: '5K+' },
                { label: 'Caretakers', value: '1.2K+' },
                { label: 'Cities', value: '12+' },
                { label: 'Support', value: '24/7' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-center">
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-indigo-200 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
