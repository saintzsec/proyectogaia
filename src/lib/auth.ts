import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";

export type { AppRole };

export type Profile = {
  id: string;
  full_name: string | null;
  role: AppRole;
  locale: string;
};

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, locale")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return { user, profile: null };
  }

  return {
    user,
    profile: profile as Profile,
  };
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, locale")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) redirect("/login");

  return { user, profile: profile as Profile, supabase };
}

export async function requireRole(role: AppRole) {
  const ctx = await requireUser();
  if (ctx.profile.role !== role) {
    if (ctx.profile.role === "admin_gaia") redirect("/admin");
    redirect("/docente");
  }
  return ctx;
}
