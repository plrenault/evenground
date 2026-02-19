"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type RequestRow = {
  id: string;
  family_id: string;
  requested_by_user_id: string;
  type: string | null;
  details: string | null;
  status: "pending" | "approved" | "declined";
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

type MessageRow = {
  id: string;
  request_id: string;
  user_id: string;
  content: string;
  created_at: string;
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
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles}`}>
      {status}
    </span>
  );
}

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const requestId = params?.id;

  const [userId, setUserId] = useState<string | null>(null);
  const [request, setRequest] = useState<RequestRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Tone Guard
  const [showToneModal, setShowToneModal] = useState(false);
  const [toneRisk, setToneRisk] = useState("");
  const [toneReason, setToneReason] = useState("");
  const [toneRewrite, setToneRewrite] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");

  const [newMessage, setNewMessage] = useState("");

  async function loadData() {
    if (!requestId) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id ?? null;

    if (!uid) {
      router.push("/login");
      return;
    }

    setUserId(uid);

    const { data: requestData } = await supabase
      .from("requests")
      .select("*")
      .eq("id", requestId)
      .single();

    setRequest(requestData);

    const { data: messageData } = await supabase
      .from("request_messages")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });

    setMessages(messageData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [requestId]);

  async function updateStatus(next: "approved" | "declined") {
    if (!requestId) return;

    await supabase
      .from("requests")
      .update({ status: next })
      .eq("id", requestId);

    await loadData();
  }

  async function insertMessage(content: string) {
    if (!requestId || !userId) return;

    await supabase.from("request_messages").insert({
      request_id: requestId,
      user_id: userId,
      content,
    });

    setNewMessage("");
    await loadData();
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;

    const raw = newMessage.trim();

    try {
      const res = await fetch("/api/tone-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: raw }),
      });

      if (res.ok) {
        const tg = await res.json();
        const risk = (tg?.risk || "").toLowerCase();

        if (risk && risk !== "low") {
          setToneRisk(risk);
          setToneReason(tg.reason || "");
          setToneRewrite(tg.rewrite || "");
          setPendingMessage(raw);
          setShowToneModal(true);
          return;
        }
      }
    } catch {}

    await insertMessage(raw);
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!request) return <div className="p-6">Request not found.</div>;

  const start = formatDate(request.start_date);
  const end = formatDate(request.end_date);

  const canApproveDecline =
    request.status === "pending" &&
    userId &&
    request.requested_by_user_id !== userId;

  const requestedByYou = request.requested_by_user_id === userId;

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="border rounded-xl p-5 bg-white space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Request Type
            </div>
            <div className="text-lg font-semibold mt-1">
              {request.type || "General Request"}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {requestedByYou
                ? "Requested by You"
                : "Requested by Other Parent"}
            </div>
          </div>

          <StatusBadge status={request.status} />
        </div>

        {(start || end) && (
          <div className="text-sm text-gray-700">
            {start && !end && `Date: ${start}`}
            {start && end && `From ${start} → ${end}`}
          </div>
        )}

        {request.details && (
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {request.details}
          </div>
        )}

        {canApproveDecline && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => updateStatus("declined")}
              className="px-4 py-2 text-sm border rounded-lg"
            >
              Decline
            </button>
            <button
              onClick={() => updateStatus("approved")}
              className="px-4 py-2 text-sm bg-black text-white rounded-lg"
            >
              Approve
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="border rounded-xl p-5 bg-white space-y-4">
        {messages.map((m) => {
          const mine = m.user_id === userId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] ${
                  mine ? "bg-black text-white" : "bg-gray-100"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        <div className="pt-4 space-y-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Write a message..."
          />
          <div className="flex justify-end">
            <button
              onClick={sendMessage}
              className="px-4 py-2 text-sm bg-black text-white rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Tone Modal */}
      {showToneModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-xl">

            <div className="flex justify-between items-center">
              <div className="font-semibold">Tone Guard Review</div>
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  toneRisk === "high"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {toneRisk.toUpperCase()} RISK
              </span>
            </div>

            <div className="text-sm text-gray-600">{toneReason}</div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Original</div>
              <div className="border rounded-lg p-3 text-sm bg-gray-50">
                {pendingMessage}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Suggested Rewrite</div>
              <div className="border rounded-lg p-3 text-sm bg-yellow-50">
                {toneRewrite}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowToneModal(false)}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await insertMessage(pendingMessage);
                  setShowToneModal(false);
                }}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                Send Original
              </button>

              <button
                onClick={async () => {
                  await insertMessage(toneRewrite || pendingMessage);
                  setShowToneModal(false);
                }}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg"
              >
                Send Rewrite
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}