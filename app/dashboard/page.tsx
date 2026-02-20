import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  // 1️⃣ Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2️⃣ Get family membership
  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/onboarding");
  }

  const familyId = membership.family_id;

  // 3️⃣ Fetch data in parallel
  const today = new Date();
  const next7 = new Date();
  next7.setDate(today.getDate() + 7);

  const [
    pendingResult,
    upcomingResult,
    recentRequestsResult,
  ] = await Promise.all([
    // Needs Your Approval
    supabase
      .from("requests")
      .select("*")
      .eq("family_id", familyId)
      .eq("status", "pending")
      .neq("requested_by_user_id", user.id)
      .order("created_at", { ascending: false }),

    // Upcoming (approved in next 7 days)
    supabase
      .from("requests")
      .select("*")
      .eq("family_id", familyId)
      .eq("status", "approved")
      .gte("date", today.toISOString())
      .lte("date", next7.toISOString())
      .order("date", { ascending: true }),

    // Recent activity (last 5 requests)
    supabase
      .from("requests")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const pending = pendingResult.data || [];
  const upcoming = upcomingResult.data || [];
  const recent = recentRequestsResult.data || [];

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* 🔥 Section 1 — Needs Your Approval */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Needs Your Approval ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Nothing pending right now.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((req) => (
              <div
                key={req.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="font-medium capitalize">
                  {req.type}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {req.details}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 📅 Section 2 — Upcoming */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Upcoming (Next 7 Days)
        </h2>

        {upcoming.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No approved items in the next 7 days.
          </p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((req) => (
              <div key={req.id} className="text-sm">
                <span className="font-medium">
                  {new Date(req.date).toLocaleDateString()}
                </span>{" "}
                — {req.details}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🕒 Section 3 — Recent Activity */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Recent Activity
        </h2>

        {recent.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No recent activity.
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {recent.map((req) => (
              <div key={req.id}>
                <span className="capitalize font-medium">
                  {req.type}
                </span>{" "}
                — {req.status}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}