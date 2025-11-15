"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";

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
    async function load() {
      const v = await fetch("/api/vendors").then((r) => r.json());
      setVendors(v);
    }
    load();
  }, []);

  const filtered = vendors.filter((v) => {
    const t = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(t) ||
      (v.company || "").toLowerCase().includes(t) ||
      (v.email || "").toLowerCase().includes(t)
    );
  });

  async function handleDownload() {
    if (!selectedVendorId) return;

    const res = await fetch("/api/pdf", {
      method: "POST",
      body: JSON.stringify({ vendorId: selectedVendorId })
    });

    if (!res.ok) return alert("Failed to generate PDF");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Vendor_Performance_Report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative min-h-screen text-white">

      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[700px] h-[700px] bg-purple-700/20 blur-[160px] -top-20 -left-40 rounded-full" />
      <div className="absolute w-[600px] h-[600px] bg-blue-600/20 blur-[160px] top-40 -right-40 rounded-full" />

      <div className="relative z-10 max-w-xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-10 text-center">Download Report</h1>

        {/* SEARCH */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendor…"
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white mb-4"
        />

        {/* DROPDOWN */}
        <select
          value={selectedVendorId}
          onChange={(e) => setSelectedVendorId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white mb-6"
        >
          <option value="">— Select Vendor —</option>
          {filtered.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} {v.company ? `(${v.company})` : ""}
            </option>
          ))}
        </select>

        <button
          onClick={handleDownload}
          disabled={!selectedVendorId}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition text-white font-medium shadow-lg disabled:opacity-40"
        >
          Download PDF Report
        </button>
      </div>
    </div>
  );
}
