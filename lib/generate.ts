// موتور الگوریتمی: از یک رنگ پایه ۶ پالت (۳ روشن + ۳ دارک) با اکسنتِ مکمل می‌سازد،
// و توابع بازآفرینی (variations) و ترکیب (combine) را فراهم می‌کند. دوزبانه (fa/en).
import { CorePalette, blendHex, hexToHsl, hslToHex } from "./colors";
import { parseColorInput, toBrandTone } from "./dictionary";
import type { Lang } from "./i18n";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function accentFromHue(h: number, s = 64, l = 52): string {
  return hslToHex({ h: ((h % 360) + 360) % 360, s, l });
}
function core(name: string, subtitle: string, strategy: string, primary: string, accent: string, dark: boolean): CorePalette {
  return { name, subtitle, strategy, primary, accent, dark };
}

export interface GenerateOptions {
  luxe?: boolean;
}

/** ۶ پالت (۳ روشن + ۳ دارک) با اکسنتِ مکمل، از یک رنگ پایه. */
export function algorithmicPalettes(baseHex: string, opts: GenerateOptions = {}, lang: Lang = "fa"): CorePalette[] {
  const t = (fa: string, en: string) => (lang === "en" ? en : fa);
  const base = toBrandTone(baseHex);
  const { h, s } = hexToHsl(base);
  const baseL = hexToHsl(base).l;
  const vary = (dL: number, dS = 0) => hslToHex({ h, s: clamp(s + dS, 20, 92), l: clamp(baseL + dL, 24, 68) });

  const lights: CorePalette[] = [
    core(t("مکملِ کلاسیک", "Classic complement"), t("رنگ اصلی + رنگ مکملِ روبه‌رو روی چرخ رنگ", "Base + its opposite complementary color"), "complement", vary(2), accentFromHue(h + 180), false),
    core(t("مکملِ گرم", "Warm complement"), t("مکملِ کمی گرم‌تر — زنده و متعادل", "A warmer complement — lively and balanced"), "complement-warm", vary(-2, 4), accentFromHue(h + 200, 68, 54), false),
    core(t("اسپلیت-مکمل", "Split-complement"), t("دو رنگ کنار مکمل — هارمونیِ نرم", "Colors beside the complement — soft harmony"), "split", vary(4, -3), accentFromHue(h + 150, 60, 50), false),
  ];
  const darks: CorePalette[] = [
    core(t("دارک — مکمل", "Dark — complement"), t("زمینه‌ی تیره + برند روشن + مکمل", "Dark surface + bright brand + complement"), "dark-complement", hslToHex({ h, s: clamp(s, 30, 74), l: 46 }), accentFromHue(h + 180, 66, 56), true),
    core(t("دارک — اسپلیت", "Dark — split"), t("کنتراستِ کنترل‌شده روی تیره", "Controlled contrast on dark"), "dark-split", hslToHex({ h, s: clamp(s + 4, 30, 78), l: 44 }), accentFromHue(h + 210, 64, 56), true),
    core(t("دارک — تریادیک", "Dark — triadic"), t("تعادلِ سه‌گانه، پرانرژی", "Triadic balance, energetic"), "dark-triadic", hslToHex({ h, s: clamp(s + 6, 30, 80), l: 48 }), accentFromHue(h + 120, 62, 54), true),
  ];

  const list = [...lights, ...darks];
  if (opts.luxe) {
    for (const p of list) {
      const a = hexToHsl(p.accent);
      p.accent = hslToHex({ h: a.h, s: Math.max(32, a.s - 12), l: a.l });
    }
  }
  return list;
}

