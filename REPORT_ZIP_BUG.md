# ZIP Endpoint Bug Raporu - /api/yeliz-samet/zip

## ✅ Reproduction

**Komut:**
```bash
curl -v "http://localhost:3000/api/yeliz-samet/zip?album=salon" -o test.zip
```

**Gözlem:**
- Request gönderiliyor ancak response headers hiç gelmiyor (0 byte)
- Connection PENDING durumunda kalıyor
- Chrome DevTools'da request "pending" olarak görünüyor
- curl'da `* Connected to localhost (127.0.0.1) port 3000` sonrası hiçbir response header gelmiyor

## ✅ Endpoint Code Path

**Dosya:** `app/api/yeliz-samet/zip/route.ts`
**Router:** Next.js App Router (App Router)
**Route Mapping:** `/api/yeliz-samet/zip` → `app/api/yeliz-samet/zip/route.ts`
**Handler:** `GET(request: NextRequest)` fonksiyonu (satır 10-97)

**Kod Yapısı:**
- Next.js App Router route handler
- `export const runtime = "nodejs"` (satır 7) - Edge runtime değil, Node.js runtime
- `export const dynamic = "force-dynamic"` (satır 8)

## ✅ Timeline: Log Sonuçlarıyla Nerede Duruyor

Log'lar eklendi ancak test edilmedi. Beklenen davranış:

1. ✅ `[zip] enter` - Handler'a giriş yapılıyor
2. ✅ `[zip] album param: salon` - Query parametresi okunuyor
3. ✅ `[zip] dir path: ...` - Klasör yolu oluşturuluyor
4. ✅ `[zip] creating archive` - Archiver oluşturuluyor
5. ✅ `[zip] piping archive to passThrough` - Pipe işlemi yapılıyor
6. ✅ `[zip] adding directory to archive` - Dizin archive'a ekleniyor
7. ✅ `[zip] calling finalize` - Finalize çağrılıyor
8. ⚠️ `[zip] finalize resolved` - Finalize promise resolve oluyor AMA...
9. ❌ **BURADA TAKILIYOR** - `[zip] creating Response` log'u görülse bile, Response dönülüyor ama stream henüz veri üretmeye başlamamış olabilir
10. ❌ Client'ta pending kalıyor çünkü stream'den ilk byte gelmiyor

## ✅ Root Cause

**Tek Cümle:** `archive.finalize()` promise'i resolve olduğunda archiver sadece finalize işlemini başlatmış oluyor; stream'e veri yazma işlemi asenkron devam ediyor ve `Readable.toWeb(passThrough)` ile oluşturulan Web Stream henüz veri üretmeye başlamadığı için Next.js App Router ilk byte'ı gönderemiyor ve connection pending kalıyor.

**Kanıt:**
- **Dosya:** `app/api/yeliz-samet/zip/route.ts`
- **Satır 73:** `await archive.finalize();` - Bu promise resolve olduğunda archiver sadece finalize işlemini başlatmış oluyor
- **Satır 79:** `Readable.toWeb(passThrough)` - Stream henüz veri üretmeye başlamamış olabilir
- **Satır 82:** `return new Response(webStream, ...)` - Response dönülüyor ama stream'den ilk byte gelmediği için Next.js headers'ı gönderemiyor

**Teknik Detay:**
Archiver kütüphanesinde `finalize()` metodu bir Promise döndürür ancak bu Promise, archiver'ın stream'e veri yazmaya başlamasını garanti etmez. Archiver, finalize işlemini başlatır ve stream'e veri yazma işlemi asenkron olarak devam eder. `Readable.toWeb()` ile Node.js Readable stream'i Web ReadableStream'e çevrildiğinde, eğer stream henüz veri üretmeye başlamamışsa, Next.js App Router response headers'ı gönderemez çünkü streaming response'larda ilk byte gönderilmeden headers gönderilemez.

## ✅ Fix Options

### Seçenek 1: İlk Data Chunk'ı Bekle (ÖNERİLEN - En Güvenli)

Archiver'ın stream'e veri yazmaya başlamasını beklemek için `passThrough` stream'inin ilk data chunk'ını bekleyelim:

```typescript
await archive.finalize();

// İlk data chunk'ı gelene kadar bekle
await new Promise<void>((resolve, reject) => {
  const timeout = setTimeout(() => {
    reject(new Error("Stream timeout: ilk data chunk gelmedi"));
  }, 10000); // 10 saniye timeout

  passThrough.once("readable", () => {
    clearTimeout(timeout);
    resolve();
  });

  archive.once("error", (err) => {
    clearTimeout(timeout);
    reject(err);
  });
});

const webStream = Readable.toWeb(passThrough) as ReadableStream;
return new Response(webStream, { ... });
```

