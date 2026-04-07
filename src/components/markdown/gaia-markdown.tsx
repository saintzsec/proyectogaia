import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { GaiaMarkdownImage } from "@/components/markdown/gaia-markdown-image";
import { gaiaMarkdownSanitizeSchema } from "@/components/markdown/gaia-markdown-schema";
import { cn } from "@/lib/utils";

const gaiaMarkdownComponents: Components = {
  img: ({ src, alt, title, width, height }) => (
    <GaiaMarkdownImage src={src} alt={alt} title={title} width={width} height={height} />
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
