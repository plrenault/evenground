"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function InviteHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Processing invite...");

  useEffect(() => {
    const handleInvite = async () => {
      if (!token) {
        setMessage("Invalid invite link.");
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/");
        return;
      }

      // Get invite
      const { data: invite } = await supabase
        .from("family_invites")
        .select("*")
        .eq("token", token)
        .single();

      if (!invite || invite.status !== "pending") {
        setMessage("Invite invalid or already used.");
        setLoading(false);
        return;
      }

      // Attach user to family
      await supabase.from("family_members").insert({
        family_id: invite.family_id,
        user_id: user.id,
      });

      // Mark invite accepted
      await supabase
        .from("family_invites")
        .update({ status: "accepted" })
        .eq("id", invite.id);

      router.push("/dashboard");
    };

    handleInvite();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {loading ? <p>{message}</p> : <p>{message}</p>}
      </div>
    </div>
  );
}