"use client";

import RequestCard from "./RequestCard";

type RequestRow = {
  id: string;
  type: string | null;
  details: string | null;
  status: "pending" | "approved" | "declined";
  start_date: string | null;
  end_date: string | null;
  requested_by_user_id: string;
};

export default function RequestList({
  requests,
  currentUserId,
}: {
  requests: RequestRow[];
  currentUserId: string | null;
}) {
  if (!requests.length) {
    return (
      <div className="text-sm text-gray-500">
        No requests found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((r) => (
        <RequestCard
          key={r.id}
          request={r}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}