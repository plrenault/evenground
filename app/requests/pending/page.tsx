"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import RequestList from "@/app/components/RequestList";

type RequestRow = {
  id: string;
  family_id: string;
  type: string | null;
  details: string | null;
  status: "pending" | "approved" | "declined";
  start_date: string | null;
  end_date: string | null;
  requested_by_user_id: string;
  created_at: string;
};

export default function PendingRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id ?? null;

    if (!uid) {
      router.push("/login");
      return;
    }

    setUserId(uid);

    const { data: familyMember } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", uid)
      .single();

    if (!familyMember) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("requests")
      .select("*")
      .eq("family_id", familyMember.family_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    setRequests(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Pending Requests
        </h1>
      </div>

      <RequestList
        requests={requests}
        currentUserId={userId}
      />
    </div>
  );
}