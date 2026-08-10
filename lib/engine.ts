// موتور تولید سمت‌کلاینت (برای نسخه‌ی static export).
// همان منطق الگوریتمی است؛ بدون AI و بدون آنالیز سایت (که به سرور نیاز دارند).
import { CorePalette, normalizeAll, RenderPalette } from "./colors";
import { algorithmicPalettes, generateFromInput, variationsFrom, combineFrom, topicPalettes, suggestionCores, coerceLightDark } from "./generate";
import { parseColorInput } from "./dictionary";
import type { Lang } from "./i18n";

/** اسلایدر پیشنهادی: از N رنگ پایه، ۲N پالت (هرکدام روشن+دارک). */
export function weeklySuggestions(bases: string[], lang: Lang): RenderPalette[] {
  return normalizeAll(suggestionCores(bases, lang));
}

export interface GenParams {
  colorInput?: string;
  description?: string;
  mode?: "fresh" | "variations" | "combine" | "topic";
  seeds?: { primary: string; accent: string }[];
  topicColors?: string[];
  startIndex?: number;
}

export function localGenerate(p: GenParams, lang: Lang): { engine: string; palettes: RenderPalette[] } {
  const mode = p.mode || "fresh";
  let cores: CorePalette[] = [];

  if (mode === "variations" && p.seeds?.length) {
    cores = variationsFrom(p.seeds[0].primary, p.seeds[0].accent, lang);
  } else if (mode === "topic") {
    cores = topicPalettes(p.topicColors || [], lang);
  } else if (mode === "combine" && (p.seeds?.length || 0) >= 2) {
    cores = combineFrom(p.seeds!, lang);
  } else {
    const ci = (p.colorInput || "").trim();
    if (ci) cores = generateFromInput(ci, lang);
    else { const g = parseColorInput(p.description || ""); cores = algorithmicPalettes(g.base, { luxe: g.luxe }, lang); }
  }

  return { engine: "algorithmic", palettes: normalizeAll(coerceLightDark(cores), p.startIndex || 0) };
}
