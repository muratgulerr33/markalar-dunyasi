import { NextRequest, NextResponse } from "next/server";
import { deletedStorage } from "@/lib/yeliz-samet-deleted-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { albumSlug, filename, filenames } = body;

    // Input validation
    if (!albumSlug || typeof albumSlug !== "string") {
      return NextResponse.json(
        { error: "albumSlug is required" },
        { 
          status: 400,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    if (albumSlug !== "salon" && albumSlug !== "yat") {
      return NextResponse.json(
        { error: "Invalid albumSlug. Must be 'salon' or 'yat'" },
        { 
          status: 400,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    // Support both single and bulk delete
    if (filenames && Array.isArray(filenames)) {
      // Validate all filenames
      for (const fn of filenames) {
        if (typeof fn !== "string") {
          return NextResponse.json(
            { error: "All filenames must be strings" },
            { 
              status: 400,
              headers: {
                "Cache-Control": "no-store, max-age=0",
              },
            }
          );
        }
        // Security: prevent path traversal
        if (fn.includes("..") || fn.includes("/")) {
          return NextResponse.json(
            { error: "Invalid filename" },
            { 
              status: 400,
              headers: {
                "Cache-Control": "no-store, max-age=0",
              },
            }
          );
        }
      }
      // Bulk delete
      await deletedStorage.addMany(albumSlug, filenames);
    } else if (filename && typeof filename === "string") {
      // Security: prevent path traversal
      if (filename.includes("..") || filename.includes("/")) {
        return NextResponse.json(
          { error: "Invalid filename" },
          { 
            status: 400,
            headers: {
              "Cache-Control": "no-store, max-age=0",
            },
          }
        );
      }
      // Single delete
      await deletedStorage.add(albumSlug, filename);
    } else {
      return NextResponse.json(
        { error: "filename or filenames is required" },
        { 
          status: 400,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[delete] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
