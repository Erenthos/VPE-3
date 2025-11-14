"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Vendor = {
  id: string;
  name: string;
  company?: string | null;
};

export default function ReportPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoadingVendors(true);
      try {
        const res = await fetch("/api/vendors");
        if (!res.ok) throw new Error("Failed to load vendors");
        const data = await res.json();
        setVendors(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load vendors");
      } finally {
        setLoadingVendors(false);
      }
    }
    load();
  }, []);

  async function handleDownload() {
    if (!selectedVendor) {
      setError("Please select a vendor");
      return;
    }
    setError(null);
    setDownloading(true);

    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: selectedVendor })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const vendor = vendors.find((v) => v.id === selectedVendor);
      const safeName = (vendor?.name || "vendor").replace(/[^a-z0-9_\-]/gi, "_");
      const filename = `Vendor_Report_${safeName}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download error:", err);
      setError(err?.message || "Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="relative w-full min-h-screen text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-purple-700/20 blur-[160px] -top-20 -left-40" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[160px] top-40 -right-40" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-4"
        >
          Download Vendor Performance PDF
        </motion.h1>
        <p className="text-gray-400 mb-8">Generate a printable report with ratings and comments.</p>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-sm text-gray-300 mb-2">Select Vendor</label>

          <div className="flex gap-3 items-center">
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white"
            >
              <option value="">— Select vendor —</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.company ? `(${v.company})` : ""}
                </option>
              ))}
            </select>

            <button
              onClick={handleDownload}
              disabled={downloading || loadingVendors}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-60"
            >
              {downloading ? "Generating..." : "Download PDF"}
            </button>
          </div>

          {loadingVendors && <p className="text-gray-400 mt-4">Loading vendors...</p>}
          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
}
