import { NextRequest, NextResponse } from "next/server";
import { deletedStorage } from "@/lib/yeliz-samet-deleted-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Deleted photos from commit be2e6a4
const DELETED_SALON = [
  "IMG-20260107-WA0062.webp",
  "IMG-20260107-WA0067.webp",
  "IMG-20260107-WA0068.webp",
  "IMG-20260107-WA0070.webp",
  "IMG-20260107-WA0072.webp",
  "IMG-20260107-WA0073.webp",
  "IMG-20260107-WA0081.webp",
  "IMG-20260107-WA0082.webp",
  "IMG-20260107-WA0083.webp",
  "IMG-20260107-WA0085.webp",
  "IMG-20260107-WA0087.webp",
  "IMG-20260107-WA0089.webp",
  "IMG-20260107-WA0091.webp",
  "IMG-20260107-WA0096.webp",
  "IMG-20260107-WA0099.webp",
  "IMG-20260107-WA0100.webp",
  "IMG-20260107-WA0102.webp",
  "IMG-20260107-WA0104.webp",
  "IMG-20260107-WA0105.webp",
  "IMG-20260107-WA0107.webp",
  "IMG-20260107-WA0116.webp",
  "IMG-20260107-WA0117.webp",
  "IMG-20260107-WA0118.webp",
  "IMG-20260107-WA0121.webp",
  "IMG-20260107-WA0137.webp",
  "IMG-20260107-WA0139.webp",
  "IMG-20260107-WA0146.webp",
  "IMG-20260107-WA0165.webp",
  "IMG-20260107-WA0176.webp",
  "IMG-20260107-WA0200.webp",
  "IMG-20260107-WA0207.webp",
  "IMG-20260107-WA0226.webp",
  "IMG-20260107-WA0230.webp",
  "IMG-20260107-WA0233.webp",
  "IMG-20260107-WA0234.webp",
  "IMG-20260107-WA0235.webp",
  "IMG-20260107-WA0237.webp",
];

const DELETED_YAT = [
  "IMG_6534-2.webp",
  "IMG_6534.webp",
  "IMG_6535.webp",
  "IMG_6539.webp",
  "IMG_6540.webp",
  "IMG_6544.webp",
  "IMG_6589.webp",
  "IMG_6592.webp",
  "IMG_6595.webp",
  "IMG_6596.webp",
  "IMG_6599.webp",
  "IMG_6603.webp",
  "IMG_6604.webp",
  "IMG_6617 kopya.webp",
  "IMG_6625.webp",
  "IMG_6626.webp",
  "IMG_6638 kopya.webp",
  "IMG_6639 kopya.webp",
  "IMG_6642 kopya.webp",
  "IMG_6644 kopya.webp",
  "IMG_6645 kopya.webp",
  "IMG_6647 kopya.webp",
  "IMG_6647-2 kopya.webp",
  "IMG_6647.webp",
  "IMG_6651.webp",
  "IMG_6674.webp",
  "IMG_6684.webp",
  "IMG_6685.webp",
  "IMG_6686.webp",
  "IMG_6690.webp",
  "IMG_6692.webp",
  "IMG_6698.webp",
  "IMG_6700.webp",
  "IMG_6701.webp",
];

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - you can add a secret token if needed
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.MIGRATION_TOKEN || "migration-secret-2025";
    
    // Allow both "Bearer token" and just "token" format
    const providedToken = authHeader?.replace("Bearer ", "") || authHeader;
    
    if (providedToken !== expectedToken) {
      return NextResponse.json(
        { error: "Unauthorized", details: "Invalid token" },
        { 
          status: 401,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    console.log("[migrate-deleted] Starting migration...");

    // Check Redis connection first
    const redisUrl = process.env.KV_REDIS_URL || process.env.REDIS_URL || process.env.VERCEL_REDIS_URL;
    if (!redisUrl) {
      return NextResponse.json(
        { error: "Redis URL not configured", details: "Set KV_REDIS_URL, REDIS_URL, or VERCEL_REDIS_URL" },
        { 
          status: 500,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    try {
      // Test connection by getting current deleted list
      const testSalon = await deletedStorage.get("salon");
      const testYat = await deletedStorage.get("yat");
      console.log(`[migrate-deleted] Redis connection OK. Current: salon=${testSalon.length}, yat=${testYat.length}`);
    } catch (error: any) {
      console.error("[migrate-deleted] Redis connection test failed:", error);
      return NextResponse.json(
        { 
          error: "Redis connection failed", 
          details: error.message || String(error),
          hint: "Check Redis URL format and authentication. URL should be: redis://username:password@host:port"
        },
        { 
          status: 500,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    // Add salon photos
    if (DELETED_SALON.length > 0) {
      try {
        await deletedStorage.addMany("salon", DELETED_SALON);
        console.log(`[migrate-deleted] Added ${DELETED_SALON.length} salon photos`);
      } catch (error: any) {
        console.error("[migrate-deleted] Failed to add salon photos:", error);
        throw new Error(`Failed to add salon photos: ${error.message}`);
      }
    }

    // Add yat photos
    if (DELETED_YAT.length > 0) {
      try {
        await deletedStorage.addMany("yat", DELETED_YAT);
        console.log(`[migrate-deleted] Added ${DELETED_YAT.length} yat photos`);
      } catch (error: any) {
        console.error("[migrate-deleted] Failed to add yat photos:", error);
        throw new Error(`Failed to add yat photos: ${error.message}`);
      }
    }

    // Verify
    const deletedSalon = await deletedStorage.get("salon");
    const deletedYat = await deletedStorage.get("yat");

    return NextResponse.json(
      {
        success: true,
        salon: {
          added: DELETED_SALON.length,
          verified: deletedSalon.length,
        },
        yat: {
          added: DELETED_YAT.length,
          verified: deletedYat.length,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[migrate-deleted] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { 
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
