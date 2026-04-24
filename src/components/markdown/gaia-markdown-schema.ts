import type { Schema } from "hast-util-sanitize";
import { defaultSchema } from "hast-util-sanitize";

/**
 * Sanitizado estricto: solo se añade a `span` el atributo `data-gaia` con valores de paleta.
 * HTML arbitrario en Markdown sigue pasando por el esquema base (estilo GitHub).
 */
export const gaiaMarkdownSanitizeSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [
      ["dataGaia", /^(primary|secondary|tertiary|quaternary)$/],
    ],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      ["dataAlign", /^(left|center|right)$/],
      ["dataSize", /^(small|medium|large)$/],
    ],
  },
};
