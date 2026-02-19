"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  familyId: string;
  userId: string;
  onClose: () => void;
  onCreated: () => void;
};

const REQUEST_TYPES = [
  "Custody Swap",
  "Schedule Change",
  "Expense Approval",
  "Travel Request",
  "Other",
];

export default function NewRequestSlideOver({
  familyId,
  userId,
  onClose,
  onCreated,
}: Props) {
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function createRequest() {
    if (!type || !familyId || !userId) return;

    setLoading(true);

    const { error } = await supabase.from("requests").insert({
      family_id: familyId,
      requested_by_user_id: userId,
      type,
      details: details || null,
      status: "pending",
      start_date: startDate || null,
      end_date: endDate || null,
    });

    setLoading(false);

    if (!error) {
      onCreated();
      onClose();
    } else {
      console.error("Error creating request:", error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="w-full max-w-md h-full bg-white p-6 space-y-6 shadow-xl overflow-y-auto">

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">New Request</h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-black"
          >
            Close
          </button>
        </div>

        {/* Request Type Dropdown */}
        <div className="space-y-1">
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

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Details
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Provide additional details..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={createRequest}
            disabled={loading || !type}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Request"}
          </button>
        </div>

      </div>
    </div>
  );
}