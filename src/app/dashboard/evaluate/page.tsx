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

  /* -----------------------------------
      INITIAL LOAD
  -------------------------------------*/
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

  /* -----------------------------------
      FILTER VENDORS BY SEARCH
  -------------------------------------*/
  const filteredVendors = vendors.filter((v) => {
    const term = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(term) ||
      (v.company || "").toLowerCase().includes(term) ||
      (v.email || "").toLowerCase().includes(term)
    );
  });

  /* -----------------------------------
      LOAD RATINGS FOR SELECTED VENDOR
  -------------------------------------*/
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

  /* -----------------------------------
      SAVE SINGLE RATING (AUTO-SAVE)
  -------------------------------------*/
  async function saveRating(questionId: string, score: number, comment: string) {
    if (!selectedVendorId) return;

    await fetch(`/api/ratings/${selectedVendorId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, score, comment })
    });
  }

  /* -----------------------------------
      SAVE ALL RATINGS (MANUAL BUTTON)
  -------------------------------------*/
  const [saving, setSaving] = useState(false);

  async function saveAll() {
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

      alert("Evaluation saved successfully!");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-white p-10">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen text-white">
      
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-purple-700/20 blur-[160px] -top-20 -left-40"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[160px] top-40 -right-40"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">

        <h1 className="text-4xl font-bold mb-10">Evaluate Vendors</h1>

        {/* SEARCH BOX */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendor…"
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white mb-4"
        />

        {/* VENDOR DROPDOWN */}
        <div className="mb-10">
          <select
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white"
            onChange={(e) => loadRatingsForVendor(e.target.value)}
          >
            <option value="">— Select vendor —</option>
            {filteredVendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} {v.company ? `(${v.company})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* If no vendor selected */}
        {!selectedVendorId && (
          <p className="text-gray-400">Select a vendor to begin evaluation.</p>
        )}

        {/* SAVE BUTTON */}
        {selectedVendorId && (
          <div className="mb-10 flex justify-end">
            <button
              onClick={saveAll}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 
              hover:from-purple-600 hover:to-blue-600 shadow-lg transition text-white font-medium
              disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Evaluation"}
            </button>
          </div>
        )}

        {/* SEGMENTS + QUESTIONS */}
        {selectedVendorId && (
          <div className="space-y-8">
            {segments.map((segment) => (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl"
              >
                <h2 className="text-2xl font-semibold mb-4">
                  {segment.name}
                  <span className="text-sm text-gray-300 ml-2">
                    (Weight {segment.weight})
                  </span>
                </h2>

                <div className="space-y-8">

                  {segment.questions.map((q) => {
                    const current: Rating =
                      ratings[q.id] || {
                        questionId: q.id,
                        score: 0,
                        comment: ""
                      };

                    return (
                      <div key={q.id} className="space-y-3">
                        <p className="text-lg">{q.text}</p>

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

                        <p className="text-gray-300">
                          Score: {current.score} / 10
                        </p>

                        {/* Comment */}
                        <textarea
                          placeholder="Enter comment (optional)"
                          value={current.comment}
                          onChange={(e) => {
                            const comment = e.target.value;

                            const newRating: Rating = {
                              questionId: q.id,
                              score: current.score,
                              comment
                            };

                            setRatings((prev) => ({
                              ...prev,
                              [q.id]: newRating
                            }));

                            saveRating(q.id, current.score, comment);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                        />
                      </div>
                    );
                  })}

                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
