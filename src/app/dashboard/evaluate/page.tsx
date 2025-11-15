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

type Question = {
  id: string;
  text: string;
};

type Segment = {
  id: string;
  name: string;
  weight: number;
  questions: Question[];
};

type Rating = {
  questionId: string;
  score: number;
  comment: string;
};

export default function EvaluateVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");

  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // Load vendors + segments
  useEffect(() => {
    async function load() {
      const v = await fetch("/api/vendors").then((r) => r.json());
      const s = await fetch("/api/segments").then((r) => r.json());
      setVendors(v);
      setSegments(s);
      setLoading(false);
    }
    load();
  }, []);

  // Search filter
  const filteredVendors = vendors.filter((v) => {
    const t = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(t) ||
      (v.company || "").toLowerCase().includes(t) ||
      (v.email || "").toLowerCase().includes(t)
    );
  });

  // Load ratings for vendor
  async function loadRatingsForVendor(vendorId: string) {
    setSelectedVendorId(vendorId);

    const res = await fetch(`/api/ratings/${vendorId}`);
    const data = await res.json();

    const formatted: Record<string, Rating> = {};
    data.forEach((r: any) => {
      formatted[r.questionId] = {
        questionId: r.questionId,
        score: r.score,
        comment: r.comment || ""
      };
    });

    setRatings(formatted);
  }

  // Save single rating on change
  async function saveRating(questionId: string, score: number, comment: string) {
    if (!selectedVendorId) return;

    await fetch(`/api/ratings/${selectedVendorId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, score, comment })
    });
  }

  // Save all
  const [saving, setSaving] = useState(false);
  async function saveAll() {
    if (!selectedVendorId) return;
    setSaving(true);

    try {
      for (const qid in ratings) {
        const r = ratings[qid];

        await fetch(`/api/ratings/${selectedVendorId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: r.questionId,
            score: r.score,
            comment: r.comment
          })
        });
      }
      alert("Evaluation Saved!");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-white p-10">Loading…</div>;

  return (
    <div className="relative w-full min-h-screen text-white">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[700px] h-[700px] bg-purple-700/20 blur-[160px] -top-20 -left-40 rounded-full"></div>
      <div className="absolute w-[600px] h-[600px] bg-blue-600/20 blur-[160px] top-40 -right-40 rounded-full"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-10">Evaluate Vendors</h1>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search vendor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white mb-4"
        />

        {/* Vendor Dropdown */}
        <select
          onChange={(e) => loadRatingsForVendor(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white mb-10"
        >
          <option value="">— Select Vendor —</option>
          {filteredVendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} {v.company ? `(${v.company})` : ""}
            </option>
          ))}
        </select>

        {/* Save Button */}
        {selectedVendorId && (
          <div className="mb-10 flex justify-end">
            <button
              onClick={saveAll}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg disabled:opacity-50 transition"
            >
              {saving ? "Saving…" : "Save Evaluation"}
            </button>
          </div>
        )}

        {/* Segments */}
        {selectedVendorId &&
          segments.map((seg) => (
            <motion.div
              key={seg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl mb-8"
            >
              <h2 className="text-2xl font-semibold mb-4">
                {seg.name} <span className="text-gray-300">(Weight {seg.weight})</span>
              </h2>

              {seg.questions.map((q) => {
                const current =
                  ratings[q.id] || {
                    questionId: q.id,
                    score: 0,
                    comment: ""
                  };

                return (
                  <div key={q.id} className="mb-6">
                    <p className="text-lg mb-2">{q.text}</p>

                    {/* Slider */}
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={current.score}
                      onChange={(e) => {
                        const score = Number(e.target.value);

                        const newRating: Rating = {
                          questionId: q.id,
                          score,
                          comment: current.comment
                        };

                        setRatings((prev) => ({
                          ...prev,
                          [q.id]: newRating
                        }));

                        saveRating(q.id, score, current.comment);
                      }}
                      className="w-full"
                    />

                    <p className="text-gray-300 mt-1">Score: {current.score} / 10</p>

                    {/* Comment */}
                    <textarea
                      placeholder="Comment (optional)"
                      value={current.comment}
                      onChange={(e) => {
                        const comment = e.target.value;

                        const updated: Rating = {
                          questionId: q.id,
                          score: current.score,
                          comment
                        };

                        setRatings((prev) => ({
                          ...prev,
                          [q.id]: updated
                        }));

                        saveRating(q.id, current.score, comment);
                      }}
                      className="w-full px-3 py-2 mt-2 rounded-xl bg-black/40 border border-white/10 text-white"
                    />
                  </div>
                );
              })}
            </motion.div>
          ))}
      </div>
    </div>
  );
}
