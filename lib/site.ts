// آنالیز سایت: HTML و CSSهای inline را می‌گیرد، رنگ‌های پرتکرار و متادیتا را درمی‌آورد.
import { hexToHsl } from "./colors";

export interface SiteAnalysis {
  ok: boolean;
  url: string;
  title: string;
  description: string;
  colors: string[]; // پرتکرارترین رنگ‌ها (hex)
  error?: string;
}

function normHex(raw: string): string | null {
  let h = raw.replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return null;
  return `#${h.toUpperCase()}`;
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

/** رنگ‌های خیلی روشن/خیلی تیره/بی‌رنگ را کنار می‌گذارد (پس‌زمینه/متن خالص). */
function isBrandy(hex: string): boolean {
  const { s, l } = hexToHsl(hex);
  return s > 12 && l > 12 && l < 92;
}

function extractColors(css: string): string[] {
  const counts = new Map<string, number>();
  const bump = (hex: string) => counts.set(hex, (counts.get(hex) || 0) + 1);

  const hexRe = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  let m: RegExpExecArray | null;
  while ((m = hexRe.exec(css))) {
    const h = normHex(m[0]);
    if (h && isBrandy(h)) bump(h);
  }
  const rgbRe = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/g;
  while ((m = rgbRe.exec(css))) {
    const h = rgbToHex(+m[1], +m[2], +m[3]);
    if (isBrandy(h)) bump(h);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex)
    .slice(0, 12);
}

function meta(html: string, name: string): string {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i");
  return html.match(re)?.[1]?.trim() || "";
}

export async function analyzeSite(rawUrl: string): Promise<SiteAnalysis> {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  const base: SiteAnalysis = { ok: false, url, title: "", description: "", colors: [] };

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 PaletteStudio/1.0", Accept: "text/html,*/*" },
    });
    clearTimeout(t);
    if (!res.ok) return { ...base, error: `HTTP ${res.status}` };

    const html = await res.text();
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || "";
    const description = meta(html, "description") || meta(html, "og:description");

    // CSSهای inline در صفحه
    let css = "";
    const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let sm: RegExpExecArray | null;
    while ((sm = styleRe.exec(html))) css += "\n" + sm[1];
    // رنگ‌های داخل صفت style و theme-color
    css += "\n" + html.replace(/<style[\s\S]*?<\/style>/gi, "");

    // یک فایل CSS خارجی اول را هم می‌گیریم (اختیاری، بهترین‌تلاش)
    const linkHref = html.match(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/i)?.[1];
    if (linkHref) {
      try {
        const cssUrl = new URL(linkHref, url).toString();
        const c2 = new AbortController();
        const t2 = setTimeout(() => c2.abort(), 8000);
        const r2 = await fetch(cssUrl, { signal: c2.signal, headers: { "User-Agent": "Mozilla/5.0" } });
        clearTimeout(t2);
        if (r2.ok) css += "\n" + (await r2.text()).slice(0, 400_000);
      } catch { /* بی‌اهمیت */ }
    }

    const colors = extractColors(css);
    return { ok: true, url, title, description, colors };
  } catch (e) {
    return { ...base, error: e instanceof Error ? e.message : "fetch failed" };
  }
}
