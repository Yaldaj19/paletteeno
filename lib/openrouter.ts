// لایه‌ی AI: با OpenRouter ۶ پالت هوشمند بر اساس اسم رنگ + توضیحات + رنگ‌های سایت می‌سازد.
import { CorePalette, hexToHsl, hslToHex } from "./colors";
import type { Lang } from "./i18n";

export interface AiInput {
  colorInput: string;
  description: string;
  site?: { title: string; description: string; colors: string[] } | null;
  baseHex?: string | null; // رنگ پایه‌ی حل‌شده از اسم رنگ (برای قفل خانواده)
  enforceHue?: boolean; // اگر true، Hueِ همه‌ی primaryها به baseHex قفل می‌شود
  mode?: "fresh" | "variations" | "combine";
  seeds?: { primary: string; accent: string }[]; // پالت‌های پایه برای بازآفرینی/ترکیب
  lang?: Lang;
}

const SYSTEM = `تو یک متخصص برندینگ و تئوری رنگ هستی. دقیقاً ۶ پالت رنگی حرفه‌ای و متنوع می‌سازی.
هر پالت یک رنگ اصلی (primary) و یک رنگ اکسنت مکمل دارد. حس درخواست‌شده (لوکس، صنعتی، مدرن و ...) را رعایت کن.
خروجی را فقط و فقط به صورت JSON معتبر بده، بدون توضیح اضافه، دقیقاً با این شکل:
{"palettes":[{"name":"نام کوتاه فارسی","subtitle":"توضیح یک‌خطی فارسی","primary":"#RRGGBB","accent":"#RRGGBB","dark":false}]}
قوانین مهم:
- اگر کاربر رنگ یا خانواده‌ی رنگی مشخصی گفت (مثلاً «سبز»)، رنگ اصلی (primary) همه‌ی ۶ پالت باید از همان خانواده‌ی رنگی باشد. تنوع را فقط در شید/تیرگی/اشباعِ همان رنگ و در انتخابِ رنگ اکسنت ایجاد کن — هرگز پایه را به رنگ دیگری تغییر نده.
- primary باید تُن میانی تا عمیق باشد تا برای برند مناسب باشد (نه خیلی روشن).
- دقیقاً ۳ پالت روشن (dark:false) و ۳ پالت دارک (dark:true) بده — نه بیشتر نه کمتر.
- اکسنت هر پالت باید حتماً رنگِ **مکملِ** primary باشد (تقریباً ۱۸۰ درجه روبه‌روی آن روی چرخ رنگ) یا اسپلیت-مکمل — تا کنتراست و هارمونی واقعی داشته باشد. رنگ‌ها را هگز شش‌رقمی بده.`;

function buildUser(input: AiInput): string {
  const mode = input.mode || "fresh";
  const lines: string[] = [];

  if (mode === "variations" && input.seeds?.length) {
    const s = input.seeds[0];
    lines.push(`پالت پایه برای بازآفرینی: primary=${s.primary} ، accent=${s.accent}.`);
    lines.push("۶ واریاسیونِ نزدیک به همین پالت بساز که حال‌وهوایش حفظ شود ولی متنوع باشند.");
  } else if (mode === "combine" && input.seeds?.length) {
    lines.push("این پالت‌ها را در هم ترکیب کن و ۶ پالتِ ترکیبیِ هماهنگ بساز:");
    input.seeds.forEach((s, i) => lines.push(`  پالت ${i + 1}: primary=${s.primary} ، accent=${s.accent}`));
  } else {
    lines.push(`رنگ یا اسم موردنظر کاربر: ${input.colorInput || "(مشخص نشده)"}`);
  }

  if (input.baseHex && input.enforceHue) {
    const h = Math.round(hexToHsl(input.baseHex).h);
    lines.push(`رنگ پایه‌ی تقریبی: ${input.baseHex} (Hue≈${h}). همه‌ی primaryها باید در همین خانواده‌ی رنگی و Hue نزدیک به ${h} (حداکثر ±20 درجه) باشند.`);
  }
  if (input.description) lines.push(`توضیحات و حال‌وهوای برند: ${input.description}`);
  if (input.site) {
    lines.push(`سایت مرجع: ${input.site.title || ""} — ${input.site.description || ""}`);
    if (input.site.colors?.length) lines.push(`رنگ‌های استخراج‌شده از سایت مرجع: ${input.site.colors.join(", ")}`);
    lines.push("از حال‌وهوا و رنگ‌های این سایت الهام بگیر ولی کپی نکن.");
  }
  if (input.lang === "en") lines.push("Write all palette `name` and `subtitle` fields in ENGLISH.");
  else lines.push("نام (name) و توضیح (subtitle) هر پالت را به فارسی بنویس.");
  lines.push("حالا دقیقاً ۶ پالت (۳ روشن + ۳ دارک) بساز.");
  return lines.join("\n");
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no json");
  return JSON.parse(text.slice(start, end + 1));
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Hueِ رنگ را به خانواده‌ی پایه قفل می‌کند و روشنایی/اشباع AI را نگه می‌دارد. */
function lockHue(hex: string, baseHue: number): string {
  const c = hexToHsl(hex);
  return hslToHex({ h: baseHue, s: Math.max(c.s, 30), l: c.l });
}

async function callOnce(key: string, model: string, input: AiInput): Promise<CorePalette[] | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 22000);
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Title": "Palette Studio",
      },
      body: JSON.stringify({
        model,
        temperature: 0.85,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: buildUser(input) },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    if (!content) return null;

    const parsed = extractJson(content) as { palettes?: unknown };
    const arr = Array.isArray(parsed.palettes) ? parsed.palettes : [];
    const baseHue = input.enforceHue && input.baseHex ? hexToHsl(input.baseHex).h : null;

    const cores: CorePalette[] = [];
    for (const p of arr) {
      const o = p as Record<string, unknown>;
      let primary = String(o.primary || "");
      const accent = String(o.accent || "");
      if (!HEX.test(primary) || !HEX.test(accent)) continue;
      if (baseHue !== null) primary = lockHue(primary, baseHue); // قفل خانواده‌ی رنگی
      cores.push({
        name: String(o.name || "پالت"),
        subtitle: String(o.subtitle || ""),
        strategy: "ai",
        primary: primary.toUpperCase(),
        accent: accent.toUpperCase(),
        dark: o.dark === true,
      });
    }
    return cores.length >= 4 ? cores.slice(0, 6) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function aiPalettes(input: AiInput): Promise<CorePalette[] | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  // دو تلاش برای پایداری در برابر خطاهای گذرا
  for (let attempt = 0; attempt < 2; attempt++) {
    const out = await callOnce(key, model, input);
    if (out) return out;
  }
  return null;
}
