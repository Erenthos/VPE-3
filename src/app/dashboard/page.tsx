"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";

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

export default function DashboardPage() {
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

  // Load segments
  async function loadSegments() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/segments");
      if (!res.ok) throw new Error("Failed to load segments");
      const data = await res.json();
      setSegments(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load segments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSegments();
  }, []);

  // Add segment
  async function handleCreateSegment(e?: React.FormEvent) {
    e?.preventDefault();
    if (!newSegmentName.trim()) return;
    try {
      const res = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSegmentName.trim(), weight: newSegmentWeight })
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to create segment");
      }

      setNewSegmentName("");
      setNewSegmentWeight(1);
      setShowAddSegment(false);
      await loadSegments();
    } catch (err: any) {
      alert(err.message || "Failed to create segment");
    }
  }

  // Delete segment
  async function handleDeleteSegment(segmentId: string) {
    if (!confirm("Delete this segment and all its questions?")) return;
    try {
      const res = await fetch("/api/segments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentId })
      });
      if (!res.ok) throw new Error("Failed to delete segment");
      await loadSegments();
    } catch (err: any) {
      alert(err.message || "Failed to delete segment");
    }
  }

  // Start edit
  function startEdit(segment: Segment) {
    setEditingSegmentId(segment.id);
    setEditingName(segment.name);
    setEditingWeight(segment.weight);
  }

  // Save edit (name / weight) and optionally add or delete question through same PUT endpoint
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
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to update segment");
      }
      setEditingSegmentId(null);
      await loadSegments();
    } catch (err: any) {
      alert(err.message || "Failed to update segment");
    }
  }

  // Add question
  async function handleAddQuestion(segmentId: string) {
    if (!newQuestionText.trim()) {
      alert("Question text required");
      return;
    }
    try {
      const res = await fetch("/api/segments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentId, addQuestion: newQuestionText.trim() })
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to add question");
      }
      setAddingQuestionForSegment(null);
      setNewQuestionText("");
      await loadSegments();
    } catch (err: any) {
      alert(err.message || "Failed to add question");
    }
  }

  // Delete question
  async function handleDeleteQuestion(segmentId: string, questionId: string) {
    if (!confirm("Delete this question?")) return;
    try {
      const res = await fetch("/api/segments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentId, deleteQuestionId: questionId })
      });
      if (!res.ok) throw new Error("Failed to delete question");
      await loadSegments();
    } catch (err: any) {
      alert(err.message || "Failed to delete question");
    }
  }

  return (
    <div className="relative w-full min-h-screen text-white">
      {/* Cosmic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-purple-700/20 blur-[160px] -top-20 -left-40" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[160px] top-40 -right-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Segments & Questions</h1>
            <p className="text-gray-400">Define evaluation segments, weightage and questions.</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddSegment(true)}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition shadow-lg font-semibold"
            >
              + Add Segment
            </button>

            <button
              onClick={loadSegments}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && <div className="text-gray-300">Loading segments...</div>}
        {error && <div className="text-red-400">{error}</div>}

        {!loading && segments.length === 0 && (
          <div className="text-gray-300">No segments yet. Click "Add Segment" to create one.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {segments.map((seg) => (
            <motion.div
              key={seg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{seg.name}</h2>
                    <span className="text-sm text-gray-300">Weight: {seg.weight}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Questions: {seg.questions.length}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(seg)}
                    className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSegment(seg.id)}
                    className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Editing area */}
              {editingSegmentId === seg.id ? (
                <div className="mt-4 space-y-3">
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  />
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-300">Weight</label>
                    <input
                      type="number"
                      value={editingWeight}
                      onChange={(e) => setEditingWeight(Number(e.target.value))}
                      min={1}
                      max={100}
                      className="w-24 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                    />
                    <button
                      onClick={() => saveSegmentEdits(seg.id)}
                      className="ml-auto px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSegmentId(null)}
                      className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Questions list */}
                  <div className="mt-4 space-y-3">
                    {seg.questions.map((q) => (
                      <div key={q.id} className="flex items-center gap-3 justify-between">
                        <div className="text-gray-200">{q.text}</div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setAddingQuestionForSegment(seg.id); setNewQuestionText(""); }}
                            className="px-2 py-1 text-sm rounded bg-white/5 hover:bg-white/10"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(seg.id, q.id)}
                            className="px-2 py-1 text-sm rounded bg-red-600 hover:bg-red-700"
                          >
                            Del
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add question UI */}
                  {addingQuestionForSegment === seg.id && (
                    <div className="mt-4 flex gap-2">
                      <input
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                        placeholder="Enter question text"
                      />
                      <button
                        onClick={() => handleAddQuestion(seg.id)}
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => { setAddingQuestionForSegment(null); setNewQuestionText(""); }}
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Quick add question button */}
                  {addingQuestionForSegment !== seg.id && (
                    <div className="mt-4">
                      <button
                        onClick={() => { setAddingQuestionForSegment(seg.id); setNewQuestionText(""); }}
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                      >
                        + Add Question
                      </button>
                    </div>
                  )}
                </>
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
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                required
              />
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-300">Weight</label>
                <input
                  type="number"
                  value={newSegmentWeight}
                  onChange={(e) => setNewSegmentWeight(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-24 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSegment(false)}
                  className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-700"
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
