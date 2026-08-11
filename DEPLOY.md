# استقرار پالتینو (Palettino) — static export

این پروژه به‌صورت **static export** ساخته می‌شود (Next.js `output: "export"`).
یعنی خروجی، فایل‌های استاتیک در پوشه‌ی **`out/`** است و روی **هر هاستی بدون نیاز به Node** اجرا می‌شود.

- دامنه: https://paletteeno.yaldajahanshahi.ir
- ریپو: https://github.com/Yaldaj19/paletteeno
- موتور تولید پالت کاملاً در مرورگر اجرا می‌شود (بدون سرور، بدون AI). آنالیز سایت/AI در نسخه‌ی استاتیک غیرفعال است.

---

## ۱) روی سیستم خودت (build + commit + push)

بعد از هر تغییر:

```
pnpm install
```
```
pnpm build
```
```
git add -A
```
```
git commit -m "update"
```
```
git push origin main
```

> پوشه‌ی `out/` عمداً کامیت می‌شود (در `.gitignore` نیست) تا هاست فقط با `git pull` آن را بگیرد و نیازی به build روی هاست نباشد.

---

## ۲) روی هاست (فقط pull + کپی)

repo داخلِ خودِ docroot ساب‌دامین clone شده (`~/paletteeno.yaldajahanshahi.ir/paletteeno`) و docroot واقعی، پوشه‌ی **والدِ** آن است.

دفعات بعد (به‌روزرسانی):

```
cd ~/paletteeno.yaldajahanshahi.ir/paletteeno
```
```
git pull origin main
```
```
cp -Rf out/. ../
```

> `../` یعنی محتوای `out/` داخلِ docroot واقعی (`~/paletteeno.yaldajahanshahi.ir/`) کپی می‌شود.
> چون asset ها مسیر **نسبی** دارند (`assetPrefix: "."`), build هم روی ریشه و هم روی زیرمسیر درست بارگذاری می‌شود.

---

## نکات
- Vazirmatn از CDN (jsdelivr) لود می‌شود؛ اگر روی هاست فیلتر بود، فونت به Tahoma/Segoe UI برمی‌گردد (بی‌مشکل).
- زبان کاربر در `localStorage` ذخیره می‌شود (fa/en).
- برای بازگرداندن قابلیت AI/آنالیز سایت در آینده، باید به هاستِ Node منتقل شد و API route احیا شود.
