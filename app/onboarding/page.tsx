"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [coparentEmail, setCoparentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🔐 Get session (more stable than getUser)
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error("No active session:", sessionError);
        setError("You must be logged in.");
        router.push("/login");
        return;
      }

      const user = sessionData.session.user;

      console.log("Authenticated user:", user);

      // 1️⃣ Create family
      const { data: family, error: familyInsertError } = await supabase
        .from("families")
        .insert({})
        .select()
        .single();

      if (familyInsertError || !family) {
        console.error("Family insert error:", familyInsertError);
        setError("Could not create family.");
        return;
      }

      console.log("Created family:", family);

      // 2️⃣ Attach founder to family
      const { error: memberError } = await supabase
        .from("family_members")
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: "parent",
        });

      if (memberError) {
        console.error("Member insert error:", memberError);
        setError("Could not attach you to family.");
        return;
      }

      console.log("Attached founder to family.");

      // 3️⃣ Create invite
      if (coparentEmail) {
        const inviteToken = crypto.randomUUID();

        const { error: inviteError } = await supabase
          .from("family_invites")
          .insert({
            family_id: family.id,
            email: coparentEmail,
            status: "pending",
            token: inviteToken,
          });

        if (inviteError) {
          console.error("Invite insert error:", inviteError);
        } else {
          await fetch("/api/invite/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: coparentEmail,
              token: inviteToken,
            }),
          });
        }
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong.");
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
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded-md"
          required
        />

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