"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Vendor = {
  id: string;
  name: string;
  company?: string;
  email?: string;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
    setLoading(true);
    const res = await fetch("/api/vendors");
    const data = await res.json();
    setVendors(data);
    setLoading(false);
  }

  async function handleAddVendor(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, company, email })
    });

    if (!res.ok) {
      alert("Failed to add vendor");
      return;
    }

    setName("");
    setCompany("");
    setEmail("");
    setShowAdd(false);
    loadVendors();
  }

  async function deleteVendor(id: string) {
    if (!confirm("Delete this vendor?")) return;

    const res = await fetch("/api/vendors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId: id })
    });

    if (!res.ok) {
      alert("Failed to delete vendor");
      return;
    }

    loadVendors();
  }

  const filtered = vendors.filter((v) =>
    `${v.name} ${v.company} ${v.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full min-h-screen text-white">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-purple-700/20 blur-[160px] -top-20 -left-40" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[160px] top-40 -right-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Vendor Management</h1>
            <p className="text-gray-400">Add, search, and manage vendors.</p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition shadow-xl"
          >
            + Add Vendor
          </button>
        </div>

        {/* Search */}
        <input
          placeholder="Search by name, company, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-8 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white"
        />

        {loading && <p className="text-gray-400">Loading vendors...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-2xl font-semibold">{v.name}</h2>
              <p className="text-gray-300">Company: {v.company || "—"}</p>
              <p className="text-gray-300">Email: {v.email || "—"}</p>

              <button
                onClick={() => deleteVendor(v.id)}
                className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition"
              >
                Delete
              </button>
            </motion.div>
          ))}
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl w-[90%] max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add Vendor</h2>

              <form onSubmit={handleAddVendor} className="space-y-4">
                <input
                  placeholder="Vendor Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white"
                />
                <input
                  placeholder="Company Name (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white"
                />
                <input
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 py-2 rounded bg-white/10 hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded bg-purple-600 hover:bg-purple-700"
                  >
                    Add Vendor
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
