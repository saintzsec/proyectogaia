"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { joinClassAndCreateGroup } from "@/app/actions/class-student-public";
import {
  normalizeJoinCodeInput,
  sanitizeJoinCodeSegment,
} from "@/lib/classes/join-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MemberRow = { id: string; value: string };

/** Stable across SSR and client; avoids hydration mismatch from random UUIDs in initial HTML. */
const EXTRA_MEMBER_INITIAL_ROW_ID = "extra-member-initial";

function newMemberRow(): MemberRow {
  return { id: crypto.randomUUID(), value: "" };
}

export function ClassJoinForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<{
    group_id: string;
    leader_token: string | null;
    member_tokens: { name: string; token: string }[];
  } | null>(null);

  const [codeSeg, setCodeSeg] = useState<[string, string, string]>(["", "", ""]);
  const codeRef0 = useRef<HTMLInputElement>(null);
  const codeRef1 = useRef<HTMLInputElement>(null);
  const codeRef2 = useRef<HTMLInputElement>(null);
  const codeRefs = useMemo(
    () => [codeRef0, codeRef1, codeRef2] as const,
    [codeRef0, codeRef1, codeRef2],
  );

  const [extraMembers, setExtraMembers] = useState<MemberRow[]>(() => [
    { id: EXTRA_MEMBER_INITIAL_ROW_ID, value: "" },
  ]);

  const setSegAt = useCallback((index: 0 | 1 | 2, value: string) => {
    const cleaned = sanitizeJoinCodeSegment(value);
    setCodeSeg((prev) => {
      const next = [...prev] as [string, string, string];
      next[index] = cleaned;
      return next;
    });
    if (cleaned.length === 3 && index < 2) {
      requestAnimationFrame(() => codeRefs[index + 1]?.current?.focus());
    }
  }, [codeRefs]);

  const onCodeKeyDown = useCallback(
    (index: 0 | 1 | 2, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && codeSeg[index] === "" && index > 0) {
        codeRefs[index - 1]?.current?.focus();
      }
    },
    [codeSeg, codeRefs],
  );

  const onCodePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    const norm = normalizeJoinCodeInput(text).replace(/-/g, "");
    if (norm.length >= 9) {
      e.preventDefault();
      setCodeSeg([
        sanitizeJoinCodeSegment(norm.slice(0, 3)),
        sanitizeJoinCodeSegment(norm.slice(3, 6)),
        sanitizeJoinCodeSegment(norm.slice(6, 9)),
      ]);
      codeRefs[2]?.current?.focus();
    }
  }, [codeRefs]);

  function addMemberRow() {
    setExtraMembers((rows) => [...rows, newMemberRow()]);
  }

  function removeMemberRow(id: string) {
    setExtraMembers((rows) =>
      rows.length <= 1
        ? [{ id: EXTRA_MEMBER_INITIAL_ROW_ID, value: "" }]
        : rows.filter((r) => r.id !== id),
    );
  }

  function updateMemberRow(id: string, value: string) {
    setExtraMembers((rows) => rows.map((r) => (r.id === id ? { ...r, value } : r)));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setTokens(null);

    const [a, b, c] = codeSeg;
    if (a.length !== 3 || b.length !== 3 || c.length !== 3) {
      setError("Escribe el código completo: 3 caracteres en cada casilla (sin O, I, 0 ni 1).");
      return;
    }

    const join_code = normalizeJoinCodeInput(`${a}-${b}-${c}`);
    const others = extraMembers.map((r) => r.value.trim()).filter((s) => s.length > 0);
    const other_members = others.join("\n");

    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("join_code", join_code);
    fd.set("other_members", other_members);
    const res = await joinClassAndCreateGroup(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("group_id" in res && res.ok) {
      setTokens({
        group_id: res.group_id,
        leader_token: res.leader_token,
        member_tokens: res.member_tokens,
      });
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid max-w-xl gap-4">
        <div className="space-y-2">
          <Label id="join-code-label">Código de clase</Label>
          <p className="text-xs text-[#6b7280]">
            Escribe o pega el código; se reparte solo en tres bloques (los guiones se añaden al
            enviar).
          </p>
          <div
            className="flex flex-wrap items-center gap-2 sm:gap-3"
            role="group"
            aria-labelledby="join-code-label"
          >
            {([0, 1, 2] as const).map((i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <Input
                  ref={codeRefs[i]}
                  id={i === 0 ? "join_code_seg0" : `join_code_seg${i}`}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={3}
                  value={codeSeg[i]}
                  onChange={(e) => setSegAt(i, e.target.value)}
                  onKeyDown={(e) => onCodeKeyDown(i, e)}
                  onPaste={i === 0 ? onCodePaste : undefined}
                  aria-label={`Tramo ${i + 1} del código (3 caracteres)`}
                  className="h-11 w-[4.25rem] text-center font-mono text-base uppercase tracking-widest sm:w-[4.5rem]"
                  placeholder="•••"
                />
                {i < 2 ? (
                  <span className="select-none text-lg font-light text-[#9ca3af]" aria-hidden>
                    —
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="group_name">Nombre del grupo</Label>
          <Input id="group_name" name="group_name" required placeholder="Ej. Equipo Biófito" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="leader_name">Tu nombre (líder)</Label>
          <Input id="leader_name" name="leader_name" required />
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <Label className="text-sm font-medium">Otros integrantes</Label>
            <Button type="button" variant="outline" size="sm" onClick={addMemberRow}>
              + Añadir integrante
            </Button>
          </div>
          <p className="text-xs text-[#6b7280]">
            Un nombre por casilla. Puedes dejar vacío si el grupo es solo tú, o añadir tantos
            compañeros como necesites.
          </p>
          <ul className="space-y-2">
            {extraMembers.map((row, index) => (
              <li key={row.id} className="flex gap-2">
                <Input
                  id={`other_member_${row.id}`}
                  value={row.value}
                  onChange={(e) => updateMemberRow(row.id, e.target.value)}
                  placeholder={`Integrante ${index + 1}`}
                  className="flex-1"
                  autoComplete="name"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-[#9ca3af] hover:text-red-600"
                  onClick={() => removeMemberRow(row.id)}
                  aria-label={`Quitar integrante ${index + 1}`}
                  disabled={extraMembers.length <= 1 && row.value === ""}
                >
                  Quitar
                </Button>
              </li>
            ))}
          </ul>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Registrando…" : "Crear grupo"}
        </Button>
      </form>

      {tokens?.leader_token ? (
        <div className="max-w-xl space-y-4 rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-5 shadow-sm">
          <p className="font-semibold text-[#111827]">Guarda estos enlaces (solo se muestran ahora)</p>
          <p className="text-sm text-[#6b7280]">
            Cada persona usa su enlace para evaluaciones y seguimiento. El líder administra entregas.
          </p>
          <div className="rounded border border-[#e5e7eb] bg-[#f9fafb] p-3 text-sm">
            <span className="font-medium text-[#0baba9]">Panel del líder</span>
            <p className="mt-1 break-all font-mono text-xs">
              {(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}/clase/panel/
              {tokens.leader_token}
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            {tokens.member_tokens.map((m) => (
              <li key={m.token} className="rounded border border-[#f3f4f6] p-2">
                <span className="font-medium">{m.name}</span>
                <p className="break-all font-mono text-xs text-[#6b7280]">/clase/panel/{m.token}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
