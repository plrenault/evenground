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

const REQUEST_TYPES = [
  "Custody Swap",
  "Schedule Change",
  "Expense Approval",
  "Travel Request",
  "Other",
];

export default function RequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [showNew, setShowNew] = useState(false);
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);

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

    if (!familyMember) return;

    setFamilyId(familyMember.family_id);

    const { data } = await supabase
      .from("requests")
      .select("*")
      .eq("family_id", familyMember.family_id)
      .order("created_at", { ascending: false });

    setRequests(data || []);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  async function createRequest() {
    if (!type || !familyId || !userId) return;

    setCreating(true);

    await supabase.from("requests").insert({
      family_id: familyId,
      requested_by_user_id: userId,
      type,
      details: details || null,
      status: "pending",
      start_date: startDate || null,
      end_date: endDate || null,
    });

    setCreating(false);
    setShowNew(false);
    setType("");
    setDetails("");
    setStartDate("");
    setEndDate("");

    await loadData();
  }

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">All Requests</h1>

        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 text-sm bg-black text-white rounded-lg"
        >
          New Request
        </button>
      </div>

      {/* 🔥 Shared Request List */}
      <RequestList
        requests={requests}
        currentUserId={userId}
      />

      {/* Slide Over */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="w-full max-w-md h-full bg-white p-6 space-y-6 shadow-xl overflow-y-auto">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">New Request</h2>
              <button
                onClick={() => setShowNew(false)}
                className="text-sm text-gray-500"
              >
                Close
              </button>
            </div>

            <div>
              <label className="text-sm font-medium">
                Request Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select request type</option>
                {REQUEST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Details..."
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNew(false)}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={createRequest}
                disabled={creating || !type}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Request"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}