/** بازآفرینی: از یک پالتِ موجود ۶ واریاسیون نزدیک (۳ روشن + ۳ دارک) با مکمل. */
export function variationsFrom(primary: string, accent: string, lang: Lang = "fa"): CorePalette[] {
  const t = (fa: string, en: string) => (lang === "en" ? en : fa);
  const base = toBrandTone(primary);
  const { h, s, l } = hexToHsl(base);
  const v = (dL: number, dS = 0) => hslToHex({ h, s: clamp(s + dS, 20, 92), l: clamp(l + dL, 24, 70) });
  const comp = accentFromHue(h + 180);
  const compWarm = accentFromHue(h + 200, 68, 54);

  return [
    core(t("بازآفرینی روشن ۱", "Light variation 1"), t("همان حال‌وهوا با اکسنتِ اصلی", "Same mood with the original accent"), "var", v(3, -2), accent, false),
    core(t("بازآفرینی روشن ۲", "Light variation 2"), t("روشن‌تر + مکملِ روبه‌رو", "Lighter + opposite complement"), "var", v(11, -12), comp, false),
    core(t("بازآفرینی روشن ۳", "Light variation 3"), t("عمیق‌تر + مکملِ گرم", "Deeper + warm complement"), "var", v(-6, 6), compWarm, false),
    core(t("بازآفرینی دارک ۱", "Dark variation 1"), t("دارک با همان اکسنت", "Dark with the same accent"), "var", v(-4, 4), accent, true),
    core(t("بازآفرینی دارک ۲", "Dark variation 2"), t("دارک + مکمل روشن", "Dark + bright complement"), "var", v(-2, 2), accentFromHue(h + 180, 66, 56), true),
    core(t("بازآفرینی دارک ۳", "Dark variation 3"), t("دارکِ پرکنتراست + اسپلیت", "High-contrast dark + split"), "var", v(0, 8), accentFromHue(h + 210, 64, 56), true),
  ];
}

/** ترکیب: چند پالت را می‌آمیزد و ۶ پالتِ ترکیبی (۳ روشن + ۳ دارک) با مکمل می‌سازد. */
export function combineFrom(seeds: { primary: string; accent: string }[], lang: Lang = "fa"): CorePalette[] {
  const t = (fa: string, en: string) => (lang === "en" ? en : fa);
  const primaries = seeds.map((s) => s.primary).filter(Boolean);
  const accents = seeds.map((s) => s.accent).filter(Boolean);
  const bp = blendHex(primaries);
  const ba = blendHex(accents);
  const base = toBrandTone(bp);
  const { h, s, l } = hexToHsl(base);
  const v = (dL: number, dS = 0) => hslToHex({ h, s: clamp(s + dS, 20, 92), l: clamp(l + dL, 24, 70) });
  const a1 = accents[0] || ba;
  const a2 = accents[1] || accentFromHue(h + 180);

  return [
    core(t("ترکیب روشن ۱", "Blend light 1"), t("میانگینِ رنگ‌ها + مکمل", "Average of colors + complement"), "combine", v(3, -2), accentFromHue(h + 180), false),
    core(t("ترکیب روشن ۲", "Blend light 2"), t("با اکسنتِ پالت اول", "With the first palette’s accent"), "combine", v(8, -8), a1, false),
    core(t("ترکیب روشن ۳", "Blend light 3"), t("با اکسنتِ پالت دوم", "With the second palette’s accent"), "combine", v(-5, 4), a2, false),
    core(t("ترکیب دارک ۱", "Blend dark 1"), t("دارک + مکملِ ترکیب", "Dark + blended complement"), "combine", v(-3, 4), accentFromHue(h + 180, 66, 56), true),
    core(t("ترکیب دارک ۲", "Blend dark 2"), t("دارک + اکسنت اول", "Dark + first accent"), "combine", v(-1, 2), a1, true),
    core(t("ترکیب دارک ۳", "Blend dark 3"), t("دارک + اسپلیت-مکمل", "Dark + split-complement"), "combine", v(1, 6), accentFromHue(h + 210, 64, 56), true),
  ];
}

/** پیشنهاد خودکار: از چند رنگِ متناسب با موضوع، ۶ پالت (۳ روشن + ۳ دارک) با رنگ‌های متفاوت.
 *  هر بار فراخوانی، با jitterِ تصادفیِ Hue/روشنایی، خروجی متفاوتی می‌دهد (تکرار شبیه قبلی نشود). */
