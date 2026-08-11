// موتور گرادینت: از یک رنگ پایه، ۶ گرادینتِ هارمونیک (۳ روشن + ۳ دارک) می‌سازد
// و کدهای آماده‌ی خروجی (CSS / Tailwind / SCSS / استاپ‌ها) را تولید می‌کند. دوزبانه.
import { Localized, hexToHsl, hslToHex, textOn } from "./colors";
import { toBrandTone } from "./dictionary";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export interface GradientDef {
  name: Localized;
  stops: string[]; // ۲ یا ۳ هگز
  dark: boolean;
  ink: string; // رنگِ خوانای متن روی گرادینت
}

/** ۶ گرادینتِ هارمونیک از یک رنگ پایه (۳ روشن + ۳ دارک). */
export function gradientsFrom(baseHex: string): GradientDef[] {
  const base = toBrandTone(baseHex);
  const { h, s, l } = hexToHsl(base);
  const H = (dh: number, ds = 0, dl = 0) =>
    hslToHex({ h: h + dh, s: clamp(s + ds, 20, 92), l: clamp(l + dl, 10, 74) });
  const acc = (dh: number, ss = 64, ll = 52) => hslToHex({ h: h + dh, s: ss, l: ll });

  const mk = (name: Localized, stops: string[], dark: boolean): GradientDef => {
    const mid = stops[Math.floor(stops.length / 2)];
    return { name, stops, dark, ink: textOn(dark ? stops[0] : mid) };
  };

  const lights: GradientDef[] = [
    mk({ fa: "مکمل", en: "Complement" }, [H(0, 0, 6), acc(180)], false),
    mk({ fa: "آنالوگ", en: "Analogous" }, [H(-24, 0, 4), H(24, 0, -2)], false),
    mk({ fa: "مونوکروم روشن", en: "Mono light" }, [H(0, -10, 20), H(0, 6, -6)], false),
  ];
  const darks: GradientDef[] = [
    mk({ fa: "دارک — مکمل", en: "Dark — complement" }, [H(0, 6, -30), acc(180, 60, 30)], true),
    mk({ fa: "مونوکروم دارک", en: "Mono dark" }, [H(0, 4, -18), H(0, 8, -40)], true),
    mk({ fa: "تریادیک", en: "Triadic" }, [H(0, 0, -8), acc(120, 60, 44), acc(240, 60, 40)], true),
  ];
  return [...lights, ...darks];
}

/** استاپ‌ها را با درصدِ یکنواخت به رشته تبدیل می‌کند: «#A 0%, #B 100%». */
function stopsWithStops(stops: string[]): string {
  const n = stops.length;
  return stops.map((c, i) => `${c} ${Math.round((i / (n - 1)) * 100)}%`).join(", ");
}

/** رشته‌ی خامِ linear-gradient با زاویه‌ی دلخواه. */
export function gradientCss(g: GradientDef, angle: number): string {
  return `linear-gradient(${angle}deg, ${stopsWithStops(g.stops)})`;
}

/** کدهای آماده‌ی خروجی برای هر گرادینت. */
export function gradientCodes(g: GradientDef, angle: number) {
  const css = gradientCss(g, angle);
  return {
    css: `background: ${css};`,
    // Tailwind arbitrary value: فاصله‌ها با underscore جایگزین می‌شوند.
    tailwind: `bg-[linear-gradient(${angle}deg,${stopsWithStops(g.stops).replace(/, /g, ",").replace(/ /g, "_")})]`,
    scss: `$gradient: ${css};`,
    stops: g.stops.join(", "),
  };
}
