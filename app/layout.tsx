import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paletteeno.yaldajahanshahi.ir"),
  title: "پالتینو | Palettino — سیستم دیزاین اتوماتیک پلت رنگی",
  description:
    "پالتینو: سیستم دیزاین اتوماتیک پلت رنگی. یک رنگ، اسم یا موضوع بده و شش پالت هماهنگ با رنگ‌های مکمل بگیر — سه روشن و سه دارک، آماده‌ی استفاده. دوزبانه فارسی/انگلیسی.",
  keywords: ["پلت رنگی", "پالت رنگ", "طراحی رنگ", "رنگ مکمل", "color palette", "palette generator", "design system", "پالتینو", "Palettino"],
  alternates: { canonical: "https://paletteeno.yaldajahanshahi.ir" },
  openGraph: {
    type: "website",
    title: "پالتینو | Palettino — سیستم دیزاین اتوماتیک پلت رنگی",
    description: "یک رنگ، اسم یا موضوع بده و شش پالت هماهنگ (سه روشن، سه دارک) بگیر.",
    url: "https://paletteeno.yaldajahanshahi.ir",
    siteName: "Palettino",
    images: ["/logo-paletteeno.webp"],
  },
  twitter: { card: "summary_large_image", title: "پالتینو | Palettino", description: "سیستم دیزاین اتوماتیک پلت رنگی", images: ["/logo-paletteeno.webp"] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Palettino",
  alternateName: "پالتینو",
  url: "https://paletteeno.yaldajahanshahi.ir",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  inLanguage: ["fa", "en"],
  description: "سیستم دیزاین اتوماتیک پلت رنگی — تولید پالت‌های هماهنگ با رنگ‌های مکمل، روشن و دارک.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "YJ19", url: "https://yaldajahanshahi.ir" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" data-theme="dark" className="h-full antialiased">
      <head>
        {/* فاویکونِ مسیرِ نسبی تا هم روی دامنه‌ی ریشه و هم روی زیرمسیر (XAMPP) نمایش داده شود */}
        <link rel="icon" type="image/webp" href="./favicon-paletteeno.webp" />
        <link rel="shortcut icon" type="image/webp" href="./favicon-paletteeno.webp" />
        <link rel="apple-touch-icon" href="./favicon-paletteeno.webp" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" />
        {/* فونتِ نمایشیِ سرتیترها (هنری‌تر) */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/gandom-font@v0.8/dist/font-face.css" />
        {/* فونتِ برند و عنوان بخش‌ها */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lalezar&display=swap" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
