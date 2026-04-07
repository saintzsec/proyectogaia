import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

export default async function PostLoginPage() {
  const { profile } = await getSessionProfile();
  if (!profile) redirect("/login");

  if (profile.role === "admin_gaia") redirect("/admin");
  redirect("/docente");
}