export function topicPalettes(bases: string[], lang: Lang = "fa"): CorePalette[] {
  const t = (fa: string, en: string) => (lang === "en" ? en : fa);
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const src = (bases.length ? bases : ["#4F46E5"]).slice(0, 3);
  while (src.length < 3) src.push(src[src.length % src.length]);
  // ترتیب تصادفی تا اسلات‌ها هر بار جابه‌جا شوند
  const order = src.map((c, i) => i).sort(() => Math.random() - 0.5);

  const out: CorePalette[] = [];
  order.forEach((idx, i) => {
    const b = hexToHsl(toBrandTone(src[idx]));
    const h = b.h + rnd(-14, 14);
    const base = hslToHex({ h, s: clamp(b.s + rnd(-8, 8), 45, 90), l: clamp(b.l + rnd(-5, 6), 34, 58) });
    out.push(core(t(`پیشنهاد روشن ${i + 1}`, `Suggestion light ${i + 1}`), t("رنگِ متناسب با موضوع + مکمل", "Topic-fit color + complement"), "topic", base, accentFromHue(h + 180 + rnd(-12, 12)), false));
  });
  order.forEach((idx, i) => {
    const b = hexToHsl(toBrandTone(src[idx]));
    const h = b.h + rnd(-14, 14);
    const dark = hslToHex({ h, s: clamp(b.s + rnd(-6, 8), 34, 78), l: clamp(rnd(42, 50), 40, 52) });
    out.push(core(t(`پیشنهاد دارک ${i + 1}`, `Suggestion dark ${i + 1}`), t("نسخه‌ی دارکِ متناسب با موضوع + مکمل", "Dark topic-fit version + complement"), "topic", dark, accentFromHue(h + 180 + rnd(-12, 12), 66, 56), true));
  });
  return out;
}

/** برای اسلایدر پیشنهادی: از هر رنگ پایه، یک پالت روشن و یک دارک با اکسنت مکمل. */
export function suggestionCores(bases: string[], lang: Lang = "fa"): CorePalette[] {
  const t = (fa: string, en: string) => (lang === "en" ? en : fa);
  const out: CorePalette[] = [];
  for (const raw of bases) {
    const b = hexToHsl(toBrandTone(raw));
    const light = hslToHex({ h: b.h, s: clamp(b.s, 46, 90), l: clamp(b.l, 40, 56) });
    const dark = hslToHex({ h: b.h, s: clamp(b.s, 32, 78), l: 45 });
    out.push(core(t("پالت روشن", "Light palette"), t("پیشنهادی و آماده", "Ready-made suggestion"), "suggest", light, accentFromHue(b.h + 180), false));
    out.push(core(t("پالت دارک", "Dark palette"), t("پیشنهادی و آماده", "Ready-made suggestion"), "suggest", dark, accentFromHue(b.h + 180, 66, 56), true));
  }
  return out;
}

/** تضمین دقیقاً ۳ روشن + ۳ دارک از هر لیستی. */
export function coerceLightDark(cores: CorePalette[]): CorePalette[] {
  const lights = cores.filter((c) => !c.dark);
  const darks = cores.filter((c) => c.dark);
  const outL = lights.slice(0, 3);
  const outD = darks.slice(0, 3);
  const leftover = [...lights.slice(3), ...darks.slice(3)];
  while (outL.length < 3 && leftover.length) outL.push({ ...leftover.shift()!, dark: false });
  while (outD.length < 3 && leftover.length) outD.push({ ...leftover.shift()!, dark: true });
  while (outL.length < 3 && outD.length) { const c = outD[outL.length % outD.length]; outL.push({ ...c, dark: false }); }
  while (outD.length < 3 && outL.length) { const c = outL[outD.length % outL.length]; outD.push({ ...c, dark: true }); }
  return [...outL, ...outD];
}

/** نقطه‌ی ورود الگوریتمیِ حالت fresh از ورودی خام (اسم رنگ یا hex). */
export function generateFromInput(colorInput: string, lang: Lang = "fa"): CorePalette[] {
  const parsed = parseColorInput(colorInput);
  return algorithmicPalettes(parsed.base, { luxe: parsed.luxe }, lang);
}
