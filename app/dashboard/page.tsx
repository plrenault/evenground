"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!profile) {
        router.push("/onboarding");
        return;
      }

      const { data: membership } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", userId)
        .single();

      if (!membership) {
        setPendingCount(0);
        return;
      }

      const { count } = await supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .eq("family_id", membership.family_id)
        .eq("status", "pending");

      setPendingCount(count ?? 0);
    }

    load();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (pendingCount === null) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>

      {/* Pending Requests Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-600">Pending Requests</p>
        <p className="text-2xl font-semibold">{pendingCount}</p>
      </div>

      {/* Invite Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-600 mb-3">Family Setup</p>
        <button
          onClick={() => router.push("/dashboard/invite")}
          className="bg-black text-white px-4 py-2 rounded-md hover:opacity-90 transition"
        >
          Invite Other Parent
        </button>
      </div>
    </div>
  );
}