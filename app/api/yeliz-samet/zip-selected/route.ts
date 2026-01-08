import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import path from "path";
import fs from "fs";
import { PassThrough } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { album, files } = body;

    if (!album || (album !== "salon" && album !== "yat")) {
      return NextResponse.json(
        { error: "Geçersiz album parametresi" },
        { status: 400 }
      );
    }

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "Dosya listesi gerekli" },
        { status: 400 }
      );
    }

    const dirName = album === "salon" ? "salon-foto" : "yat-foto";
    const baseDir = path.join(process.cwd(), "public", "yeliz-samet");
    const albumDir = path.join(baseDir, dirName);

    if (!fs.existsSync(albumDir)) {
      return NextResponse.json(
        { error: "Albüm klasörü bulunamadı" },
        { status: 404 }
      );
    }

    // Güvenlik kontrolü: sadece ilgili albüm prefix'ini kabul et
    const allowedPrefix = `${dirName}/`;
    const validFiles: string[] = [];

    for (const file of files) {
      if (typeof file !== "string") continue;
      // Path traversal koruması
      if (file.includes("..")) continue;
      // Sadece .webp dosyaları
      if (!file.endsWith(".webp")) continue;
      
      // Dosya adı formatını kontrol et: "salon-foto/IMG-xxx.webp" veya sadece "IMG-xxx.webp"
      let filePath: string;
      if (file.startsWith(allowedPrefix)) {
        // Tam path formatında gelmiş
        filePath = file;
      } else {
        // Sadece dosya adı gelmiş, prefix ekle
        filePath = `${allowedPrefix}${file}`;
      }
      
      // Sadece ilgili albüm prefix'i kontrolü
      if (!filePath.startsWith(allowedPrefix)) continue;

      const fullPath = path.join(baseDir, filePath);
      // Normalize path ve baseDir kontrolü
      const normalizedPath = path.normalize(fullPath);
      if (!normalizedPath.startsWith(path.normalize(baseDir))) continue;

      if (fs.existsSync(normalizedPath)) {
        validFiles.push(filePath);
      }
    }

    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: "Geçerli dosya bulunamadı" },
        { status: 400 }
      );
    }

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const passThrough = new PassThrough({ highWaterMark: 1024 * 1024 });

    archive.on("warning", (w) => {
      console.warn("[zip-selected][warning]", w);
    });

    archive.on("error", (err) => {
      console.error("[zip-selected][archive error]", err);
      passThrough.destroy(err);
    });

    passThrough.on("error", (err) => {
      console.error("[zip-selected][stream error]", err);
      try {
        archive.abort();
      } catch {}
    });

    archive.pipe(passThrough);

    // Her dosyayı tek tek ekle
    for (const file of validFiles) {
      const fullPath = path.join(baseDir, file);
      const fileName = path.basename(file);
      archive.file(fullPath, { name: fileName });
    }

    console.log("[zip-selected] calling finalize");
    await archive.finalize();

    // İlk data chunk'ı gelene kadar bekle (REPORT_ZIP_BUG.md'deki Seçenek 1)
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

      passThrough.once("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    console.log("[zip-selected] first chunk received, creating Response");
    const filename = `yeliz-samet-${album}-secili.zip`;

    // ReadableStream bridge ile safe close
    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        let closed = false;

        const safeClose = () => {
          if (closed) return;
          closed = true;
          try {
            controller.close();
          } catch {}
        };

        const safeError = (err: Error) => {
          if (closed) return;
          closed = true;
          try {
            controller.error(err);
          } catch {}
        };

        passThrough.on("data", (chunk: Buffer) => {
          if (closed) return;
          try {
            controller.enqueue(chunk);
          } catch (err) {
            // Controller zaten kapalıysa enqueue başarısız olabilir
            closed = true;
          }
        });

        passThrough.once("end", () => {
          console.log("[zip-selected] stream end");
          safeClose();
        });

        passThrough.once("close", () => {
          console.log("[zip-selected] stream close");
          safeClose();
        });

        passThrough.once("error", (err) => {
          console.error("[zip-selected] stream error in webStream", err);
          safeError(err);
        });

        passThrough.resume(); // kritik: akışı başlat
      },
      cancel() {
        console.log("[zip-selected] stream cancelled");
        try {
          archive.abort();
        } catch {}
        passThrough.destroy();
      },
    });

    return new Response(webStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("ZIP oluşturma hatası:", error);
    return NextResponse.json(
      { error: "ZIP oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

