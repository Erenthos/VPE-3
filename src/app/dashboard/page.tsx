"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="relative w-full min-h-screen text-white">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-purple-700/20 blur-[160px] -top-20 -left-40" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[160px] top-40 -right-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-bold mb-6"
        >
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""} 👋
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-gray-300 text-lg mb-12 max-w-2xl"
        >
          Manage vendors, evaluate performance, assign weighted scores, and generate
          detailed reports — all inside your Cosmic Evaluation Workspace.
        </motion.p>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >

          {/* Add Vendor */}
          <Link href="/vendors" className="group">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl 
                            p-8 h-full shadow-2xl hover:bg-white/10 transition cursor-pointer">
              <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-300 transition">
                Add & Manage Vendors
              </h3>
              <p className="text-gray-400">
                Create new vendor profiles, edit details, and search through all registered vendors.
              </p>
            </div>
          </Link>

          {/* Evaluate Vendor */}
          <Link href="/vendors" className="group">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl 
                            p-8 h-full shadow-2xl hover:bg-white/10 transition cursor-pointer">
              <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-300 transition">
                Evaluate Vendor Performance
              </h3>
              <p className="text-gray-400">
                Rate vendors across weighted segments and questions using interactive sliders.
              </p>
            </div>
          </Link>

          {/* Reports */}
          <Link href="/vendors" className="group">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl 
                            p-8 h-full shadow-2xl hover:bg-white/10 transition cursor-pointer">
              <h3 className="text-xl font-semibold mb-3 group-hover:text-green-300 transition">
                Generate Evaluation Reports
              </h3>
              <p className="text-gray-400">
                Download performance summaries with comments and weighted scoring in PDF format.
              </p>
            </div>
          </Link>

        </motion.div>
      </div>
    </div>
  );
}

