// موتور رنگ: تبدیل‌ها، کنتراست WCAG، و نرمالایزر که هسته‌ی هر پالت را
// (چه الگوریتمی چه AI) به یک آبجکتِ آماده‌ی رندر با استایل واحد تبدیل می‌کند.

export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

const clamp = (n: number, min = 0, max = 255) => Math.min(max, Math.max(min, n));

export function hexToRgb(hex: string): RGB {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return { r: 22, g: 163, b: 74 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const to = (n: number) => clamp(Math.round(n)).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export const hexToHsl = (hex: string) => rgbToHsl(hexToRgb(hex));
export const hslToHex = (hsl: HSL) => rgbToHex(hslToRgb(hsl));

/** رنگ را با تنظیم مستقیم روشنایی/اشباع در HSL بازتولید می‌کند. */
export function shade(hex: string, l: number, satMul = 1): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ h: hsl.h, s: clamp(hsl.s * satMul, 0, 100), l });
}

export function adjust(hex: string, dL: number, dS = 0): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ h: hsl.h, s: clamp(hsl.s + dS, 0, 100), l: clamp(hsl.l + dL, 0, 100) });
}

// ---- WCAG contrast ----
function channel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
export function contrast(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** بهترین رنگ متن (سفید یا مشکیِ ملایم) روی یک پس‌زمینه. */
export function textOn(bg: string): string {
  return contrast("#FFFFFF", bg) >= contrast("#111111", bg) ? "#FFFFFF" : "#14211B";
}

/** یک نسخه‌ی به‌اندازه‌ی کافی تیره از رنگ که روی سفید کنتراست متن را پاس کند. */
export function readableInk(hex: string, target = 4.5): string {
  const hsl = hexToHsl(hex);
  let l = hsl.l;
  let out = hex;
  for (let i = 0; i < 40 && contrast(out, "#FFFFFF") < target; i++) {
    l = Math.max(8, l - 3);
    out = hslToHex({ h: hsl.h, s: Math.min(hsl.s + 4, 92), l });
  }
  return out;
}

// ---------- انواع پالت ----------
export interface CorePalette {
  name: string;
  subtitle: string;
  strategy: string;
  primary: string; // رنگ اصلی (500)
  accent: string;
  dark?: boolean;
  neutral?: string;
}

export interface RenderPalette {
  id: string;
  name: string;
  subtitle: string;
  strategy: string;
  dark: boolean;
  scale: Record<string, string>; // 50..950
  accent: string;
  hexList: string[];
  render: {
    bannerFrom: string;
    bannerTo: string;
    bannerText: string;
    swatches: { hex: string; label: string; ink: string }[];
    mockBg: string;
    navBorder: string;
    logo: string;
    navActive: string;
    navMuted: string;
    innerBg: string;
    innerBorder: string;
    heading: string;
    body: string;
    link: string;
    btnPrimaryBg: string;
    btnPrimaryText: string;
    btnAccentBg: string;
    btnAccentText: string;
    btnGhostText: string;
    btnGhostBorder: string;
    chipTintBg: string;
    chipTintText: string;
    chipAccentBg: string;
    chipAccentText: string;
  };
}

export function buildScale(primary: string): Record<string, string> {
  return {
    "50": shade(primary, 96, 0.5),
    "100": shade(primary, 92, 0.6),
    "200": shade(primary, 84, 0.7),
    "300": shade(primary, 72, 0.8),
    "400": shade(primary, 60, 0.95),
    "500": primary,
    "600": adjust(primary, -8, 4),
    "700": readableInk(adjust(primary, -16, 6)),
    "800": shade(primary, 24, 1),
    "900": shade(primary, 15, 1),
    "950": shade(primary, 8, 1),
  };
}

/** هسته‌ی پالت → آبجکت کامل و آماده‌ی رندر با استایل واحد. */
export function normalize(core: CorePalette, idx: number): RenderPalette {
  const scale = buildScale(core.primary);
  const dark = !!core.dark;
  const hsl = hexToHsl(core.primary);
  const accent = core.accent;
  const accentText = textOn(accent);

  if (dark) {
    const mockBg = hslToHex({ h: hsl.h, s: 28, l: 7 });
    const innerBg = hslToHex({ h: hsl.h, s: 24, l: 11 });
    const light = shade(core.primary, 74, 0.9); // نسخه‌ی روشن برای متن/لینک روی تیره
    const logo = shade(core.primary, 58, 1);
    return {
      id: `p${idx}`,
      name: core.name,
      subtitle: core.subtitle,
      strategy: core.strategy,
      dark,
      scale,
      accent,
      hexList: [core.primary, mockBg, innerBg, accent, light],
      render: {
        bannerFrom: hslToHex({ h: hsl.h, s: 40, l: 14 }),
        bannerTo: hslToHex({ h: hsl.h, s: 45, l: 6 }),
        bannerText: "#FFFFFF",
        swatches: [
          { hex: core.primary, label: "برند", ink: textOn(core.primary) },
          { hex: mockBg, label: "زمینه", ink: "#cbd5cc" },
          { hex: innerBg, label: "سطح", ink: "#cbd5cc" },
          { hex: accent, label: "اکسنت", ink: accentText },
          { hex: light, label: "روشن", ink: "#0d1a16" },
        ],
        mockBg,
        navBorder: hslToHex({ h: hsl.h, s: 20, l: 20 }),
        logo,
        navActive: light,
        navMuted: "#8fa39a",
        innerBg,
        innerBorder: hslToHex({ h: hsl.h, s: 18, l: 22 }),
        heading: "#eaf3ee",
        body: "#b9c7c0",
        link: light,
        btnPrimaryBg: core.primary,
        btnPrimaryText: textOn(core.primary),
        btnAccentBg: accent,
        btnAccentText: accentText,
        btnGhostText: light,
        btnGhostBorder: light,
        chipTintBg: hslToHex({ h: hsl.h, s: 30, l: 18 }),
        chipTintText: light,
        chipAccentBg: accent,
        chipAccentText: accentText,
      },
    };
  }

  const surface2 = shade(core.primary, 97, 0.35);
  const border = shade(core.primary, 90, 0.45);
  const link = scale["700"];
  const heading = shade(core.primary, 14, 0.8);
  return {
    id: `p${idx}`,
    name: core.name,
    subtitle: core.subtitle,
    strategy: core.strategy,
    dark,
    scale,
    accent,
    hexList: [core.primary, link, accent, heading, surface2],
    render: {
      bannerFrom: core.primary,
      bannerTo: shade(core.primary, 20, 1),
      bannerText: "#FFFFFF",
      swatches: [
        { hex: scale["500"], label: "۵۰۰", ink: textOn(scale["500"]) },
        { hex: scale["700"], label: "۷۰۰", ink: "#fff" },
        { hex: scale["900"], label: "۹۰۰", ink: "#fff" },
        { hex: accent, label: "اکسنت", ink: accentText },
        { hex: surface2, label: "سطح", ink: "#33413a" },
      ],
      mockBg: "#FFFFFF",
      navBorder: border,
      logo: core.primary,
      navActive: link,
      navMuted: "#6b756f",
      innerBg: surface2,
      innerBorder: border,
      heading,
      body: "#4a544e",
      link,
      btnPrimaryBg: core.primary,
      btnPrimaryText: textOn(core.primary),
      btnAccentBg: accent,
      btnAccentText: accentText,
      btnGhostText: core.primary,
      btnGhostBorder: core.primary,
      chipTintBg: scale["100"],
      chipTintText: link,
      chipAccentBg: accent,
      chipAccentText: accentText,
    },
  };
}

export function normalizeAll(cores: CorePalette[], startIndex = 0): RenderPalette[] {
  return cores.map((c, i) => normalize(c, startIndex + i));
}

/** میانگین چند رنگ (میانگین دایره‌ای Hue + میانگین S/L) برای ترکیب پالت‌ها. */
export function blendHex(hexes: string[]): string {
  const list = hexes.filter(Boolean);
  if (!list.length) return "#808080";
  if (list.length === 1) return list[0];
  let x = 0, y = 0, s = 0, l = 0;
  for (const hex of list) {
    const c = hexToHsl(hex);
    const r = (c.h * Math.PI) / 180;
    x += Math.cos(r); y += Math.sin(r); s += c.s; l += c.l;
  }
  const h = ((Math.atan2(y / list.length, x / list.length) * 180) / Math.PI + 360) % 360;
  return hslToHex({ h, s: s / list.length, l: l / list.length });
}
