
SENIOR/LEAD DEBUG MODU: Bu projede /yeliz-samet viewer + slider davranışı PROD’da bozuk. Önce kanıt topla, sonra minimal değişiklikle düzelt. Büyük refactor yok.

HEDEF SORUNLAR (3 ana başlık):
A) Viewer’da “geri/kapat” ikonu çalışmıyor: Network/terminalde GET 200 görünüyor ama UI kapanmıyor. Close basınca URL değişiyor gibi ama modal kapanmıyor.
B) Viewer slider: sola kaydırınca görsel sürükleniyor ama sonraki görsele snap/advance etmiyor, aynı görselde kalıyor.
C) next start sırasında image optimizer hataları: “The requested resource isn't a valid image … received null” (örnek: /yeliz-samet/yat-foto/IMG_6579.webp vs.). Bu hatalar slider/viewer akışını da bozuyor olabilir.

ÖNCE KANIT TOPLA (değişiklik yapmadan):
1) PROD MODDA repro:
   - `npm run build && npm run start -- -p 3000`
   - http://localhost:3000/yeliz-samet/salon → bir foto tıkla (viewer aç) → close/geri’ye bas.
   - Slider’ı swipe et (en az 3 kez).
   - Konsol + terminal loglarını not et.

2) Viewer kapanmıyorsa bunun KANITI:
   - Viewer’ın açık/kapalı state’i nereden geliyor? (muhtemelen `useSearchParams()`/`photo` query param)
   - Close handler ne yapıyor? (`history.replaceState` mi `router.replace` mi?)
   - Şu kanıtı üret: Close basınca URL’de `photo` param kalkıyor mu? Buna rağmen React state değişmiyor mu?
   - React state değişmiyorsa sebebi: App Router `useSearchParams()` sadece Next router navigation ile update olur; `window.history.replaceState()` React’ı tetiklemez (popstate de tetiklemez). Bu yüzden UI kapanmıyor olabilir.

3) Slider snap etmiyorsa bunun KANITI:
   - Viewer’da Embla/slider hangi component? (muhtemelen `components/yeliz-samet-photo-viewer.tsx`)
   - Embla API gerçekten init oluyor mu? `emblaApi` null mu?
   - Drag oluyor ama snap yoksa:
     - CSS `touch-action` yanlış olabilir (slider viewport’da `pan-x` verilmişse browser yakalar, Embla snap bozulabilir)
     - `dragFree/skipSnaps` yanlış set edilmiş olabilir
     - Track flex/overflow/translate3d override ediliyor olabilir
   - Kanıt için: embla event log (temporary) ekle:
     - `emblaApi.on("select", ...)` ve `emblaApi.on("pointerUp", ...)` logla
     - `emblaApi.selectedScrollSnap()` ve `emblaApi.scrollProgress()` yazdır
     - Swipeda select tetiklenmiyor mu? tetikleniyor ama snap mı yok? bunu raporla.

4) “invalid image received null” kanıtı:
   - Bu dosyalar gerçekten var mı?
     - `ls -lh public/yeliz-samet/yat-foto/IMG_6579.webp public/yeliz-samet/yat-foto/IMG_6581.webp ...`
   - Varsa dosya gerçekten WEBP mi?
     - `file public/yeliz-samet/yat-foto/IMG_6579.webp`
   - Yoksa veya bozuksa:
     - Bu isimler nereden refer ediliyor? `rg "IMG_6579|IMG_6581|IMG_6578|IMG_6587" -n`
     - Hero list / gallery list içinde yanlış/missing isimler var mı? raporla.
   - Bu bozuk/missing dosyalar Next/Image optimizer’da hata üretip UI thread’e yük bindiriyor olabilir. Önce bunu stabilize et.

