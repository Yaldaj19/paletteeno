import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paletteeno.yaldajahanshahi.ir"),
  title: "پالتینو | Palettino — سیستم دیزاین اتوماتیک پلت رنگی",
  description: "یک رنگ، اسم یا موضوع بده و شش پالت هماهنگ با رنگ‌های مکمل بگیر — سه روشن و سه دارک، آماده‌ی استفاده. / Generate coordinated color palettes.",
  icons: {
    icon: [{ url: "/favicon-paletteeno.webp", type: "image/webp" }],
    shortcut: ["/favicon-paletteeno.webp"],
    apple: ["/favicon-paletteeno.webp"],
  },
  openGraph: {
    title: "پالتینو | Palettino",
    description: "سیستم دیزاین اتوماتیک پلت رنگی",
    images: ["/logo-paletteeno.webp"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body className="min-h-full bg-[#0D0D1A] font-sans text-white">{children}</body>
    </html>
  );
}
