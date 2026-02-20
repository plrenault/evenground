"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.replace("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-full max-w-sm bg-white p-6 rounded-xl shadow-sm"
      >
        <h1 className="text-xl font-semibold text-center">
          Login to EvenGround
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded-md"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded-md"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white p-2 rounded-md disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && (
          <p className="text-sm text-center text-red-600">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}