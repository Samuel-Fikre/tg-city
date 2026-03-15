import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const ACCENT = "#c8e64a";

export const revalidate = 300; // ISR: regenerate every 5 min

export const metadata: Metadata = {
  title: "Leaderboard - TG City",
  description:
    "Top Telegram channels in Ethiopia ranked by subscribers and engagement in TG City.",
};

interface Channel {
  handle: string;
  name: string | null;
  avatar_url: string | null;
  subCount: number;
  avgViews: number;
  totalPosts: number;
  category: string | null;
  rank: number | null;
}

type TabId = "channels" | "categories";

const TABS: { id: TabId; label: string }[] = [
  { id: "channels", label: "Channels" },
  { id: "categories", label: "Categories" },
];

function rankColor(rank: number): string {
  if (rank === 1) return "#ffd700";
  if (rank === 2) return "#c0c0c0";
  if (rank === 3) return "#cd7f32";
  return ACCENT;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab = (params.tab ?? "channels") as TabId;

  // Fetch channels from the API
  let channels: Channel[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/city?from=0&to=100`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      channels = (data.developers ?? []).map((d: Record<string, unknown>) => ({
        handle: d.handle ?? d.github_login ?? "",
        name: d.name ?? null,
        avatar_url: d.avatar_url ?? null,
        subCount: d.subCount ?? d.contributions ?? 0,
        avgViews: d.avgViews ?? d.total_stars ?? 0,
        totalPosts: d.totalPosts ?? d.public_repos ?? 0,
        category: d.category ?? d.primary_language ?? null,
        rank: d.rank ?? null,
      })).filter((c: Channel) => c.handle) as Channel[];
    }
  } catch {
    // Fallback to empty array if fetch fails
    channels = [];
  }

  // Sort by subscriber count descending
  channels.sort((a, b) => b.subCount - a.subCount);

  // Group by category for the Categories tab
  const categoryMap = new Map<string, { totalSubs: number; count: number }>();
  for (const ch of channels) {
    const cat = ch.category ?? "General";
    const existing = categoryMap.get(cat) ?? { totalSubs: 0, count: 0 };
    existing.totalSubs += ch.subCount;
    existing.count += 1;
    categoryMap.set(cat, existing);
  }

  const sortedCategories = Array.from(categoryMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.totalSubs - a.totalSubs);

  return (
    <main className="min-h-screen bg-bg font-pixel uppercase text-warm">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-muted transition-colors hover:text-cream"
          >
            &larr; Back to City
          </Link>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-3xl text-cream md:text-4xl">
            Leader<span style={{ color: ACCENT }}>board</span>
          </h1>
          <p className="mt-3 text-xs text-muted normal-case">
            Top Telegram channels in Ethiopia
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={`/leaderboard?tab=${tab.id}`}
              className="px-5 py-2 text-[11px] transition-colors border-2"
              style={{
                borderColor: activeTab === tab.id ? ACCENT : "var(--color-border)",
                color: activeTab === tab.id ? ACCENT : "var(--color-muted)",
                backgroundColor: activeTab === tab.id ? "rgba(200, 230, 74, 0.1)" : "transparent",
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="mt-6 border-[3px] border-border">
          {/* Header row */}
          <div className="flex items-center gap-4 border-b-[3px] border-border bg-bg-card px-5 py-3 text-xs text-muted">
            <span className="w-10 text-center">#</span>
            {activeTab === "channels" ? (
              <>
                <span className="flex-1">Channel</span>
                <span className="hidden w-24 text-right sm:block">Category</span>
                <span className="w-28 text-right">Subscribers</span>
              </>
            ) : (
              <>
                <span className="flex-1">Category</span>
                <span className="hidden w-24 text-right sm:block">Channels</span>
                <span className="w-28 text-right">Total Subs</span>
              </>
            )}
          </div>

          {/* Rows */}
          {activeTab === "channels" ? (
            channels.map((ch, i) => {
              const pos = i + 1;
              return (
                <Link
                  key={ch.handle}
                  href={`/?user=${ch.handle}`}
                  className="flex items-center gap-4 border-b border-border/50 px-5 py-3.5 transition-colors hover:bg-bg-card"
                >
                  <span className="w-10 text-center">
                    <span
                      className="text-sm font-bold"
                      style={{ color: rankColor(pos) }}
                    >
                      {pos}
                    </span>
                  </span>

                  <div className="flex flex-1 items-center gap-3 overflow-hidden">
                    {ch.avatar_url && (
                      <Image
                        src={ch.avatar_url}
                        alt={ch.handle}
                        width={36}
                        height={36}
                        className="border-2 border-border"
                        style={{ imageRendering: "pixelated" }}
                      />
                    )}
                    <div className="overflow-hidden">
                      <p className="truncate text-sm text-cream">
                        {ch.name ?? ch.handle}
                      </p>
                      {ch.name && (
                        <p className="truncate text-[10px] text-muted">
                          @{ch.handle}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="hidden w-24 text-right text-xs text-muted sm:block">
                    {ch.category ?? "—"}
                  </span>

                  <span className="w-28 text-right text-sm" style={{ color: ACCENT }}>
                    {formatNumber(ch.subCount)}
                  </span>
                </Link>
              );
            })
          ) : (
            sortedCategories.map((cat, i) => {
              const pos = i + 1;
              return (
                <div
                  key={cat.name}
                  className="flex items-center gap-4 border-b border-border/50 px-5 py-3.5"
                >
                  <span className="w-10 text-center">
                    <span
                      className="text-sm font-bold"
                      style={{ color: rankColor(pos) }}
                    >
                      {pos}
                    </span>
                  </span>

                  <span className="flex-1 truncate text-sm text-cream">
                    {cat.name}
                  </span>

                  <span className="hidden w-24 text-right text-xs text-muted sm:block">
                    {cat.count}
                  </span>

                  <span className="w-28 text-right text-sm" style={{ color: ACCENT }}>
                    {formatNumber(cat.totalSubs)}
                  </span>
                </div>
              );
            })
          )}

          {(activeTab === "channels" ? channels : sortedCategories).length === 0 && (
            <div className="px-5 py-8 text-center text-xs text-muted normal-case">
              No data available. Please try again later.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="btn-press inline-block px-7 py-3.5 text-sm text-bg"
            style={{
              backgroundColor: ACCENT,
              boxShadow: "4px 4px 0 0 #5a7a00",
            }}
          >
            Enter the City
          </Link>
        </div>
      </div>
    </main>
  );
}
