import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { GaiaMarkdownImage } from "@/components/markdown/gaia-markdown-image";
import { gaiaMarkdownSanitizeSchema } from "@/components/markdown/gaia-markdown-schema";
import { cn } from "@/lib/utils";

const gaiaMarkdownComponents: Components = {
  img: ({ src, alt, title, width, height, node }) => {
    const props = (node?.properties ?? {}) as Record<string, unknown>;
    const alignRaw = String(props.dataAlign ?? "center");
    const sizeRaw = String(props.dataSize ?? "medium");
    const align = ["left", "center", "right"].includes(alignRaw) ? (alignRaw as "left" | "center" | "right") : "center";
    const size = ["small", "medium", "large"].includes(sizeRaw) ? (sizeRaw as "small" | "medium" | "large") : "medium";
    return (
      <GaiaMarkdownImage src={src} alt={alt} title={title} width={width} height={height} align={align} size={size} />
    );
  },
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="gaia-markdown-link-button"
    >
      {children}
    </a>
  ),
};

type Props = {
  /** Contenido Markdown (admin / semilla). */
  children: string;
  className?: string;
  /** Tarjetas y resúmenes: tipografía y márgenes más contenidos. */
  compact?: boolean;
};

/**
 * Renderiza Markdown con estilos GAIA.
 *
 * **Colores de paleta**
 * - Encabezados `##` `###` `####` usan tonos de marca automáticamente.
 * - Texto inline: `<span data-gaia="primary">palabra</span>` (también `secondary`, `tertiary`, `quaternary`).
 *
 * El Markdown estándar no define colores; solo esos `data-gaia` están permitidos en HTML incrustado.
 *
 * **Imágenes**
 * - `![alt](url "pie opcional")`: lazy-load, responsive (`max-width: 100%` del contenedor).
 * - Si el HTML incluye `width`, el ancho visual queda acotado a `min(100%, width px)` (referencia tipo bloque, útil en escritorio; en móvil sigue el ancho de pantalla).
 */
export function GaiaMarkdown({ children, className = "", compact = false }: Props) {
  const trimmed = children.trim();
  if (!trimmed) return null;

  return (
    <div className={cn("gaia-markdown max-w-none", compact && "gaia-markdown--compact", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, gaiaMarkdownSanitizeSchema]]}
        components={gaiaMarkdownComponents}
      >
        {trimmed}
      </ReactMarkdown>
    </div>
  );
}
