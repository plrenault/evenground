"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const REQUEST_TYPES = [
  "Custody Swap",
  "Schedule Change",
  "Expense Approval",
  "Travel Request",
  "Other",
];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navItem = (href: string, label: string) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        className={`block px-3 py-2 rounded-lg text-sm transition ${
          active
            ? "bg-black text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        {label}
      </Link>
    );
  };

  const createRequest = async () => {
    if (!type || !startDate) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const userId = session.user.id;

    const { data: membership } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!membership) return;

    await supabase.from("requests").insert({
      family_id: membership.family_id,
      requested_by_user_id: userId,
      type,
      details: details || null,
      status: "pending",
      start_date: startDate,
      end_date: endDate || null,
    });

    setType("");
    setDetails("");
    setStartDate("");
    setEndDate("");
    setShowForm(false);

    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar (Desktop Only) */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 p-6 flex-col justify-between">
        <div>
          <div className="text-xl font-semibold mb-8">
            EvenGround
          </div>

          <nav className="space-y-2 mb-8">
            {navItem("/", "Home")}
            {navItem("/dashboard", "Dashboard")}
            {navItem("/requests", "All Requests")}
            {navItem("/requests/pending", "Pending")}
          </nav>

          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-black text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            + New Request
          </button>
        </div>

        <div className="text-xs text-gray-400">
          Calm. Structured. Neutral.
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-8 md:p-10">
        
        {/* Mobile Header */}
        <div className="md:hidden mb-6 flex justify-between items-center">
          <div className="text-lg font-semibold">EvenGround</div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-black text-white text-xs px-3 py-2 rounded-lg"
          >
            + Request
          </button>
        </div>

        {children}
      </div>

      {/* Slide Over */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex justify-end">
          <div className="w-full max-w-md bg-white p-8 shadow-xl space-y-5">

            <h2 className="text-lg font-semibold">
              Create New Request
            </h2>

            <select
              className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Select request type</option>
              {REQUEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <textarea
              className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Details"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />

            <input
              type="date"
              className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <input
              type="date"
              className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={createRequest}
                disabled={!type || !startDate}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                Create
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}