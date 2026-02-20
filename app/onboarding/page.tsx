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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      // 1️⃣ Create family
      const { error: familyInsertError } = await supabase
        .from("families")
        .insert({
          created_by: user.id,
        });

      if (familyInsertError) {
        console.error(familyInsertError);
        setError("Could not create family.");
        return;
      }

      // 2️⃣ Fetch family
      const { data: createdFamily, error: fetchError } = await supabase
        .from("families")
        .select("id")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !createdFamily) {
        console.error(fetchError);
        setError("Could not retrieve family.");
        return;
      }

      // 3️⃣ Add membership
      const { error: memberError } = await supabase
        .from("family_members")
        .insert({
          family_id: createdFamily.id,
          user_id: user.id,
        });

      if (memberError) {
        console.error(memberError);
        setError("Could not attach you to family.");
        return;
      }

      // 4️⃣ Create invite + send email
      if (coparentEmail) {
        const inviteToken = crypto.randomUUID();

        const { error: inviteError } = await supabase
          .from("family_invites")
          .insert({
            family_id: createdFamily.id,
            email: coparentEmail,
            status: "pending",
            token: inviteToken,
          });

        if (!inviteError) {
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
        } else {
          console.error(inviteError);
        }
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
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