"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the login link.");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
        <h1 className="text-xl font-semibold">Login</h1>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white p-2 rounded"
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>

        {message && <p className="text-sm">{message}</p>}
      </form>
    </div>
  );
}