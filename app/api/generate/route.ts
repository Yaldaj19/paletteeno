import { NextRequest } from "next/server";
import { CorePalette, normalizeAll } from "@/lib/colors";
import {
  algorithmicPalettes,
  generateFromInput,
  variationsFrom,
  combineFrom,
  topicPalettes,
  coerceLightDark,
} from "@/lib/generate";
import { parseColorInput } from "@/lib/dictionary";
import { aiPalettes } from "@/lib/openrouter";
import { analyzeSite, SiteAnalysis } from "@/lib/site";
import type { Lang } from "@/lib/i18n";

export const runtime = "nodejs";

type Mode = "fresh" | "variations" | "combine" | "topic";
interface Seed { primary: string; accent: string }
interface Body {
  colorInput?: string;
  description?: string;
  url?: string;
  urls?: string[];
  mode?: Mode;
  seeds?: Seed[];
  topicColors?: string[];
  startIndex?: number; // برای شماره‌گذاری سراسری کارت‌ها
  lang?: Lang;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  const colorInput = (body.colorInput || "").trim();
  const description = (body.description || "").trim();
  const urls = [...(body.urls || []), ...(body.url ? [body.url] : [])]
    .map((u) => (u || "").trim())
    .filter(Boolean)
    .slice(0, 3);
  const mode: Mode = body.mode || "fresh";
  const seeds = (body.seeds || []).filter((s) => s && s.primary);
  const startIndex = Number.isFinite(body.startIndex) ? Number(body.startIndex) : 0;
  const lang: Lang = body.lang === "en" ? "en" : "fa";
  const note_fallback = lang === "en" ? "AI unavailable; algorithmic engine was used." : "کلید OpenRouter تنظیم نشده یا در دسترس نبود؛ از موتور الگوریتمی استفاده شد.";
  const note_var = lang === "en" ? "AI unavailable; algorithmic regeneration was used." : "AI در دسترس نبود؛ بازآفرینی الگوریتمی انجام شد.";
  const note_combine = lang === "en" ? "AI unavailable; algorithmic combination was used." : "AI در دسترس نبود؛ ترکیب الگوریتمی انجام شد.";

  const hasKey = Boolean(process.env.OPENROUTER_API_KEY);
  let engine: "ai" | "algorithmic" = "algorithmic";
  let note = "";
  let site: SiteAnalysis | null = null;
  let cores: CorePalette[] | null = null;

  // ---------- حالت بازآفرینی ----------
  if (mode === "variations") {
    if (!seeds.length) return Response.json({ error: lang === "en" ? "Select a palette to regenerate." : "برای بازآفرینی، یک پالت انتخاب کن." }, { status: 400 });
    const seed = seeds[0];
    if (hasKey && description) {
      const ai = await aiPalettes({
        colorInput, description, mode: "variations", seeds: [seed],
        baseHex: seed.primary, enforceHue: true, lang,
      });
      if (ai) { cores = ai; engine = "ai"; }
    }
    if (!cores) { cores = variationsFrom(seed.primary, seed.accent, lang); if (hasKey && description) note = note_var; }
  }

  // ---------- حالت پیشنهاد خودکار بر اساس موضوع ----------
  else if (mode === "topic") {
    const topicColors = (body.topicColors || []).filter(Boolean);
    if (!topicColors.length) return Response.json({ error: lang === "en" ? "Choose at least one topic for auto-suggest." : "برای پیشنهاد خودکار، حداقل یک موضوع انتخاب کن." }, { status: 400 });
    cores = topicPalettes(topicColors, lang);
  }

  // ---------- حالت ترکیب ----------
  else if (mode === "combine") {
    if (seeds.length < 2) return Response.json({ error: lang === "en" ? "Select at least two palettes to combine." : "برای ترکیب، حداقل دو پالت انتخاب کن." }, { status: 400 });
    if (hasKey && description) {
      const ai = await aiPalettes({ colorInput, description, mode: "combine", seeds, lang });
      if (ai) { cores = ai; engine = "ai"; }
    }
    if (!cores) { cores = combineFrom(seeds, lang); if (hasKey && description) note = note_combine; }
  }

  // ---------- حالت تازه ----------
  else {
    if (!colorInput && !description && !urls.length) {
      return Response.json({ error: lang === "en" ? "Enter at least a color, description or site URL." : "حداقل یک رنگ، توضیح یا آدرس سایت لازم است." }, { status: 400 });
    }
    if (urls.length) {
      const analyzed = await Promise.all(urls.map((u) => analyzeSite(u)));
      const okOnes = analyzed.filter((a) => a.ok);
      const mergedColors = [...new Set(okOnes.flatMap((a) => a.colors))].slice(0, 12);
      const first = okOnes[0] || analyzed[0];
      site = { ok: okOnes.length > 0, url: urls.join(" , "), title: first?.title || "", description: first?.description || "", colors: mergedColors, error: okOnes.length ? undefined : analyzed[0]?.error };
    }

    const wantsAi = Boolean(description || (site && site.ok));
    if (wantsAi && hasKey) {
      const parsedColor = colorInput ? parseColorInput(colorInput) : null;
      const enforceHue = Boolean(parsedColor && parsedColor.matched);
      const ai = await aiPalettes({
        colorInput, description,
        site: site && site.ok ? { title: site.title, description: site.description, colors: site.colors } : null,
        baseHex: enforceHue ? parsedColor!.base : null,
        enforceHue, lang,
      });
      if (ai) { cores = ai; engine = "ai"; }
    }

    if (!cores) {
      if (colorInput) cores = generateFromInput(colorInput, lang);
      else if (site && site.ok && site.colors.length) cores = algorithmicPalettes(site.colors[0], {}, lang);
      else { const g = parseColorInput(description); cores = algorithmicPalettes(g.base, { luxe: g.luxe }, lang); }
      if (wantsAi && hasKey) note = note_fallback;
    }
  }

  const palettes = normalizeAll(coerceLightDark(cores || []), startIndex);

  return Response.json({
    engine,
    note,
    mode,
    site: site ? { ok: site.ok, title: site.title, colors: site.colors, error: site.error } : null,
    palettes,
  });
}
