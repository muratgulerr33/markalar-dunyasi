import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import path from "path";
import fs from "fs";
import { PassThrough } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  console.log("[zip] enter", { time: Date.now() });
  try {
    const searchParams = request.nextUrl.searchParams;
    const album = searchParams.get("album");
    console.log("[zip] album param:", album);

    if (!album || (album !== "salon" && album !== "yat")) {
      return NextResponse.json(
        { error: "Geçersiz album parametresi" },
        { status: 400 }
      );
    }

    const dirName = album === "salon" ? "salon-foto" : "yat-foto";
    const dir = path.join(process.cwd(), "public", "yeliz-samet", dirName);
    console.log("[zip] dir path:", dir);

    if (!fs.existsSync(dir)) {
      console.log("[zip] dir not exists");
      return NextResponse.json(
        { error: "Albüm klasörü bulunamadı" },
        { status: 404 }
      );
    }

    console.log("[zip] creating archive");
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const pt = new PassThrough({ highWaterMark: 1024 * 1024 });

    archive.on("warning", (w) => {
      console.warn("[zip][warning]", w);
    });

    archive.on("error", (err) => {
      console.error("[zip][archive error]", err);
      pt.destroy(err);
    });

    pt.on("error", (err) => {
      console.error("[zip][stream error]", err);
      try {
        archive.abort();
      } catch {}
    });

    console.log("[zip] piping archive to passThrough");
    archive.pipe(pt);

    console.log("[zip] adding directory to archive");
    archive.directory(dir, false);

    console.log("[zip] calling finalize (no await)");
    archive.finalize();

    const filename = `Yeliz-Samet-${album === "salon" ? "Salon" : "Yat"}.zip`;

    console.log("[zip] creating Response with manual ReadableStream bridge");
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

        pt.on("data", (chunk: Buffer) => {
          if (closed) return;
          try {
            controller.enqueue(chunk);
          } catch {
            // Controller zaten kapalıysa enqueue başarısız olabilir
            closed = true;
          }
        });

        pt.once("end", () => {
          console.log("[zip] stream end");
          safeClose();
        });

        pt.once("close", () => {
          console.log("[zip] stream close");
          safeClose();
        });

        pt.once("error", (err) => {
          console.error("[zip] stream error in webStream", err);
          safeError(err);
        });

        pt.resume(); // kritik: akışı başlat
      },
      cancel() {
        console.log("[zip] stream cancelled");
        try {
          archive.abort();
        } catch {}
        pt.destroy();
      },
    });

    console.log("[zip] Response created, returning ASAP");
    return new Response(webStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[zip] ZIP oluşturma hatası:", error);
    return NextResponse.json(
      { error: "ZIP oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

