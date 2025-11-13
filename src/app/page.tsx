"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center text-white">

      {/* --- Background Nebula Effects --- */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />

      <div className="absolute w-[900px] h-[900px] rounded-full bg-purple-700/20 blur-[180px] -top-40 -left-40" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-blue-600/20 blur-[180px] top-40 -right-40" />

      {/* --- Floating Cosmic Particles --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            animate={{
              y: "-10vh",
              x: `+=${Math.random() * 40 - 20}`
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* --- Main Content --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-3xl mx-auto text-center px-6"
      >
        {/* Glass card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 shadow-2xl">

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl font-bold tracking-wide mb-6"
          >
            Vendor Performance Evaluator
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {" "}3.0
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-gray-300 leading-relaxed mb-10"
          >
            Evaluate vendors with precision using advanced metrics, weighted scoring,
            persistent ratings, collaborative comments, and a beautifully engineered
            Cosmic UI experience.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/auth/signin"
              className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium backdrop-blur-lg transition-all duration-300"
            >
              Sign In
            </Link>

            <Link
              href="/auth/signup"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium shadow-lg transition-all duration-300"
            >
              Create Account
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