SONRA MİNİMAL DÜZELT (kanıt sonrası):
A) Viewer close/back fix (UI kapanmalı):
   - Eğer state `useSearchParams()` ile türetiliyorsa ve `history.replaceState` kullanılıyorsa:
     1) Ya `router.replace()` / `router.push()` kullan (scroll:false) ve viewer state’i gerçekten update olsun
     2) Ya da history ile devam edeceksen React’ı tetiklemek için küçük bir `useSyncExternalStore` ile URL değişimini subscribe et:
        - pushState/replaceState sonrası custom event dispatch et (örn. `window.dispatchEvent(new Event("urlchange"))`)
        - `popstate` + `urlchange` dinle
        - viewer open state’i bu store’dan türet
     - En minimal ve stabil yolu seç; “UI kapanmıyor” tamamen bitmeli.

B) Slider snap fix:
   - Embla viewport/track sınıflarını kontrol et:
     - viewport: `overflow-hidden`, `touch-action: pan-y pinch-zoom` (horizontal swipe JS’de kalsın)
     - track: `display:flex`, `will-change: transform`, `translate3d`
   - Eğer yanlışlıkla `touch-action: pan-x` verilmişse kaldır/düzelt.
   - `dragFree` veya `skipSnaps` varsa ve bu davranışı bozuyorsa kapat.
   - Swipe sonrası `emblaApi.scrollNext()` manual test et; çalışıyorsa issue gesture/config’dedir.

C) Invalid image hatalarını temizle:
   - Missing/bozuk dosya varsa:
     - Ya dosyayı doğru isimle ekle (public altında)
     - Ya da listeden çıkar (hero/galleries)
   - Next/Image hatası “received null” kalmayacak.

D) Son doğrulama:
   - `npm run build && npm run start -- -p 3000`
   - Viewer: open → close UI kapanıyor mu?
   - Swipe: en az 5 swipe, her seferinde snap ve index değişiyor mu?
   - Terminalde “invalid image received null” kalmadı mı?
   - Kısa bir “neden buydu / kanıt” notu yaz.

ÇIKTI FORMAT:
1) Repro adımları + gözlem
2) Kanıt (log/rg/ls/file çıktılarından özet)
3) Uygulanan minimal fix (dosya/line düzeyi)
4) Son test sonuçlarıSENIOR/LEAD DEBUG MODU: Bu projede /yeliz-samet viewer + slider davranışı PROD’da bozuk. Önce kanıt topla, sonra minimal değişiklikle düzelt. Büyük refactor yok.

HEDEF SORUNLAR (3 ana başlık):
A) Viewer’da “geri/kapat” ikonu çalışmıyor: Network/terminalde GET 200 görünüyor ama UI kapanmıyor. Close basınca URL değişiyor gibi ama modal kapanmıyor.
B) Viewer slider: sola kaydırınca görsel sürükleniyor ama sonraki görsele snap/advance etmiyor, aynı görselde kalıyor.
C) next start sırasında image optimizer hataları: “The requested resource isn't a valid image … received null” (örnek: /yeliz-samet/yat-foto/IMG_6579.webp vs.). Bu hatalar slider/viewer akışını da bozuyor olabilir.

ÖNCE KANIT TOPLA (değişiklik yapmadan):
1) PROD MODDA repro:
   - `npm run build && npm run start -- -p 3000`
   - http://localhost:3000/yeliz-samet/salon → bir foto tıkla (viewer aç) → close/geri’ye bas.
   - Slider’ı swipe et (en az 3 kez).
   - Konsol + terminal loglarını not et.

2) Viewer kapanmıyorsa bunun KANITI:
   - Viewer’ın açık/kapalı state’i nereden geliyor? (muhtemelen `useSearchParams()`/`photo` query param)
   - Close handler ne yapıyor? (`history.replaceState` mi `router.replace` mi?)
   - Şu kanıtı üret: Close basınca URL’de `photo` param kalkıyor mu? Buna rağmen React state değişmiyor mu?
   - React state değişmiyorsa sebebi: App Router `useSearchParams()` sadece Next router navigation ile update olur; `window.history.replaceState()` React’ı tetiklemez (popstate de tetiklemez). Bu yüzden UI kapanmıyor olabilir.

