"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setMessage("Signup succeeded but user not returned.");
      setLoading(false);
      return;
    }

    // 🔥 HANDLE INVITE TOKEN
    if (token) {
      const { data: invite, error: inviteError } = await supabase
        .from("family_invites")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (inviteError || !invite) {
        console.error("Invite not found", inviteError);
      } else {
        // Attach user to family
        const { error: memberError } = await supabase
          .from("family_members")
          .insert({
            family_id: invite.family_id,
            user_id: user.id,
            role: "parent",
          });

        if (memberError) {
          console.error("Error inserting family member:", memberError);
        }

        // Mark invite accepted
        await supabase
          .from("family_invites")
          .update({ status: "accepted" })
          .eq("id", invite.id);
      }

      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gray-50">
      <form
        onSubmit={handleSignUp}
        className="flex flex-col gap-4 w-full max-w-sm bg-white p-6 rounded-xl shadow-sm"
      >
        <h1 className="text-xl font-semibold text-center">
          Create Account
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded-md w-full"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded-md w-full"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white p-2 rounded-md w-full disabled:opacity-50"
        >
          {loading ? "Creating..." : "Sign Up"}
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