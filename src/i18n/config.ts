/** Base i18n: MVP en español; preparado para añadir `en` sin reestructurar rutas. */
export const defaultLocale = "es" as const;
export const locales = ["es", "en"] as const;
export type AppLocale = (typeof locales)[number];
