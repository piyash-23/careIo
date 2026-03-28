'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { SERVICES as STATIC_SERVICES } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { Heart, Shield, Clock, MapPin, ArrowRight, Star, Users, CheckCircle } from 'lucide-react';

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'services'), limit(3)), (snapshot) => {
      const dbServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Combine static services with DB services, limit to 3 for home
      const combined = [...dbServices];
      STATIC_SERVICES.forEach(s => {
        if (!combined.find(c => c.id === s.id)) {
          combined.push(s);
        }
      });
      setServices(combined.slice(0, 3));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden bg-indigo-900">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://picsum.photos/seed/carehero/1920/1080"
            alt="Caregiver with elderly"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-900/80 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl text-white"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-full text-indigo-200 text-sm font-semibold mb-6">
              <Heart className="w-4 h-4" />
              Trusted by 5000+ Families
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Reliable Care for Your <span className="text-indigo-400">Loved Ones</span>
            </h1>
            <p className="text-xl text-indigo-100 mb-10 leading-relaxed opacity-90">
              Find and hire professional caretakers for babysitting, elderly care, and special home care. We make caregiving easy, secure, and accessible.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/services"
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-500/20 flex items-center gap-2"
              >
                Explore Services <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/register"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                Join as Caretaker
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Families Served', value: '5,000+' },
              { label: 'Certified Caretakers', value: '1,200+' },
              { label: 'Success Rate', value: '99.9%' },
              { label: 'Support 24/7', value: 'Always' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Our Specialized Services</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We provide professional care tailored to your family's unique needs. Choose from our range of specialized services.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
                >
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl font-bold text-indigo-600 shadow-sm">
                      ${service.pricePerHour}/hr
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                    <Link
                      href={`/service/${service.id}`}
                      className="w-full bg-indigo-50 text-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all"
                    >
                      View Details <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">Why Choose Care.IO?</h2>
              <div className="space-y-8">
                {[
                  {
                    icon: <Shield className="w-6 h-6 text-indigo-600" />,
                    title: 'Verified Caretakers',
                    desc: 'Every caretaker on our platform goes through a rigorous background check and NID verification.'
                  },
                  {
                    icon: <Clock className="w-6 h-6 text-indigo-600" />,
                    title: 'Flexible Scheduling',
                    desc: 'Book care for a few hours, a day, or weeks. We adapt to your schedule and needs.'
                  },
                  {
                    icon: <Star className="w-6 h-6 text-indigo-600" />,
                    title: 'Quality Assurance',
                    desc: 'We monitor service quality through continuous feedback and performance reviews.'
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://picsum.photos/seed/caretrust/1000/1000"
                  alt="Happy family"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-indigo-600 text-white p-8 rounded-3xl shadow-xl max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 fill-current text-yellow-400" />
                  <Star className="w-5 h-5 fill-current text-yellow-400" />
                  <Star className="w-5 h-5 fill-current text-yellow-400" />
                  <Star className="w-5 h-5 fill-current text-yellow-400" />
                  <Star className="w-5 h-5 fill-current text-yellow-400" />
                </div>
                <p className="font-medium italic mb-4">"The caretaker we found for my mother was exceptional. Truly a life-saver!"</p>
                <div className="font-bold">- Sarah J., Dhaka</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">What Families Are Saying</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Ahmed Khan', role: 'Parent', text: 'Care.IO made finding a babysitter so easy. The NID verification gives me peace of mind.' },
              { name: 'Maria Begum', role: 'Daughter', text: 'My father needed post-surgery care. The caretaker was professional and very kind.' },
              { name: 'John Doe', role: 'Family Member', text: 'Excellent service! The booking process is seamless and the support team is helpful.' }
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
