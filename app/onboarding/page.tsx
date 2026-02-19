"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 Protect onboarding — must be logged in
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      }
    }

    checkAuth();
  }, [router]);

  const handleSubmit = async () => {
    if (!firstName) return;

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      console.error("No authenticated user", userError);
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      display_name: `${firstName} ${lastName}`.trim(),
    });

    if (error) {
      console.error("Profile save error:", error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md space-y-6">
        <h1 className="text-xl font-semibold">Welcome to EvenGround</h1>
        <p className="text-sm text-gray-600">
          What name should the other parent see?
        </p>

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />

        <input
          type="text"
          placeholder="Last Name (optional)"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />

        <button
          onClick={handleSubmit}
          disabled={!firstName || loading}
          className="bg-black text-white px-4 py-2 rounded-md w-full disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}