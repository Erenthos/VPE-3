"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";

export default function EvaluateVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [ratings, setRatings] = useState<
    Record<string, { score: number; comment: string }>
  >({});
  const [selectedVendor, setSelectedVendor] = useState("");
  const [saving, setSaving] = useState(false);

  const [vendorSearch, setVendorSearch] = useState("");

  // -------------------------
  // Fetch vendors + segments
  // -------------------------
  useEffect(() => {
    async function loadData() {
      const v = await fetch("/api/vendors").then((res) => res.json());
      const s = await fetch("/api/segments").then((res) => res.json());
      setVendors(v);
      setSegments(s);
    }
    loadData();
  }, []);

  // -------------------------
  // Load ratings of vendor
  // -------------------------
  useEffect(() => {
    if (!selectedVendor) {
      setRatings({});
      return;
    }
    async function loadRatings() {
      const r = await fetch(`/api/ratings/${selectedVendor}`).then((res) =>
        res.json()
      );

      const map: Record<
        string,
        { score: number; comment: string }
      > = {};

      r.forEach((item: any) => {
        map[item.questionId] = {
          score: item.score,
          comment: item.comment || ""
        };
      });

      setRatings(map);
    }

    loadRatings();
  }, [selectedVendor]);

  // -------------------------
  // Bulk Save Evaluation
  // -------------------------
  async function saveAllEvaluations() {
    if (!selectedVendor) {
      alert("Please select a vendor first.");
      return;
    }

    try {
      setSaving(true);

      const ratingsArray = Object.keys(ratings).map((qid) => ({
        questionId: qid,
        score: ratings[qid].score ?? 0,
        comment: ratings[qid].comment ?? ""
      }));

      const res = await fetch("/api/ratings/saveAll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          vendorId: selectedVendor,
          ratings: ratingsArray
        })
      });

      const data = await res.json();
      setSaving(false);

      if (!res.ok) {
        alert("Failed to save evaluation");
        console.error(data);
        return;
      }

      alert("Evaluation saved successfully!");
    } catch (err) {
      console.error(err);
      setSaving(false);
      alert("Error saving evaluation");
    }
  }

  // -------------------------
  // Filter vendor search
  // -------------------------
  const filteredVendors = vendors.filter((v) =>
    `${v.name} ${v.company} ${v.email}`
      .toLowerCase()
      .includes(vendorSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen text-white relative">

      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black"></div>
      <div className="absolute w-[800px] h-[800px] bg-purple-700/20 rounded-full blur-[160px] -top-32 -left-32"></div>
      <div className="absolute w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[160px] top-40 -right-40"></div>

      <div className="relative z-10 p-6 max-w-5xl mx-auto">

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-6 text-center"
        >
          Evaluate Vendors
        </motion.h1>

        {/* Vendor Search + Dropdown */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <label className="block mb-2 text-gray-300">Search Vendor</label>
          <input
            type="text"
            placeholder="Search by name, company, email..."
            className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-white mb-4"
            value={vendorSearch}
            onChange={(e) => setVendorSearch(e.target.value)}
          />

          <label className="block mb-2 text-gray-300">Select Vendor</label>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-white"
          >
            <option value="">-- Select Vendor --</option>
            {filteredVendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} {v.company ? `(${v.company})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Segments + Questions */}
        {selectedVendor && (
          <div className="space-y-8">
            {segments.map((seg) => (
              <div
                key={seg.id}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-2xl font-bold mb-4">
                  {seg.name}{" "}
                  <span className="text-purple-300 text-lg">
                    (Weight: {seg.weight})
                  </span>
                </h2>

                {seg.questions.map((q: any) => {
                  const r = ratings[q.id] || { score: 0, comment: "" };
                  return (
                    <div key={q.id} className="mb-6">
                      <p className="mb-2 text-lg">{q.text}</p>

                      {/* Slider */}
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={r.score}
                        onChange={(e) =>
                          setRatings((prev) => ({
                            ...prev,
                            [q.id]: {
                              score: Number(e.target.value),
                              comment: prev[q.id]?.comment ?? ""
                            }
                          }))
                        }
                        className="w-full"
                      />
                      <div className="text-right text-purple-300 mb-2">
                        {r.score}/10
                      </div>

                      {/* Comment */}
                      <textarea
                        placeholder="Add comment..."
                        className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-white"
                        value={r.comment}
                        onChange={(e) =>
                          setRatings((prev) => ({
                            ...prev,
                            [q.id]: {
                              score: prev[q.id]?.score ?? 0,
                              comment: e.target.value
                            }
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        {selectedVendor && (
          <div className="mt-8 text-center">
            <button
              onClick={saveAllEvaluations}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium shadow-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Evaluation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