3) Slider snap etmiyorsa bunun KANITI:
   - Viewer’da Embla/slider hangi component? (muhtemelen `components/yeliz-samet-photo-viewer.tsx`)
   - Embla API gerçekten init oluyor mu? `emblaApi` null mu?
   - Drag oluyor ama snap yoksa:
     - CSS `touch-action` yanlış olabilir (slider viewport’da `pan-x` verilmişse browser yakalar, Embla snap bozulabilir)
     - `dragFree/skipSnaps` yanlış set edilmiş olabilir
     - Track flex/overflow/translate3d override ediliyor olabilir
   - Kanıt için: embla event log (temporary) ekle:
     - `emblaApi.on("select", ...)` ve `emblaApi.on("pointerUp", ...)` logla
     - `emblaApi.selectedScrollSnap()` ve `emblaApi.scrollProgress()` yazdır
     - Swipeda select tetiklenmiyor mu? tetikleniyor ama snap mı yok? bunu raporla.

4) “invalid image received null” kanıtı:
   - Bu dosyalar gerçekten var mı?
     - `ls -lh public/yeliz-samet/yat-foto/IMG_6579.webp public/yeliz-samet/yat-foto/IMG_6581.webp ...`
   - Varsa dosya gerçekten WEBP mi?
     - `file public/yeliz-samet/yat-foto/IMG_6579.webp`
   - Yoksa veya bozuksa:
     - Bu isimler nereden refer ediliyor? `rg "IMG_6579|IMG_6581|IMG_6578|IMG_6587" -n`
     - Hero list / gallery list içinde yanlış/missing isimler var mı? raporla.
   - Bu bozuk/missing dosyalar Next/Image optimizer’da hata üretip UI thread’e yük bindiriyor olabilir. Önce bunu stabilize et.

SONRA MİNİMAL DÜZELT (kanıt sonrası):
A) Viewer close/back fix (UI kapanmalı):
   - Eğer state `useSearchParams()` ile türetiliyorsa ve `history.replaceState` kullanılıyorsa:
     1) Ya `router.replace()` / `router.push()` kullan (scroll:false) ve viewer state’i gerçekten update olsun
     2) Ya da history ile devam edeceksen React’ı tetiklemek için küçük bir `useSyncExternalStore` ile URL değişimini subscribe et:
        - pushState/replaceState sonrası custom event dispatch et (örn. `window.dispatchEvent(new Event("urlchange"))`)
        - `popstate` + `urlchange` dinle
        - viewer open state’i bu store’dan türet
     - En minimal ve stabil yolu seç; “UI kapanmıyor” tamamen bitmeli.

B) Slider snap fix:
   - Embla viewport/track sınıflarını kontrol et:
     - viewport: `overflow-hidden`, `touch-action: pan-y pinch-zoom` (horizontal swipe JS’de kalsın)
     - track: `display:flex`, `will-change: transform`, `translate3d`
   - Eğer yanlışlıkla `touch-action: pan-x` verilmişse kaldır/düzelt.
   - `dragFree` veya `skipSnaps` varsa ve bu davranışı bozuyorsa kapat.
   - Swipe sonrası `emblaApi.scrollNext()` manual test et; çalışıyorsa issue gesture/config’dedir.

C) Invalid image hatalarını temizle:
   - Missing/bozuk dosya varsa:
     - Ya dosyayı doğru isimle ekle (public altında)
     - Ya da listeden çıkar (hero/galleries)
   - Next/Image hatası “received null” kalmayacak.

D) Son doğrulama:
   - `npm run build && npm run start -- -p 3000`
   - Viewer: open → close UI kapanıyor mu?
   - Swipe: en az 5 swipe, her seferinde snap ve index değişiyor mu?
   - Terminalde “invalid image received null” kalmadı mı?
   - Kısa bir “neden buydu / kanıt” notu yaz.

ÇIKTI FORMAT:
1) Repro adımları + gözlem
2) Kanıt (log/rg/ls/file çıktılarından özet)
3) Uygulanan minimal fix (dosya/line düzeyi)
4) Son test sonuçları