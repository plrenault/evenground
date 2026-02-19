"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

type RequestRow = {
  id: string;
  type: string | null;
  details: string | null;
  status: "pending" | "approved" | "declined";
  start_date: string | null;
  end_date: string | null;
  requested_by_user_id: string;
};

function formatDate(date?: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString();
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : status === "declined"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${styles}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function RequestCard({
  request,
  currentUserId,
}: {
  request: RequestRow;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const start = formatDate(request.start_date);
  const end = formatDate(request.end_date);

  const requestedByYou =
    request.requested_by_user_id === currentUserId;

  const showActions =
    request.status === "pending" &&
    currentUserId &&
    !requestedByYou;

  async function updateStatus(
    e: React.MouseEvent,
    newStatus: "approved" | "declined"
  ) {
    e.stopPropagation();

    setLoading(true);

    await supabase
      .from("requests")
      .update({ status: newStatus })
      .eq("id", request.id);

    setLoading(false);
    router.refresh();
  }

  const accentColor =
    request.status === "approved"
      ? "bg-green-500"
      : request.status === "declined"
      ? "bg-red-500"
      : "bg-yellow-400";

  return (
    <div
      onClick={() => router.push(`/requests/${request.id}`)}
      className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
    >
      {/* Left Accent Bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${accentColor}`} />

      <div className="p-5 space-y-3">

        <div className="flex justify-between items-start gap-4">

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold">
                {request.type || "General Request"}
              </h3>

              <StatusBadge status={request.status} />
            </div>

            <div className="text-xs text-gray-500">
              {requestedByYou
                ? "Requested by You"
                : "Requested by Other Parent"}
            </div>
          </div>

        </div>

        {(start || end) && (
          <div className="text-xs text-gray-500">
            {start && !end && `Date: ${start}`}
            {start && end && `From ${start} → ${end}`}
          </div>
        )}

        {request.details && (
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
            {request.details}
          </p>
        )}

        {/* Inline Actions */}
        {showActions && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex gap-3 pt-2"
          >
            <button
              disabled={loading}
              onClick={(e) => updateStatus(e, "approved")}
              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              Approve
            </button>

            <button
              disabled={loading}
              onClick={(e) => updateStatus(e, "declined")}
              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        )}

      </div>
    </div>
  );
}