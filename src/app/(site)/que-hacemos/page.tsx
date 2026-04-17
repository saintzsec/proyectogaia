import { redirect } from "next/navigation";

export const metadata = { title: "Qué hacemos" };

export default function QueHacemosPage() {
  redirect("/sobre");
}
