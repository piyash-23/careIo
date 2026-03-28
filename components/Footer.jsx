import React from 'react';
import Link from 'next/link';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Heart className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Care.IO</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Providing reliable and trusted care services for your loved ones. Making caregiving easy, secure, and accessible for everyone.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
              <li><Link href="/services" className="hover:text-indigo-400 transition-colors">Our Services</Link></li>
              <li><Link href="/" className="hover:text-indigo-400 transition-colors">How it Works</Link></li>
              <li><Link href="/" className="hover:text-indigo-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <span>123 Care Street, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-500" />
                <span>+880 1234 567890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-500" />
                <span>support@care.io</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Care.IO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
