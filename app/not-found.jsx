'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-6xl font-black text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-10 text-lg leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-500/20"
        >
          <Home className="w-6 h-6" /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
