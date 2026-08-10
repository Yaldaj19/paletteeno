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

بارِ اول (clone):

```
git clone https://github.com/Yaldaj19/paletteeno.git paletteeno-src
```

دفعات بعد (به‌روزرسانی):

```
cd ~/paletteeno-src
```
```
git pull origin main
```
```
cp -Rf out/. ~/paletteeno.yaldajahanshahi.ir/
```

> مسیر مقصد را با **document root واقعیِ ساب‌دامین** جایگزین کن (معمولاً `~/paletteeno.yaldajahanshahi.ir/` یا داخل `public_html/paletteeno/`).
> اگر می‌خواهی repo مستقیماً داخل docroot باشد، به‌جای کپی، docroot را روی همان مسیرِ `out/` تنظیم کن.

---

## نکات
- Vazirmatn از CDN (jsdelivr) لود می‌شود؛ اگر روی هاست فیلتر بود، فونت به Tahoma/Segoe UI برمی‌گردد (بی‌مشکل).
- زبان کاربر در `localStorage` ذخیره می‌شود (fa/en).
- برای بازگرداندن قابلیت AI/آنالیز سایت در آینده، باید به هاستِ Node منتقل شد و API route احیا شود.
