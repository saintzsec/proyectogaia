import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0baba9",
};

export const metadata: Metadata = {
  title: {
    default: "GAIA — Ciencia y sostenibilidad en el aula",
    template: "%s · GAIA",
  },
  description:
    "Plataforma educativa abierta: kits científicos, PBL y herramientas para docentes. Proyecto piloto: filtro biológico de agua.",
  icons: {
    icon: "/brand/gaia-tab-icon.png",
    shortcut: "/brand/gaia-tab-icon.png",
    apple: "/brand/gaia-tab-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('gaia-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <a
          href="#main-content"
          className="absolute left-[-10000px] top-0 z-[100] rounded-md bg-[#0baba9] px-4 py-2 text-sm text-white focus:left-4 focus:top-4 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#0baba9]"
        >
          Ir al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
