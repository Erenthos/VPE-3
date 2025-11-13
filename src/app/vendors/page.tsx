"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Vendor = {
  id: string;
  name: string;
  company?: string;
  email?: string;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Fetch vendors
  async function loadVendors() {
    const res = await fetch("/api/vendors");
    const data = await res.json();
    setVendors(data);
  }

  useEffect(() => {
    loadVendors();
  }, []);

  // Add vendor
  async function handleAddVendor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const company = form.get("company") as string;
    const email = form.get("email") as string;

    const res = await fetch("/api/vendors", {
      method: "POST",
      body: JSON.stringify({ name, company, email })
    });

    if (res.ok) {
      setIsAdding(false);
      loadVendors();
    }
  }

  // Filter vendors
  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.company?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full min-h-screen text-white">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-purple-700/20 blur-[160px] -top-20 -left-40" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[160px] top-40 -right-40" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">

        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8"
        >
          Vendors
        </motion.h1>

        {/* Top Row: Search + Add Vendor */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/20 
                       text-white focus:outline-none focus:border-purple-400 transition"
          />

          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition 
                       shadow-lg font-semibold"
          >
            + Add Vendor
          </button>
        </div>

        {/* Vendor List */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((vendor) => (
            <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 
                              rounded-2xl p-6 shadow-2xl hover:bg-white/10 transition">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-300 transition">
                  {vendor.name}
                </h3>
                <p className="text-gray-400 text-sm">{vendor.company}</p>
                <p className="text-gray-400 text-sm">{vendor.email}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Add Vendor Modal */}
        {isAdding && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white/10 border border-white/20 rounded-3xl px-8 py-10 w-[90%] max-w-md">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Add New Vendor
              </h2>

              <form className="space-y-5" onSubmit={handleAddVendor}>
                <input
                  name="name"
                  placeholder="Vendor Name"
                  required
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 text-white rounded-xl"
                />

                <input
                  name="company"
                  placeholder="Company Name"
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 text-white rounded-xl"
                />

                <input
                  name="email"
                  placeholder="Email (optional)"
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 text-white rounded-xl"
                />

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 rounded-xl border border-white/20 hover:bg-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition shadow-lg"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

