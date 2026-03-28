"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Chrome,
  Eye,
  EyeClosed,
} from "lucide-react";
import { motion } from "motion/react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(from);
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push(from);
    } catch (err) {
      setError(err.message || "Failed to login with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-gray-500">Login to access your care services</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={show ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
            <span
              onClick={() => {
                setShow(!show);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              {show ? <EyeClosed className="w-4" /> : <Eye className="w-4" />}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            "Logging in..."
          ) : (
            <>
              <LogIn className="w-5 h-5" /> Login
            </>
          )}
        </button>
      </form>

      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">
            Or continue with
          </span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
      >
        <Chrome className="w-5 h-5 text-red-500" />
        Google Login
      </button>

      <p className="mt-10 text-center text-gray-600">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-indigo-600 font-bold hover:underline"
        >
          Register Now
        </Link>
      </p>
    </div>
  );
}

export default function Login() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
