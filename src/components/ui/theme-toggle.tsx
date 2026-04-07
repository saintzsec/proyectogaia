"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("gaia-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      applyTheme(saved);
      return;
    }

    const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme: Theme = preferredDark ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("gaia-theme", nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
      title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
      className={`inline-flex items-center justify-center rounded-full border border-[var(--gaia-border)] bg-[var(--gaia-surface)] text-[var(--foreground)] transition-[transform,colors,opacity,box-shadow] duration-150 hover:bg-[var(--gaia-surface-muted)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0baba9] ${
        compact ? "h-9 w-9" : "h-10 w-10"
      }`}
    >
      {theme === "dark" ? (
        <Image src="/brand/theme-sun.png" alt="" width={20} height={20} className="h-5 w-5" />
      ) : (
        <Image src="/brand/theme-moon.png" alt="" width={20} height={20} className="h-5 w-5" />
      )}
    </button>
  );
}
