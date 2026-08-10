// پارس ورودی کاربر: اسم رنگ فارسی/انگلیسی یا کد hex → رنگ پایه + نشانه‌ها (لوکس/تیره/روشن)
import { adjust, hexToHsl, hslToHex } from "./colors";

type Entry = { hex: string; words: string[] };

// خانواده‌های رنگ — تمرکز روی طیف سبز چون کاربرد اصلی همین است
const COLORS: Entry[] = [
  { hex: "#16A34A", words: ["سبز", "green"] },
  { hex: "#059669", words: ["زمرد", "زمردی", "emerald"] },
  { hex: "#0F766E", words: ["نفتی", "پترول", "تیل", "سبزابی", "سبز ابی", "petrol", "teal"] },
  { hex: "#14B8A6", words: ["فیروزه", "فیروزه ای", "فیروزهای", "turquoise", "teal light"] },
  { hex: "#3B6B3A", words: ["خزه", "خزه ای", "سدری", "moss", "sage dark"] },
  { hex: "#6B7A2E", words: ["زیتونی", "زیتون", "لجنی", "olive"] },
  { hex: "#0B4A34", words: ["بطری", "جنگلی", "bottle", "forest"] },
  { hex: "#00A86B", words: ["یشمی", "یشم", "jade"] },
  { hex: "#84CC16", words: ["مغز پسته", "پسته ای", "lime", "chartreuse"] },
  { hex: "#5B7A6B", words: ["مریمی", "سیج", "sage"] },
  { hex: "#2563EB", words: ["ابی", "آبی", "blue"] },
  { hex: "#1E3A8A", words: ["سرمه", "سرمه ای", "لاجورد", "navy"] },
  { hex: "#38BDF8", words: ["ابی روشن", "اسمانی", "sky"] },
  { hex: "#DC2626", words: ["قرمز", "اتشی", "red"] },
  { hex: "#EA580C", words: ["نارنجی", "orange"] },
  { hex: "#EAB308", words: ["زرد", "yellow"] },
  { hex: "#C6A15B", words: ["طلایی", "طلا", "gold"] },
  { hex: "#B06A3C", words: ["مسی", "مس", "copper", "terracotta"] },
  { hex: "#7C3AED", words: ["بنفش", "purple", "violet"] },
  { hex: "#A78BFA", words: ["یاسی", "بنفش روشن", "lavender"] },
  { hex: "#EC4899", words: ["صورتی", "گلبهی", "pink"] },
  { hex: "#92400E", words: ["قهوه", "قهوه ای", "brown"] },
  { hex: "#D8C7A0", words: ["کرم", "beige", "cream"] },
  { hex: "#6B7280", words: ["خاکستری", "طوسی", "gray", "grey"] },
  { hex: "#374151", words: ["زغالی", "ذغالی", "charcoal"] },
  { hex: "#111827", words: ["مشکی", "سیاه", "black"] },
  // رنگ‌های مدرن و ترند
  { hex: "#A47864", words: ["موکا", "موکا موس", "mocha"] },
  { hex: "#FB7185", words: ["کورال", "مرجانی", "coral"] },
  { hex: "#FDBA74", words: ["هلویی", "پیچ", "peach"] },
  { hex: "#34D399", words: ["نعنایی", "مینت", "mint"] },
  { hex: "#06B6D4", words: ["سایان", "cyan"] },
  { hex: "#6366F1", words: ["ایندیگو", "نیلی", "indigo"] },
  { hex: "#CA8A04", words: ["خردلی", "خردل", "mustard"] },
  { hex: "#E11D48", words: ["روبی", "یاقوتی", "ruby", "raspberry"] },
];

export interface ParsedInput {
  base: string;
  matched: boolean;
  luxe: boolean;
  forceDark: boolean;
  colorLabel: string;
}

const norm = (s: string) =>
  s.toLowerCase()
    .replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ")
    .replace(/[أإآ]/g, "ا").replace(/\s+/g, " ").trim();

const HEX_RE = /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;

export function parseColorInput(raw: string): ParsedInput {
  const text = norm(raw || "");
  const result: ParsedInput = { base: "#16A34A", matched: false, luxe: false, forceDark: false, colorLabel: "سبز" };
  if (!text) return result;

  // کد hex مستقیم
  if (HEX_RE.test(text)) {
    const hex = text.startsWith("#") ? text : `#${text}`;
    return { base: hex.toUpperCase(), matched: true, luxe: false, forceDark: false, colorLabel: hex.toUpperCase() };
  }

  // پیدا کردن خانواده رنگ (طولانی‌ترین تطبیق مقدم است)
  let best: Entry | null = null;
  let bestWord = "";
  for (const e of COLORS) {
    for (const w of e.words) {
      const nw = norm(w);
      if (text.includes(nw) && nw.length > bestWord.length) { best = e; bestWord = nw; }
    }
  }
  if (best) { result.base = best.hex; result.matched = true; result.colorLabel = bestWord; }

  // نشانه‌ها / تعدیل‌کننده‌ها
  const has = (arr: string[]) => arr.some((w) => text.includes(w));
  if (has(["لوکس", "لاکچری", "شیک", "فاخر", "luxury", "luxe", "premium"])) result.luxe = true;
  if (has(["دارک", "تیره", "شب", "dark", "night"])) result.forceDark = true;

  let dL = 0, dS = 0;
  if (has(["روشن", "لایت", "light", "پاستل", "pastel"])) { dL += 12; dS -= 10; }
  if (has(["پررنگ", "تیره تر", "غلیظ", "deep", "پررنگ تر"])) { dL -= 10; dS += 6; }
  if (has(["کم رنگ", "ملایم", "مات", "muted", "soft"])) { dS -= 22; dL += 4; }
  if (result.luxe) { dS -= 8; dL -= 4; } // لوکس = عمیق‌تر و کمی مات‌تر

  if (dL || dS) {
    const h = hexToHsl(result.base);
    result.base = hslToHex({ h: h.h, s: Math.min(95, Math.max(6, h.s + dS)), l: Math.min(92, Math.max(8, h.l + dL)) });
  }
  return result;
}

// نرمال‌سازی مقدار روشنایی رنگ پایه به یک تُنِ میانیِ مناسب برند (نه خیلی روشن/تیره)
export function toBrandTone(hex: string): string {
  const h = hexToHsl(hex);
  const l = Math.min(58, Math.max(30, h.l));
  const s = Math.min(90, Math.max(35, h.s));
  return hslToHex({ h: h.h, s, l });
}

export { adjust };
