"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [showAddSegment, setShowAddSegment] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState("");
  const [newSegmentWeight, setNewSegmentWeight] = useState<number>(1);

  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingWeight, setEditingWeight] = useState<number>(1);

  const [addingQuestionForSegment, setAddingQuestionForSegment] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState("");

  /** Load segments **/
  async function loadSegments() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/segments");
      if (!res.ok) throw new Error("Failed to load segments");
      const data = await res.json();
      setSegments(data);
    } catch (err: any) {
      setError(err.message || "Failed to load segments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSegments();
  }, []);

  /** Create segment **/
  async function handleCreateSegment(e?: React.FormEvent) {
    e?.preventDefault();
    if (!newSegmentName.trim()) return;

    try {
      const res = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSegmentName.trim(), weight: newSegmentWeight })
      });

      if (!res.ok) throw new Error("Failed to create segment");

      setNewSegmentName("");
      setNewSegmentWeight(1);
      setShowAddSegment(false);
      loadSegments();
    } catch (err: any) {
      alert(err.message);
    }
  }

  /** Delete segment **/
  async function handleDeleteSegment(segmentId: string) {
    if (!confirm("Delete this segment and all its questions?")) return;

    try {
      const res = await fetch("/api/segments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentId })
      });

      if (!res.ok) throw new Error("Failed to delete segment");

      loadSegments();
    } catch (err: any) {
      alert(err.message);
    }
  }

  /** Begin edit **/
  function startEdit(segment: Segment) {
    setEditingSegmentId(segment.id);
    setEditingName(segment.name);
    setEditingWeight(segment.weight);
  }

  /** Save edits **/
  async function saveSegmentEdits(segmentId: string) {
    try {
      const res = await fetch("/api/segments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segmentId,
          name: editingName.trim(),
          weight: Number(editingWeight)
        })
      });

      if (!res.ok) throw new Error("Failed to update segment");

      setEditingSegmentId(null);
      loadSegments();
    } catch (err: any) {
      alert(err.message);
    }
  }

  /** Add question **/
  async function handleAddQuestion(segmentId: string) {
    if (!newQuestionText.trim()) {
      alert("Question text required");
      return;
    }

    try {
      const res = await fetch("/api/segments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segmentId,
          addQuestion: newQuestionText.trim()
        })
      });

      if (!res.ok) throw new Error("Failed to add question");

      setAddingQuestionForSegment(null);
      setNewQuestionText("");
      loadSegments();
    } catch (err: any) {
      alert(err.message);
    }
  }

  /** Delete question **/
  async function handleDeleteQuestion(segmentId: string, questionId: string) {
    if (!confirm("Delete this question?")) return;

    try {
      const res = await fetch("/api/segments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segmentId,
          deleteQuestionId: questionId
        })
      });

      if (!res.ok) throw new Error("Failed to delete question");

      loadSegments();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="relative w-full min-h-screen text-white">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-purple-700/20 blur-[160px] -top-20 -left-40" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[160px] top-40 -right-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Segments & Questions</h1>
            <p className="text-gray-400">
              Define scoring segments, weightage, and evaluation questions.
            </p>
          </div>

          <button
            onClick={() => setShowAddSegment(true)}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition shadow-xl"
          >
            + Add Segment
          </button>
        </div>

        {loading && <div className="text-gray-300">Loading segments...</div>}
        {error && <div className="text-red-400">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {segments.map((segment) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{segment.name}</h2>
                  <p className="text-gray-300 text-sm">Weight: {segment.weight}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {segment.questions.length} Questions
                  </p>
                </div>

                <div className="space-x-2">
                  <button
                    onClick={() => startEdit(segment)}
                    className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSegment(segment.id)}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Edit UI */}
              {editingSegmentId === segment.id && (
                <div className="mt-4 space-y-3">
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white"
                  />
                  <input
                    type="number"
                    value={editingWeight}
                    onChange={(e) => setEditingWeight(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-24 px-3 py-2 rounded bg-black/40 border border-white/10 text-white"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => saveSegmentEdits(segment.id)}
                      className="flex-1 py-2 rounded bg-green-600 hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSegmentId(null)}
                      className="flex-1 py-2 rounded bg-white/10 hover:bg-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Questions */}
              <div className="mt-4 space-y-3">
                {segment.questions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2"
                  >
                    <span>{q.text}</span>

                    <button
                      onClick={() => handleDeleteQuestion(segment.id, q.id)}
                      className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Question */}
              {addingQuestionForSegment === segment.id ? (
                <div className="mt-4 flex gap-2">
                  <input
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Question text"
                    className="flex-1 px-3 py-2 rounded bg-black/40 border border-white/10 text-white"
                  />
                  <button
                    onClick={() => handleAddQuestion(segment.id)}
                    className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setAddingQuestionForSegment(null)}
                    className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingQuestionForSegment(segment.id)}
                  className="mt-4 px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm"
                >
                  + Add Question
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Segment Modal */}
      {showAddSegment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 w-[90%] max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add Segment</h3>
            <form onSubmit={handleCreateSegment} className="space-y-4">
              <input
                value={newSegmentName}
                onChange={(e) => setNewSegmentName(e.target.value)}
                placeholder="Segment name"
                className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white"
                required
              />
              <input
                type="number"
                value={newSegmentWeight}
                onChange={(e) => setNewSegmentWeight(Number(e.target.value))}
                min={1}
                max={100}
                className="w-24 px-3 py-2 rounded bg-black/40 border border-white/10 text-white"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSegment(false)}
                  className="flex-1 py-2 rounded bg-white/10 hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded bg-purple-600 hover:bg-purple-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
