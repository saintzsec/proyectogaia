import { redirect } from "next/navigation";

export const metadata = { title: "Cómo funciona" };

export default function ComoFuncionaPage() {
  redirect("/sobre");
}
