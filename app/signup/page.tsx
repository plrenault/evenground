"use client";

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

    // If no invite token → normal onboarding flow
    if (!token) {
      router.push("/onboarding");
      return;
    }

    // If token exists → attach to family
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Look up invite
      const { data: invite, error: inviteError } = await supabase
        .from("family_invites")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (inviteError || !invite) {
        console.error("Invite lookup failed", inviteError);
        router.push("/onboarding");
        return;
      }

      // Attach to family
      const { error: memberError } = await supabase
        .from("family_members")
        .insert({
          family_id: invite.family_id,
          user_id: user.id,
        });

      if (memberError) {
        console.error("Member attach failed", memberError);
        router.push("/onboarding");
        return;
      }

      // Mark invite accepted
      await supabase
        .from("family_invites")
        .update({ status: "accepted" })
        .eq("id", invite.id);

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
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

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}