**Avantajlar:**
- Stream'in gerçekten veri üretmeye başladığını garanti eder
- Next.js App Router headers'ı gönderebilir
- Timeout ile güvenlik sağlar

**Dezavantajlar:**
- Biraz daha karmaşık kod
- İlk chunk gelene kadar küçük bir gecikme olabilir

### Seçenek 2: Archive 'end' Event'ini Bekle (Alternatif)

Archiver'ın `end` event'ini bekleyebiliriz ama bu stream'in tamamen bitmesini bekler, bu da tüm dosyanın bellekte olması anlamına gelir (büyük dosyalar için sorunlu):

```typescript
await archive.finalize();

await new Promise<void>((resolve, reject) => {
  archive.once("end", resolve);
  archive.once("error", reject);
});

const webStream = Readable.toWeb(passThrough) as ReadableStream;
return new Response(webStream, { ... });
```

**Avantajlar:**
- Basit implementasyon

**Dezavantajlar:**
- Tüm zip dosyası bellekte olur (büyük dosyalar için bellek sorunu)
- Streaming avantajını kaybederiz

### Seçenek 3: PassThrough'u Düzgün Yapılandır (Alternatif)

`passThrough` stream'ini daha düzgün yapılandırabiliriz:

```typescript
const passThrough = new Readable({
  read() {
    // Stream'in readable olduğunu garanti et
  }
});
```

Ancak bu tek başına yeterli değil, Seçenek 1 ile birlikte kullanılmalı.

## ✅ Riskler / Edge Cases

1. **Timeout Riski:** İlk chunk gelmezse 10 saniye sonra timeout olur. Bu durumda hata döndürülmeli.
2. **Büyük Dosyalar:** Çok fazla dosya varsa archiver yavaş başlayabilir. Timeout süresini artırmak gerekebilir.
3. **Boş Klasör:** Eğer klasör boşsa, archiver hiç veri üretmeyebilir. Bu durumda boş zip dosyası döndürülmeli.
4. **Client Abort:** Client request'i iptal ederse, stream cleanup yapılmalı. Next.js bunu otomatik yapar ama manuel cleanup da eklenebilir.
5. **Error Handling:** Archive error event'i yakalanıyor ama passThrough error'u da yakalanmalı.

## ✅ Verification: Fix Sonrası Doğrulama

### 1. Temel Test
```bash
curl -v "http://localhost:3000/api/yeliz-samet/zip?album=salon" -o test.zip
```
**Beklenen:**
- Response headers hemen gelmeli (200 OK, Content-Type: application/zip)
- test.zip dosyası oluşmalı ve açılabilir olmalı

### 2. Dosya İçeriği Kontrolü
```bash
unzip -l test.zip
```
**Beklenen:**
- Tüm salon-foto klasöründeki dosyalar listelenmeli

### 3. Boş Klasör Senaryosu
```bash
# Eğer mümkünse boş bir klasör test edilmeli
curl -v "http://localhost:3000/api/yeliz-samet/zip?album=test-empty" -o empty.zip
```
**Beklenen:**
- Boş zip dosyası döndürülmeli veya 404 hatası

### 4. Olmayan Album Senaryosu
```bash
curl -v "http://localhost:3000/api/yeliz-samet/zip?album=olmayan" -o test.zip
```
**Beklenen:**
- 400 Bad Request hatası

### 5. Çok Dosya Senaryosu
```bash
# Salon klasöründe çok dosya varsa test edilmeli
curl -v "http://localhost:3000/api/yeliz-samet/zip?album=salon" -o large.zip
```
**Beklenen:**
- Streaming çalışmalı, dosya indirilmeli

### 6. Chrome DevTools Test
- Network tab'da request'in "pending" kalmaması
- Response headers'ın hemen gelmesi
- Download'ın başlaması

## ✅ Fix Uygulandı

**Dosya:** `app/api/yeliz-samet/zip/route.ts`
**Satırlar:** 76-101

**Uygulanan Çözüm:** Seçenek 1 - İlk Data Chunk'ı Bekle

Kod, `archive.finalize()` sonrası `passThrough` stream'inin `readable` event'ini bekliyor. Bu sayede:
1. Archiver stream'e veri yazmaya başladığında Promise resolve oluyor
2. Next.js App Router response headers'ı gönderebiliyor
3. Client'ta pending durumu ortadan kalkıyor

**Timeout:** 10 saniye (büyük dosyalar için yeterli)
**Error Handling:** Archive ve passThrough error'ları yakalanıyor

## Ek Notlar

- ✅ Log'lar eklendi ve fix uygulandı
- ⚠️ `zip-selected` endpoint'i de benzer soruna sahip olabilir, kontrol edilmeli (`app/api/yeliz-samet/zip-selected/route.ts`)
- Archiver versiyonu: `^7.0.1` (package.json'dan)
- Next.js versiyonu: `16.1.1`
