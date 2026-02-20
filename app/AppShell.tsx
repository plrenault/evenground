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
  const isLanding = pathname === "/";

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Hard logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login"); // replace prevents back nav issues
  };

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

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error("No session");
        return;
      }

      const userId = session.user.id;

      const { data: membership, error: membershipError } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (membershipError) {
        console.error("Membership error:", membershipError);
        return;
      }

      if (!membership) {
        console.error("No family membership found");
        return;
      }

      const { error: insertError } = await supabase.from("requests").insert({
        family_id: membership.family_id,
        requested_by_user_id: userId,
        type,
        details: details || null,
        status: "pending",
        start_date: startDate,
        end_date: endDate || null,
      });

      if (insertError) {
        console.error("Request insert error:", insertError);
        return;
      }

      // Reset form
      setType("");
      setDetails("");
      setStartDate("");
      setEndDate("");
      setShowForm(false);

      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  // Landing page (no sidebar)
  if (isLanding) {
    return (
      <div className="min-h-screen bg-white">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 p-6 flex-col justify-between">
        <div>
          <div className="text-xl font-semibold mb-8">
            EvenGround
          </div>

          <nav className="space-y-2 mb-8">
            {navItem("/dashboard", "Dashboard")}
            {navItem("/requests", "All Requests")}
            {navItem("/requests/pending", "Pending")}
          </nav>

          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-black text-white text-sm px-4 py-2 rounded-lg"
          >
            + New Request
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full border border-gray-300 text-sm px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Logout
          </button>

          <div className="text-xs text-gray-400 text-center">
            Calm. Structured. Neutral.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-8 md:p-10">
        {/* Mobile Header */}
        <div className="md:hidden mb-6 flex justify-between items-center">
          <div className="text-lg font-semibold">
            EvenGround
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="bg-black text-white text-xs px-3 py-2 rounded-lg"
            >
              + Request
            </button>

            <button
              onClick={handleLogout}
              className="border border-gray-300 text-xs px-3 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
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
              className="w-full border border-gray-300 p-2 rounded-lg text-sm"
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
              className="w-full border border-gray-300 p-2 rounded-lg text-sm"
              placeholder="Details"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />

            <input
              type="date"
              className="w-full border border-gray-300 p-2 rounded-lg text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <input
              type="date"
              className="w-full border border-gray-300 p-2 rounded-lg text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={createRequest}
                disabled={!type || !startDate || loading}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}