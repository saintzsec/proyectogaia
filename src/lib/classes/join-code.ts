export const JOIN_CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const CHARSET = JOIN_CODE_CHARSET;

function randomChar() {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)]!;
}

/** Formato XXX-XXX-XXX (sin O/I/0/1 para reducir confusiones). */
export function generateJoinCodeCandidate(): string {
  const part = (n: number) =>
    Array.from({ length: n }, () => randomChar()).join("");
  return `${part(3)}-${part(3)}-${part(3)}`;
}

export function normalizeJoinCodeInput(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/\s/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

/** Solo caracteres válidos en un tramo de 3 (mismo alfabeto que los códigos generados). */
export function sanitizeJoinCodeSegment(raw: string): string {
  const upper = raw.toUpperCase();
  let out = "";
  for (const c of upper) {
    if (CHARSET.includes(c)) out += c;
    if (out.length >= 3) break;
  }
  return out;
}
