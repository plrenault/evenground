"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function InviteClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("Processing invite...");

  useEffect(() => {
    const handleInvite = async () => {
      if (!token) {
        setMessage("Invalid invite link.");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: invite } = await supabase
        .from("family_invites")
        .select("*")
        .eq("token", token)
        .single();

      if (!invite || invite.status !== "pending") {
        setMessage("Invite invalid or already used.");
        return;
      }

      await supabase.from("family_members").insert({
        family_id: invite.family_id,
        user_id: user.id,
      });

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
        <p>{message}</p>
      </div>
    </div>
  );
}