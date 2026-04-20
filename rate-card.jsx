import { useState, useMemo } from "react";

const HOURLY_COST = 45;

const deliverables = {
  "Content Creation": [
    { name: "Static Post (design + caption)", price: 75, mins: 30, notes: "Single image/carousel card with caption & hashtags" },
    { name: "Carousel Post (up to 10 slides)", price: 120, mins: 50, notes: "Multi-slide post with design & caption" },
    { name: "Reel / TikTok (short-form video)", price: 150, mins: 60, notes: "Scripted, filmed/edited, caption, trending audio" },
    { name: "Story (single frame)", price: 30, mins: 10, notes: "Designed story slide or quick video clip" },
    { name: "Story Set (3–5 frames)", price: 80, mins: 25, notes: "Multi-frame story sequence with design" },
    { name: "Long-Form Video (1–3 min)", price: 300, mins: 120, notes: "Scripted, filmed, edited, subtitles" },
    { name: "GIF / Animation", price: 100, mins: 40, notes: "Animated graphic for feed or stories" },
  ],
  "Copywriting": [
    { name: "Caption (standalone)", price: 40, mins: 15, notes: "Caption + hashtags, no design included" },
    { name: "Blog Post (500–800 words)", price: 200, mins: 60, notes: "SEO-friendly blog for website or LinkedIn" },
    { name: "Email / Newsletter", price: 150, mins: 45, notes: "Single email with subject line & body copy" },
    { name: "Ad Copy (per variation)", price: 50, mins: 15, notes: "Headline + body for paid ads" },
    { name: "Bio / Profile Optimisation", price: 80, mins: 20, notes: "Per platform — bio, highlights, links" },
    { name: "Script (Reel/TikTok)", price: 60, mins: 20, notes: "Hook, body, CTA for short-form video" },
  ],
  "Photography": [
    { name: "Headshot (per person)", price: 150, mins: 30, notes: "Studio or on-location, 3 edited selects" },
    { name: "Product Shot (per product)", price: 80, mins: 25, notes: "Styled product photo, 2 angles" },
    { name: "Lifestyle / Brand Image", price: 60, mins: 20, notes: "Per edited image from a shoot" },
    { name: "Photo Editing / Retouching", price: 25, mins: 10, notes: "Colour correction, crop, light retouch" },
    { name: "Half-Day Shoot (2 hrs)", price: 800, mins: 150, notes: "20+ edited images, planning included" },
    { name: "Full-Day Shoot (5 hrs)", price: 1500, mins: 330, notes: "50+ edited images, scouting & planning" },
  ],
  "Strategy & Management": [
    { name: "Strategy Session (60 min)", price: 300, mins: 90, notes: "Includes prep time + written summary" },
    { name: "Content Calendar (monthly)", price: 250, mins: 60, notes: "Monthly plan with post schedule & themes" },
    { name: "Hashtag Strategy", price: 100, mins: 30, notes: "Research & curated hashtag sets per platform" },
    { name: "Competitor Analysis", price: 200, mins: 60, notes: "Benchmarking against 3–5 competitors" },
    { name: "Monthly Report", price: 150, mins: 45, notes: "Analytics, insights, recommendations" },
    { name: "Community Management (per hr)", price: 45, mins: 60, notes: "Responding to comments, DMs, engagement" },
    { name: "Influencer Outreach (per contact)", price: 30, mins: 10, notes: "Research, contact, negotiate" },
    { name: "Paid Ad Management (per campaign/mo)", price: 400, mins: 120, notes: "Setup, monitoring, optimisation, reporting" },
  ],
};

const packages = [
  {
    name: "Starter",
    price: 990,
    hours: 8,
    platforms: ["Instagram", "Facebook"],
    includes: [
      "12 posts/mo",
      "Basic content creation",
      "Monthly report",
      "Hashtag research",
      "Community monitoring",
    ],
  },
  {
    name: "Growth",
    price: 1990,
    hours: 18,
    highlight: true,
    platforms: ["Instagram", "Facebook", "TikTok"],
    includes: [
      "20 posts/mo",
      "Custom content creation",
      "4 Reels/TikToks",
      "Fortnightly reports",
      "Community engagement",
      "Hashtag & trend strategy",
      "8 stories/mo",
    ],
  },
  {
    name: "Premium",
    price: 3490,
    hours: 30,
    platforms: ["Instagram", "Facebook", "TikTok", "LinkedIn"],
    includes: [
      "30 posts/mo",
      "Premium content creation",
      "8 Reels/TikToks",
      "Weekly reports",
      "Active community mgmt",
      "Influencer outreach",
      "16 stories/mo",
      "Monthly strategy session",
      "Priority support",
    ],
  },
];

