"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function InvitePage() {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const router = useRouter();

  const generateInvite = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    // Get family_id
    const { data: familyMember } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", user.id)
      .single();

    if (!familyMember) return;

    const token = crypto.randomUUID();

    await supabase.from("family_invites").insert({
      family_id: familyMember.family_id,
      token,
      status: "pending",
    });

    const link = `${window.location.origin}/invite?token=${token}`;
    setInviteLink(link);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-semibold">Invite Other Parent</h1>

      <button
        onClick={generateInvite}
        className="bg-black text-white px-4 py-2 rounded-md"
      >
        Generate Invite Link
      </button>

      {inviteLink && (
        <div className="bg-gray-100 p-4 rounded-md break-all">
          {inviteLink}
        </div>
      )}

      <button
        onClick={() => router.push("/dashboard")}
        className="text-sm underline"
      >
        Back to Dashboard
      </button>
    </div>
  );
}