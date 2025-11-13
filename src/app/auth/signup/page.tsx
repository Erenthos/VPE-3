"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setErrorMsg(data.error || "Something went wrong");
      return;
    }

    router.push("/auth/signin");
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center text-white">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0016] to-black" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-purple-700/20 blur-[160px] -top-20 -left-40" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[160px] top-40 -right-40" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 
                   rounded-3xl p-10 w-[90%] max-w-md shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Create an Account
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Join the Cosmic Vendor Performance Platform.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm mb-2">Name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 
                         text-white focus:outline-none focus:border-purple-400 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 
                         text-white focus:outline-none focus:border-purple-400 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-2">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 
                         text-white focus:outline-none focus:border-purple-400 transition"
            />
          </div>

          {/* Error */}
          {errorMsg && (
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 
                       hover:from-purple-600 hover:to-blue-600 transition text-white font-medium
                       shadow-lg disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-300 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

