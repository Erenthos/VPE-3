"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

type Vendor = {
  id: string;
  name: string;
  company?: string;
  email?: string;
};

type Segment = {
  id: string;
  name: string;
  questions: {
    id: string;
    text: string;
  }[];
};

type RatingRecord = {
  questionId: string;
  score: number;
  comment: string;
};

export default function VendorRatingPage() {
  const { id: vendorId } = useParams() as { id: string };

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [ratings, setRatings] = useState<Record<string, RatingRecord>>({});
  const [loading, setLoading] = useState(true);

  // ⭐ PDF Download Function
  async function downloadPDF() {
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        body: JSON.stringify({ vendorId }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        alert("Failed to generate PDF");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Vendor_Report_${vendor?.name || "Report"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Failed to download PDF");
    }
  }

  // Load vendor details
  async function loadVendor() {
    const res = await fetch(`/api/vendors/${vendorId}`);
    const data = await res.json();
    setVendor(data);
  }

  // Load segments & questions
  async function loadSegments() {
    const res = await fetch(`/api/segments`);
    const data = await res.json();
    setSegments(data);
  }

  // Load existing ratings for this vendor
  async function loadRatings() {
    const res = await fetch(`/api/ratings/${vendorId}`);
    const data = await res.json();

    const mapped: Record<string, RatingRecord> = {};
    data.forEach((r: any) => {
      mapped[r.questionId] = {
        questionId: r.questionId,
        score: r.score,
        comment: r.comment || ""
      };
    });

    setRatings(mapped);
  }

  // Save a rating (auto-save)
  async function saveRating(questionId: string, score: number, comment?: string) {
    setRatings((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        score,
        comment: comment ?? prev[questionId]?.comment ?? ""
      }
    }));

    await fetch(`/api/ratings/${vendorId}`, {
      method: "POST",
      body: JSON.stringify({ questionId, score, comment })
    });
  }

  useEffect(() => {
    async function init() {
      await loadVendor();
      await loadSegments();
      await loadRatings();
      setLoading(false);
    }
    init();
  }, []);

  if (loading)
    return (
      <div className="text-white text-center mt-40 text-xl">Loading vendor data...</div>
    );

  if (!vendor) return <div className="text-white">Vendor not found.</div>;

  return (
    <div className="relative w-full min-h-screen text-white">

      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[700px] h-[700px] bg-purple-700/20 rounded-full blur-[160px] -top-20 -left-40" />
      <div className="absolute w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[160px] top-40 -right-40" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">

        {/* PDF Button */}
        <motion.button
          onClick={downloadPDF}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 
                     hover:from-purple-600 hover:to-blue-600 text-white font-semibold 
                     shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
        >
          📄 Download PDF Report
        </motion.button>

        {/* Vendor Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold mb-2">{vendor.name}</h1>
          <p className="text-gray-300">{vendor.company}</p>
          <p className="text-gray-300">{vendor.email}</p>
        </motion.div>

        {/* Segments */}
        {segments.map((segment, idx) => (
          <motion.div
            key={segment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-semibold mb-4">{segment.name}</h2>

            <div className="space-y-6">
              {segment.questions.map((q) => {
                const rating = ratings[q.id] || { score: 0, comment: "" };

                return (
                  <div
                    key={q.id}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl"
                  >
                    {/* Question */}
                    <p className="font-medium text-lg mb-4">{q.text}</p>

                    {/* Slider */}
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={rating.score}
                      onChange={(e) =>
                        saveRating(q.id, parseInt(e.target.value), rating.comment)
                      }
                      className="w-full accent-purple-500 cursor-pointer"
                    />

                    <div className="text-right text-purple-300 font-semibold mt-1">
                      {rating.score}/10
                    </div>

                    {/* Comment */}
                    <textarea
                      value={rating.comment}
                      placeholder="Add comment..."
                      onChange={(e) =>
                        saveRating(q.id, rating.score, e.target.value)
                      }
                      className="mt-4 w-full px-4 py-3 bg-black/40 border border-white/20 
                                 text-white rounded-xl resize-none focus:border-purple-400 outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
