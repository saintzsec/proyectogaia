import { Mark, mergeAttributes } from "@tiptap/core";

export type GaiaVariant = "primary" | "secondary" | "tertiary" | "quaternary";

const ALLOWED = new Set<GaiaVariant>(["primary", "secondary", "tertiary", "quaternary"]);

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    gaiaHighlight: {
      setGaiaHighlight: (variant: GaiaVariant) => ReturnType;
      toggleGaiaHighlight: (variant: GaiaVariant) => ReturnType;
      unsetGaiaHighlight: () => ReturnType;
    };
  }
}

export const GaiaHighlight = Mark.create({
  name: "gaiaHighlight",

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      variant: {
        default: "primary",
        parseHTML: (element) => {
          const v = element.getAttribute("data-gaia");
          return v && ALLOWED.has(v as GaiaVariant) ? v : "primary";
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-gaia]",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const v = el.getAttribute("data-gaia") as GaiaVariant | null;
          if (!v || !ALLOWED.has(v)) return false;
          return { variant: v };
        },
      },
    ];
  },

  renderHTML({ mark, HTMLAttributes }) {
    const raw = mark.attrs.variant as GaiaVariant | undefined;
    const v = raw && ALLOWED.has(raw) ? raw : "primary";
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { "data-gaia": v }),
      0,
    ];
  },

  addCommands() {
    return {
      setGaiaHighlight:
        (variant: GaiaVariant) =>
        ({ commands }) =>
          ALLOWED.has(variant) ? commands.setMark(this.name, { variant }) : false,
      toggleGaiaHighlight:
        (variant: GaiaVariant) =>
        ({ commands }) =>
          ALLOWED.has(variant) ? commands.toggleMark(this.name, { variant }) : false,
      unsetGaiaHighlight:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});
