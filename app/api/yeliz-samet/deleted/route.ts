import { NextRequest, NextResponse } from "next/server";
import { deletedStorage } from "@/lib/yeliz-samet-deleted-storage";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const albumSlug = searchParams.get("albumSlug");

    if (!albumSlug || (albumSlug !== "salon" && albumSlug !== "yat")) {
      return NextResponse.json(
        { error: "Invalid albumSlug. Must be 'salon' or 'yat'" },
        { status: 400 }
      );
    }

    // Get deleted list from storage
    const deleted = await deletedStorage.get(albumSlug);

    return NextResponse.json({ deleted });
  } catch (error) {
    console.error("[deleted] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
