import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // خروجی استاتیک برای استقرار روی هر هاست (بدون نیاز به Node) — پوشه‌ی out/
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // مخفی‌کردن نشانگر Dev Tools نکست (آیکن N در حالت توسعه)
  devIndicators: false,
};

export default nextConfig;