const projects = [
  { name: "Social Media Audit", price: 450, hours: 4, deliverables: ["Platform analysis", "Competitor benchmarking", "90-day action plan"] },
  { name: "Campaign Launch", price: 1200, hours: 12, from: true, deliverables: ["Campaign strategy", "Content suite", "Paid ad creatives", "Performance report"] },
  { name: "Content Shoot (Half Day)", price: 800, hours: 5, deliverables: ["2-hr shoot", "20+ edited images", "Platform-optimised formats", "Shot list"] },
  { name: "Content Shoot (Full Day)", price: 1500, hours: 9, deliverables: ["5-hr shoot", "50+ edited images", "Platform-optimised formats", "Location scouting"] },
  { name: "Strategy Session", price: 300, hours: 2, deliverables: ["60-min consultation", "Recorded session", "Written summary & next steps"] },
  { name: "Reels/TikTok Package (10)", price: 900, hours: 8, deliverables: ["10 short-form videos", "Scripting", "Editing & captions", "Trending audio"] },
  { name: "Brand Photography", price: 1200, hours: 8, deliverables: ["Brand shoot", "30+ edited images", "Headshots", "Lifestyle & product shots"] },
  { name: "Ad Creative Package", price: 600, hours: 5, deliverables: ["5 static + 3 video creatives", "Copy variations", "A/B test versions"] },
];

const tabs = [
  { id: "deliverables", label: "Per Deliverable" },
  { id: "packages", label: "Monthly Packages" },
  { id: "projects", label: "One-Off Projects" },
];

const sectionColors = {
  "Content Creation": { bg: "bg-violet-500/10", border: "border-violet-500/20", badge: "bg-violet-500", text: "text-violet-400" },
  "Copywriting": { bg: "bg-sky-500/10", border: "border-sky-500/20", badge: "bg-sky-500", text: "text-sky-400" },
  "Photography": { bg: "bg-amber-500/10", border: "border-amber-500/20", badge: "bg-amber-500", text: "text-amber-400" },
  "Strategy & Management": { bg: "bg-emerald-500/10", border: "border-emerald-500/20", badge: "bg-emerald-500", text: "text-emerald-400" },
};

const fmt = (n) => `$${Math.round(n).toLocaleString()}`;
const fmtDec = (n) => `$${n.toFixed(2)}`;
const pct = (n) => `${(n * 100).toFixed(1)}%`;

