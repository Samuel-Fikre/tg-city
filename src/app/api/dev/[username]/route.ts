import { NextResponse } from "next/server";

const TG_BACKEND_URL = process.env.TG_BACKEND_URL;

// Allow up to 60s on Vercel (Pro plan). Hobby plan max is 10s.
export const maxDuration = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const handle = username.toLowerCase().replace(/^@/, "");

  if (!TG_BACKEND_URL) {
    return NextResponse.json(
      { error: "TG_BACKEND_URL not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch channel from Telegram backend
    const channelUrl = `${TG_BACKEND_URL}/${encodeURIComponent(handle)}`;
    console.log("Fetching channel:", channelUrl);
    const res = await fetch(channelUrl, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(30000),
    });

    // If individual endpoint returns 404, try fetching all and filtering locally
    if (res.status === 404) {
      console.log("Individual endpoint 404, trying fallback to fetch all channels...");
      try {
        const allRes = await fetch(TG_BACKEND_URL!, {
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(30000),
        });
        
        if (allRes.ok) {
          const allChannels = await allRes.json();
          const channels = Array.isArray(allChannels) ? allChannels : (allChannels.channels ?? allChannels.data ?? []);
          
          // Case-insensitive search
          const found = channels.find((c: { handle?: string; username?: string }) => 
            (c.handle?.toLowerCase() === handle || c.username?.toLowerCase() === handle)
          );
          
          if (found) {
            console.log("Found channel in fallback:", found.handle || found.username);
            const channel = found;
            // Map and return (will continue to mapping below)
            const mapped = {
              id: channel.id ?? 0,
              handle: channel.handle ?? channel.username ?? handle,
              name: channel.name ?? channel.title ?? null,
              avatar_url: channel.avatar_url ?? channel.photo_url ?? null,
              bio: channel.bio ?? channel.description ?? null,
              subCount: channel.subCount ?? channel.subscribers ?? channel.member_count ?? 0,
              totalPosts: channel.totalPosts ?? channel.message_count ?? channel.posts ?? 0,
              avgViews: channel.avgViews ?? channel.views ?? channel.avg_view_count ?? 0,
              primary_language: channel.primary_language ?? channel.language ?? null,
              rank: channel.rank ?? null,
              fetched_at: channel.fetched_at ?? new Date().toISOString(),
              created_at: channel.created_at ?? new Date().toISOString(),
              claimed: channel.claimed ?? false,
              fetch_priority: channel.fetch_priority ?? 0,
              claimed_at: channel.claimed_at ?? null,
              district: channel.district ?? null,
              owned_items: channel.owned_items ?? [],
              custom_color: channel.custom_color ?? null,
              billboard_images: channel.billboard_images ?? [],
              // Legacy fields for compatibility
              contributions: channel.subCount ?? channel.subscribers ?? 0,
              public_repos: channel.totalPosts ?? 0,
              total_stars: channel.avgViews ?? 0,
              github_login: channel.handle ?? channel.username ?? handle,
              exists: true,
            };
            return NextResponse.json(mapped, {
              headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
              },
            });
          }
        }
      } catch (fallbackErr) {
        console.error("Fallback fetch failed:", fallbackErr);
      }
      
      return NextResponse.json(
        { 
          error: "Channel not found in TG City database yet!",
          exists: false 
        },
        { status: 404 }
      );
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", res.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch from Telegram backend" },
        { status: res.status }
      );
    }

    const channel = await res.json();

    // Map to ChannelRecord format
    const mapped = {
      id: channel.id ?? 0,
      handle: channel.handle ?? channel.username ?? handle,
      name: channel.name ?? channel.title ?? null,
      avatar_url: channel.avatar_url ?? channel.photo_url ?? null,
      bio: channel.bio ?? channel.description ?? null,
      subCount: channel.subCount ?? channel.subscribers ?? channel.member_count ?? 0,
      totalPosts: channel.totalPosts ?? channel.message_count ?? channel.posts ?? 0,
      avgViews: channel.avgViews ?? channel.views ?? channel.avg_view_count ?? 0,
      primary_language: channel.primary_language ?? channel.language ?? null,
      rank: channel.rank ?? null,
      fetched_at: channel.fetched_at ?? new Date().toISOString(),
      created_at: channel.created_at ?? new Date().toISOString(),
      claimed: channel.claimed ?? false,
      fetch_priority: channel.fetch_priority ?? 0,
      claimed_at: channel.claimed_at ?? null,
      district: channel.district ?? null,
      owned_items: channel.owned_items ?? [],
      custom_color: channel.custom_color ?? null,
      billboard_images: channel.billboard_images ?? [],
      // Legacy fields for compatibility
      contributions: channel.subCount ?? channel.subscribers ?? 0,
      public_repos: channel.totalPosts ?? 0,
      total_stars: channel.avgViews ?? 0,
      github_login: channel.handle ?? channel.username ?? handle,
      exists: true,
    };

    return NextResponse.json(mapped, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    console.error("Dev route error:", err);
    const isTimeout = err instanceof DOMException && err.name === "TimeoutError";
    return NextResponse.json(
      {
        error: isTimeout
          ? "Backend timed out. Please try again."
          : "Failed to fetch channel data",
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
