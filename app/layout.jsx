import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/app/globals.css';

export const metadata = {
  title: 'Care.IO - Reliable Care for Your Loved Ones',
  description: 'Find and hire professional caretakers for babysitting, elderly care, and special home care.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
        <ErrorBoundary>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
