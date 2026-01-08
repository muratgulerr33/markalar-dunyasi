import { NextRequest, NextResponse } from "next/server";
import { deletedStorage } from "@/lib/yeliz-samet-deleted-storage";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Check if guest delete is enabled
    const guestDeleteEnabled = process.env.GUEST_DELETE_ENABLED === "true";
    
    if (!guestDeleteEnabled) {
      return NextResponse.json(
        { error: "Guest delete is disabled" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { albumSlug, filename } = body;

    // Input validation
    if (!albumSlug || typeof albumSlug !== "string") {
      return NextResponse.json(
        { error: "albumSlug is required" },
        { status: 400 }
      );
    }

    if (albumSlug !== "salon" && albumSlug !== "yat") {
      return NextResponse.json(
        { error: "Invalid albumSlug. Must be 'salon' or 'yat'" },
        { status: 400 }
      );
    }

    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { error: "filename is required" },
        { status: 400 }
      );
    }

    // Security: prevent path traversal
    if (filename.includes("..") || filename.includes("/")) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      );
    }

    // Add to deleted storage
    await deletedStorage.add(albumSlug, filename);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[delete] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
