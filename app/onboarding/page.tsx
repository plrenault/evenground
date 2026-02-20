"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [coparentEmail, setCoparentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        setError("No active session found.");
        setLoading(false);
        return;
      }

      const user = sessionData.session.user;
      console.log("USER:", user);

      // Create family
      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert({})
        .select()
        .single();

      console.log("FAMILY RESULT:", family, familyError);

      if (familyError) {
        setError("Family error: " + familyError.message);
        setLoading(false);
        return;
      }

      // Attach founder
      const { error: memberError } = await supabase
        .from("family_members")
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: "parent",
        });

      console.log("MEMBER RESULT:", memberError);

      if (memberError) {
        setError("Member error: " + memberError.message);
        setLoading(false);
        return;
      }

      console.log("Coparent email value:", coparentEmail);

      // Invite block
      if (coparentEmail) {
        console.log("Invite block running");

        const inviteToken = crypto.randomUUID();

        const { error: inviteError } = await supabase
          .from("family_invites")
          .insert({
            family_id: family.id,
            email: coparentEmail,
            status: "pending",
            token: inviteToken,
          });

        console.log("INVITE RESULT:", inviteError);

        if (inviteError) {
          setError("Invite error: " + inviteError.message);
          setLoading(false);
          return;
        }

        console.log("Invite inserted successfully");
      } else {
        console.log("Invite block skipped because coparentEmail is empty");
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError("Unexpected error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gray-50">
      <form
        onSubmit={handleCreateFamily}
        className="flex flex-col gap-4 w-full max-w-md bg-white p-8 rounded-xl shadow-sm"
      >
        <h1 className="text-xl font-semibold text-center">
          Create Your Family
        </h1>

        <input
          type="email"
          placeholder="Co-parent Email"
          value={coparentEmail}
          onChange={(e) => setCoparentEmail(e.target.value)}
          className="border p-2 rounded-md"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white p-2 rounded-md disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Family"}
        </button>

        {error && (
          <p className="text-sm text-center text-red-600">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}