import { NextResponse } from "next/server";

const TG_BACKEND_URL = process.env.TG_BACKEND_URL;

if (!TG_BACKEND_URL) {
  throw new Error("TG_BACKEND_URL environment variable is not set");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = Math.max(0, parseInt(searchParams.get("from") ?? "0", 10));
  const to = Math.min(
    from + 1000,
    parseInt(searchParams.get("to") ?? "500", 10)
  );

  try {
    // Fetch from Telegram backend
    const res = await fetch(TG_BACKEND_URL!, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from Telegram backend" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Handle both array response and paginated response
    const allChannels = Array.isArray(data) ? data : (data.channels ?? data.data ?? []);

    // Map Telegram channels to expected format
    const developers = allChannels.map((ch: unknown, index: number) => {
      const channel = ch as Record<string, unknown>;
      return {
        id: channel.id ?? index + 1,
        handle: channel.handle ?? channel.username ?? "",
        name: channel.name ?? channel.title ?? null,
        avatar_url: channel.avatar_url ?? channel.photo_url ?? null,
        bio: channel.bio ?? channel.description ?? null,
        subCount: channel.subCount ?? channel.subscribers ?? channel.member_count ?? 0,
        totalPosts: channel.totalPosts ?? channel.message_count ?? channel.posts ?? 0,
        avgViews: channel.avgViews ?? channel.views ?? channel.avg_view_count ?? 0,
        primary_language: channel.primary_language ?? channel.language ?? null,
        rank: channel.rank ?? index + 1,
        fetched_at: channel.fetched_at ?? new Date().toISOString(),
        created_at: channel.created_at ?? new Date().toISOString(),
        claimed: channel.claimed ?? false,
        fetch_priority: channel.fetch_priority ?? 0,
        claimed_at: channel.claimed_at ?? null,
        district: channel.district ?? null,
        owned_items: channel.owned_items ?? [],
        custom_color: channel.custom_color ?? null,
        billboard_images: channel.billboard_images ?? [],
        // Include legacy fields for backward compatibility
        contributions: channel.subCount ?? channel.subscribers ?? 0,
        public_repos: channel.totalPosts ?? 0,
        total_stars: channel.avgViews ?? 0,
        github_login: channel.handle ?? channel.username ?? "",
      };
    });

    // Apply pagination
    const paginated = developers.slice(from, to);

    return NextResponse.json(
      {
        developers: paginated,
        stats: {
          total_developers: developers.length,
          total_contributions: developers.reduce((sum: number, d: Record<string, number>) => sum + (d.subCount ?? 0), 0),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching from Telegram backend:", error);
    return NextResponse.json(
      { error: "Failed to fetch city data" },
      { status: 500 }
    );
  }
}
