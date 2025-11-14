"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Vendor = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
};

export default function DownloadReport() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadVendors() {
      const v = await fetch("/api/vendors").then((r) => r.json());
      setVendors(v);
    }
    loadVendors();
  }, []);

  const filteredVendors = vendors.filter((v) => {
    const term = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(term) ||
      (v.company || "").toLowerCase().includes(term) ||
      (v.email || "").toLowerCase().includes(term)
    );
  });

  async function handleDownload() {
    if (!selectedVendorId) return;

    const res = await fetch("/api/pdf", {
      method: "POST",
      body: JSON.stringify({ vendorId: selectedVendorId })
    });

    if (!res.ok) {
      alert("Failed to generate PDF");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Vendor_Performance_Report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative w-full min-h-screen text-white">

      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-purple-700/20 blur-[160px] -top-20 -left-40"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[160px] top-40 -right-40"></div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">

        <h1 className="text-4xl font-bold mb-10 text-center">
          Download Vendor Report
        </h1>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search vendor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 mb-4 rounded-xl bg-black/40 border border-white/10 text-white"
        />

        {/* VENDOR DROPDOWN */}
        <select
          value={selectedVendorId}
          onChange={(e) => setSelectedVendorId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white mb-6"
        >
          <option value="">— Select vendor —</option>
          {filteredVendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} {v.company ? `(${v.company})` : ""}
            </option>
          ))}
        </select>

        <button
          onClick={handleDownload}
          disabled={!selectedVendorId}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 
                     hover:from-purple-600 hover:to-blue-600 transition text-white font-medium
                     disabled:opacity-40 shadow-lg"
        >
          Download PDF Report
        </button>
      </div>
    </div>
  );
}
