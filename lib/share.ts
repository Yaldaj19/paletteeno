// اشتراک‌گذاریِ پالت از طریق URL — بدون سرور/دیتابیس.
// یک پالت به‌صورت «primary-accent-(d|l)» در پارامترِ ?p= کد می‌شود و از روی همان بازسازی می‌شود.
import type { CorePalette, RenderPalette } from "./colors";

const clean = (s: string) => s.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);

/** یک پالتِ رندرشده → کدِ کوتاهِ اشتراکی. */
export function encodeSharedPalette(p: RenderPalette): string {
  const primary = clean(p.scale["500"]);
  const accent = clean(p.accent);
  return `${primary}-${accent}-${p.dark ? "d" : "l"}`;
}

/** لینکِ کاملِ اشتراک برای یک پالت (در مرورگر اجرا می‌شود). */
export function shareUrlFor(p: RenderPalette): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}?p=${encodeSharedPalette(p)}`;
}

/** کدِ اشتراکی → هسته‌ی پالت برای بازسازی؛ در صورت نامعتبر بودن null. */
export function decodeSharedPalette(code: string): CorePalette | null {
  const parts = (code || "").split("-");
  if (parts.length < 2) return null;
  const primary = "#" + clean(parts[0]);
  const accent = "#" + clean(parts[1]);
  if (primary.length !== 7 || accent.length !== 7) return null;
  const dark = parts[2] === "d";
  return {
    name: { fa: "پالتِ اشتراکی", en: "Shared palette" },
    subtitle: { fa: "از طریق لینک به اشتراک گذاشته شد", en: "Shared via link" },
    strategy: "shared",
    primary,
    accent,
    dark,
  };
}
