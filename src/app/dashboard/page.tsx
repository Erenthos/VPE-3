"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardHome() {
  return (
    <div className="relative w-full min-h-screen text-white">

      {/* Background cosmic effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[900px] h-[900px] rounded-full bg-purple-700/20 blur-[180px] -top-40 -left-40" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-blue-600/20 blur-[180px] top-40 -right-40" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-bold mb-10 text-center"
        >
          Dashboard
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl"
          >
            <h2 className="text-2xl font-semibold mb-4">Manage Segments</h2>
            <p className="text-gray-300 text-sm mb-6">
              Create, edit and organize scoring segments and questions.
            </p>
            <Link
              href="/dashboard/segments"
              className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition block text-center"
            >
              Go
            </Link>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl"
          >
            <h2 className="text-2xl font-semibold mb-4">Vendors</h2>
            <p className="text-gray-300 text-sm mb-6">
              Add vendors and maintain vendor master list.
            </p>
            <Link
              href="/dashboard/vendors"
              className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition block text-center"
            >
              Go
            </Link>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl"
          >
            <h2 className="text-2xl font-semibold mb-4">Evaluate Vendors</h2>
            <p className="text-gray-300 text-sm mb-6">
              Rate vendors across weighted criteria using sliders.
            </p>
            <Link
              href="/dashboard/evaluate"
              className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition block text-center"
            >
              Go
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