const Check = () => (
  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const MarginBadge = ({ margin }) => {
  const color = margin >= 0.6 ? "text-emerald-400 bg-emerald-400/10" : margin >= 0.4 ? "text-amber-400 bg-amber-400/10" : "text-red-400 bg-red-400/10";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{pct(margin)}</span>;
};

function DeliverableTable({ search }) {
  const filtered = useMemo(() => {
    if (!search) return deliverables;
    const q = search.toLowerCase();
    const result = {};
    Object.entries(deliverables).forEach(([section, items]) => {
      const matched = items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.notes.toLowerCase().includes(q) || section.toLowerCase().includes(q)
      );
      if (matched.length) result[section] = matched;
    });
    return result;
  }, [search]);

  return (
    <div className="space-y-6">
      {Object.entries(filtered).map(([section, items]) => {
        const colors = sectionColors[section];
        return (
          <div key={section}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1.5 h-6 rounded-full ${colors.badge}`} />
              <h3 className="text-lg font-bold text-white">{section}</h3>
              <span className="text-xs text-gray-500">{items.length} items</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900/80">
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Deliverable</th>
                    <th className="text-right px-4 py-3 text-gray-400 font-medium">Price</th>
                    <th className="text-right px-4 py-3 text-gray-400 font-medium hidden sm:table-cell">Time</th>
                    <th className="text-right px-4 py-3 text-gray-400 font-medium hidden sm:table-cell">Cost</th>
                    <th className="text-right px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Profit</th>
                    <th className="text-right px-4 py-3 text-gray-400 font-medium">Margin</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const cost = (item.mins / 60) * HOURLY_COST;
                    const profit = item.price - cost;
                    const margin = item.price > 0 ? profit / item.price : 0;
                    return (
                      <tr key={item.name} className={`border-t border-gray-800/50 ${i % 2 === 0 ? "bg-gray-950" : "bg-gray-900/30"} hover:bg-gray-800/40 transition-colors`}>
                        <td className="px-4 py-3 text-white font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-right text-white font-semibold">{fmt(item.price)}</td>
                        <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">{item.mins} min</td>
                        <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">{fmtDec(cost)}</td>
                        <td className="px-4 py-3 text-right text-gray-300 hidden md:table-cell">{fmtDec(profit)}</td>
                        <td className="px-4 py-3 text-right"><MarginBadge margin={margin} /></td>
                        <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell max-w-xs">{item.notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      {Object.keys(filtered).length === 0 && (
        <div className="text-center py-16 text-gray-500">No deliverables match your search.</div>
      )}
    </div>
  );
}

function PackagesView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {packages.map((pkg) => {
        const cost = pkg.hours * HOURLY_COST;
        const profit = pkg.price - cost;
        const margin = pkg.price > 0 ? profit / pkg.price : 0;
        return (
          <div
            key={pkg.name}
            className={`relative rounded-2xl p-6 flex flex-col transition-all ${
              pkg.highlight
                ? "bg-white text-gray-950 shadow-2xl shadow-white/5 md:scale-105 z-10 border-2 border-white"
                : "bg-gray-900 border border-gray-800"
            }`}
          >
            {pkg.highlight && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <h3 className={`text-xl font-bold ${pkg.highlight ? "text-gray-950" : "text-white"}`}>{pkg.name}</h3>
            <div className="mt-4">
              <span className={`text-4xl font-bold tracking-tight ${pkg.highlight ? "text-gray-950" : "text-white"}`}>
                {fmt(pkg.price)}
              </span>
              <span className={`text-sm ml-1 ${pkg.highlight ? "text-gray-500" : "text-gray-500"}`}>AUD/mo</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {pkg.platforms.map((p) => (
                <span key={p} className={`text-xs font-medium px-2 py-0.5 rounded-full ${pkg.highlight ? "bg-gray-100 text-gray-600" : "bg-gray-800 text-gray-400"}`}>
                  {p}
                </span>
              ))}
            </div>

            <div className={`mt-4 grid grid-cols-3 gap-3 py-3 border-y ${pkg.highlight ? "border-gray-200" : "border-gray-800"}`}>
              <div className="text-center">
                <div className={`text-xs ${pkg.highlight ? "text-gray-500" : "text-gray-500"}`}>Hours/mo</div>
                <div className={`text-sm font-semibold mt-0.5 ${pkg.highlight ? "text-gray-800" : "text-gray-300"}`}>{pkg.hours}</div>
              </div>
              <div className="text-center">
                <div className={`text-xs ${pkg.highlight ? "text-gray-500" : "text-gray-500"}`}>Profit</div>
                <div className={`text-sm font-semibold mt-0.5 ${pkg.highlight ? "text-gray-800" : "text-gray-300"}`}>{fmt(profit)}</div>
              </div>
              <div className="text-center">
                <div className={`text-xs ${pkg.highlight ? "text-gray-500" : "text-gray-500"}`}>Margin</div>
                <div className="mt-0.5"><MarginBadge margin={margin} /></div>
              </div>
            </div>

            <ul className="mt-4 space-y-2 flex-1">
              {pkg.includes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check />
                  <span className={`text-sm ${pkg.highlight ? "text-gray-600" : "text-gray-400"}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function ProjectsView() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {projects.map((proj) => {
        const cost = proj.hours * HOURLY_COST;
        const profit = proj.price - cost;
        const margin = proj.price > 0 ? profit / proj.price : 0;
        return (
          <div key={proj.name} className="rounded-2xl bg-gray-900 border border-gray-800 p-6 flex flex-col">
            <h3 className="text-base font-bold text-white">{proj.name}</h3>
            <div className="mt-3">
              {proj.from && <span className="text-xs uppercase tracking-wider text-gray-500 mr-1">from</span>}
              <span className="text-3xl font-bold text-white">{fmt(proj.price)}</span>
              <span className="text-sm text-gray-500 ml-1">AUD</span>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span>~{proj.hours} hrs</span>
              <span>Cost: {fmt(cost)}</span>
              <span>Profit: {fmt(profit)}</span>
              <MarginBadge margin={margin} />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 flex-1">
              <ul className="space-y-2">
                {proj.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-2">
                    <Check />
                    <span className="text-sm text-gray-400">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RateCard() {
  const [tab, setTab] = useState("deliverables");
  const [search, setSearch] = useState("");

  const totalItems = Object.values(deliverables).reduce((sum, items) => sum + items.length, 0);
  const avgMargin = useMemo(() => {
    let totalMargin = 0, count = 0;
    Object.values(deliverables).forEach((items) =>
      items.forEach((i) => {
        const cost = (i.mins / 60) * HOURLY_COST;
        totalMargin += (i.price - cost) / i.price;
        count++;
      })
    );
    return totalMargin / count;
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">Internal Reference</p>
            <h1 className="text-3xl font-bold tracking-tight mt-1">Pulse Rate Card</h1>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-gray-500 text-xs">Services</div>
              <div className="text-white font-semibold">{totalItems}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 text-xs">Avg Margin</div>
              <div className="font-semibold"><MarginBadge margin={avgMargin} /></div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 text-xs">Hourly Cost</div>
              <div className="text-white font-semibold">${HOURLY_COST}/hr</div>
            </div>
          </div>
        </div>

        {/* Tabs + search */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="inline-flex items-center rounded-full bg-gray-900 p-1 border border-gray-800">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSearch(""); }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  tab === t.id ? "bg-white text-gray-950 shadow-lg" : "text-gray-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === "deliverables" && (
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search deliverables..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {tab === "deliverables" && <DeliverableTable search={search} />}
        {tab === "packages" && <PackagesView />}
        {tab === "projects" && <ProjectsView />}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
          <span>All prices AUD ex-GST. Placeholder rates — update to actuals.</span>
          <span>Last updated: April 2026</span>
        </div>
      </div>
    </div>
  );
}