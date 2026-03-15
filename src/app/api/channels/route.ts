import { NextResponse } from "next/server";

const TG_BACKEND_URL = process.env.TG_BACKEND_URL;

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!TG_BACKEND_URL) {
    return NextResponse.json(
      { error: "TG_BACKEND_URL not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { handle } = body;

    if (!handle) {
      return NextResponse.json(
        { error: "Handle is required" },
        { status: 400 }
      );
    }

    const cleanedHandle = handle.toLowerCase().replace(/^@/, "");
    
    // Get category from query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "news";
    
    console.log("Adding channel:", cleanedHandle, "category:", category);
    
    // Backend expects POST /api/v1/channels/:handle?category=:category
    const res = await fetch(`${TG_BACKEND_URL}/${encodeURIComponent(cleanedHandle)}?category=${encodeURIComponent(category)}`, {
      method: "POST",
      headers: { 
        "Accept": "application/json"
      },
      signal: AbortSignal.timeout(60000), // 60s for real-time scraper
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", res.status, errorText);
      return NextResponse.json(
        { error: errorText || "Failed to add channel" },
        { status: res.status }
      );
    }

    const data = await res.json();
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    console.error("Add channel error:", err);
    const isTimeout = err instanceof DOMException && err.name === "TimeoutError";
    return NextResponse.json(
      {
        error: isTimeout
          ? "Backend timed out. Please try again."
          : "Failed to add channel",
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
