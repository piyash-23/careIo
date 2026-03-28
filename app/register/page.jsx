"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
  User,
  Mail,
  Lock,
  Phone,
  CreditCard,
  AlertCircle,
  UserPlus,
  EyeClosed,
  Eye,
} from "lucide-react";
import { motion } from "motion/react";
import { handleFirestoreError } from "@/lib/utils";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nid: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (pass) => {
    return pass.length >= 6 && /[A-Z]/.test(pass) && /[a-z]/.test(pass);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must be 6+ chars, 1 uppercase, 1 lowercase");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name });

      const userProfile = {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        nid: formData.nid,
        contact: formData.contact,
        role: "user",
      };

      try {
        await setDoc(doc(db, "users", user.uid), userProfile);
      } catch (err) {
        handleFirestoreError(err, "write", `users/${user.uid}`);
      }

      router.push("/");
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 p-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Create Account
            </h2>
            <p className="text-gray-500">
              Join Care.IO to find reliable care services
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form
            onSubmit={handleRegister}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                NID Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="nid"
                  required
                  value={formData.nid}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="contact"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="+880 1XXX XXXXXX"
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
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShow(!show)}
                >
                  {show ? (
                    <EyeClosed className="w-4" />
                  ) : (
                    <Eye className="w-4" />
                  )}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showCon ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowCon(!showCon)}
                >
                  {showCon ? (
                    <EyeClosed className="w-4" />
                  ) : (
                    <Eye className="w-4" />
                  )}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Creating Account..."
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" /> Register
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 font-bold hover:underline"
            >
              Login Now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
