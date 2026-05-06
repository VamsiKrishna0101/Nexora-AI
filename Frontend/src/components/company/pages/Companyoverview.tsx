import React from "react";
import '../styles/Companyoverview.css'
// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompanyData {
    name: string;
    domain?: string | null;
    logo_url?: string | null;
    industry?: string | null;
    type?: string | null;
    employees?: string | null;
    revenue?: string | null;
    founded_year?: number | null;
    website?: string | null;
    description?: string | null;
    seo_description?: string | null;
    location?: {
        city?: { name: string } | null;
        country?: { name: string } | null;
        phone?: string | null;
    } | null;
    socials?: {
        linkedin_url?: string | null;
        twitter_url?: string | null;
        youtube_url?: string | null;
        facebook_url?: string | null;
        instagram_url?: string | null;
        g2_url?: string | null;
    } | null;
    financial?: {
        stock_symbol?: string | null;
        stock_exchange?: string | null;
    } | null;
}

export interface TimelineEvent {
    type: string;
    year: number;
    event: string;
}

export interface TimelineData {
    company: string;
    timeline: TimelineEvent[];
}

export interface NewsItem {
    title: string;
    url: string;
    snippet: string;
    source: string;
    date: string;
    priority: "high" | "medium" | "low";
}

export interface NewsData {
    success: boolean;
    data: NewsItem[];
}

export interface Competitor {
    name: string;
    domain: string;
    description: string;
    location: string;
}

export interface CompetitorsData {
    success: boolean;
    data: {
        success: boolean;
        data: Competitor[];
    };
}

interface CompanyOverviewProps {
    company: CompanyData | null;
    timeline: TimelineData | null;
    news: NewsData | null;
    competitors: CompetitorsData | null;
    onDeepDive?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRevenue(raw?: string | null): string {
    if (!raw) return "—";
    if (raw === "over-1b") return "$1B+";
    if (raw === "over-500m") return "$500M+";
    if (raw === "over-100m") return "$100M+";
    if (raw === "over-10m") return "$10M+";
    return raw;
}

function formatEmployees(raw?: string | null): string {
    if (!raw) return "—";
    if (raw === "over-10K") return "10,000+";
    if (raw === "over-1K") return "1,000+";
    if (raw === "over-500") return "500+";
    if (raw === "over-100") return "100+";
    return raw;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 3)
        .join("");
}

function truncate(text: string, max: number): string {
    return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconLinkedIn = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="3" fill="#0A66C2" />
        <path d="M6.5 9.5H4.5v9h2V9.5zm-1-1.5a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zM19.5 13c0-2.2-1-3.7-3-3.7-1 0-1.8.5-2.2 1.2V9.5h-2v9h2v-4.8c0-1.2.6-2 1.7-2 1 0 1.5.7 1.5 2v4.8h2V13z" fill="white" />
    </svg>
);

const IconX = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
);

const IconYouTube = () => (
    <svg width="15" height="11" viewBox="0 0 24 17" fill="none">
        <path d="M23.5 2.7S23.2.9 22.4.1C21.4-.9 20.3-.9 19.8-.9 16.5-1 12-1 12-1s-4.5 0-7.8.1C3.7-.9 2.6-.9 1.6.1.8.9.5 2.7.5 2.7S.2 4.8.2 7v2.1c0 2.2.3 4.3.3 4.3s.3 1.8 1.1 2.6c1 1 2.3.9 2.9 1C6.5 17.2 12 17.2 12 17.2s4.5 0 7.8-.2c.5-.1 1.6-.1 2.6-1.1.8-.8 1.1-2.6 1.1-2.6s.3-2.1.3-4.3V7c0-2.2-.3-4.3-.3-4.3zM9.7 11.5V5l6.5 3.3-6.5 3.2z" fill="#FF0000" />
    </svg>
);

const IconFacebook = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="3" fill="#1877F2" />
        <path d="M15 8.5h-1.5C13 8.5 13 9 13 9.5V11h2l-.3 2H13v6h-2v-6h-1.5v-2H11V9.3C11 7.5 12 6.5 13.8 6.5H15v2z" fill="white" />
    </svg>
);

const IconInstagram = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <defs>
            <linearGradient id="igGrad" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FD5949" />
                <stop offset="50%" stopColor="#D6249F" />
                <stop offset="100%" stopColor="#285AEB" />
            </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="url(#igGrad)" />
        <rect x="7" y="7" width="10" height="10" rx="3" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="12" r="2.5" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="16.5" cy="7.5" r="1" fill="white" />
    </svg>
);

const IconSearch = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
);

const IconExternalLink = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

const IconBolt = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const IconBuilding = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
);

const IconPin = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);

// ─── Skeleton ────────────────────────────────────────────────────────────────

const Skeleton: React.FC<{ width?: string; height?: number; className?: string }> = ({
    width = "100%", height = 16, className = ""
}) => (
    <div
        className={`co-skeleton ${className}`}
        style={{ width, height }}
    />
);

const SectionSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
    <div className="co-skeleton-section">
        <Skeleton width="40%" height={20} />
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} width={i % 2 === 0 ? "100%" : "75%"} height={14} />
            ))}
        </div>
    </div>
);

// ─── Header ──────────────────────────────────────────────────────────────────

const CompanyHeader: React.FC<{ data: CompanyData | null; onDeepDive?: () => void }> = ({ data, onDeepDive }) => {
    if (!data) {
        return (
            <div className="co-header-card">
                <div className="co-header-top">
                    <div style={{ display: "flex", gap: 14, alignItems: "center", flex: 1 }}>
                        <Skeleton width="52px" height={52} className="co-skeleton-logo" />
                        <div style={{ flex: 1 }}>
                            <Skeleton width="50%" height={20} />
                            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                                <Skeleton width="90px" height={22} className="co-skeleton-pill" />
                                <Skeleton width="60px" height={22} className="co-skeleton-pill" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="co-stats-row">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="co-stat-card">
                            <Skeleton width="60%" height={11} />
                            <Skeleton width="70%" height={18} style={{ marginTop: 6 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const { name, logo_url, industry, type, employees, revenue, founded_year, website, location, socials, financial } = data;
    const stockBadge = financial?.stock_symbol && financial?.stock_exchange
        ? `${financial.stock_symbol.toUpperCase()} · ${financial.stock_exchange.toUpperCase()}`
        : null;
    const hqParts = [location?.city?.name, location?.country?.name].filter(Boolean);

    return (
        <div className="co-header-card">
            <div className="co-header-top">
                {/* Left: logo + name + badges */}
                <div className="co-header-identity">
                    {logo_url ? (
                        <img src={logo_url} alt={name} className="co-logo-img"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                        <div className="co-logo-initials">{getInitials(name)}</div>
                    )}
                    <div>
                        <p className="co-company-name">{name}</p>
                        <div className="co-badges">
                            {industry && <span className="co-badge co-badge-neutral">{industry}</span>}
                            {type && <span className="co-badge co-badge-neutral">{type.charAt(0).toUpperCase() + type.slice(1)}</span>}
                            {stockBadge && <span className="co-badge co-badge-stock">{stockBadge}</span>}
                        </div>
                    </div>
                </div>

                {/* Right: socials + CTA */}
                <div className="co-header-actions">
                    <div className="co-socials">
                        {socials?.linkedin_url && <a href={socials.linkedin_url} target="_blank" rel="noopener noreferrer" className="co-social-btn" title="LinkedIn"><IconLinkedIn /></a>}
                        {socials?.twitter_url && <a href={socials.twitter_url} target="_blank" rel="noopener noreferrer" className="co-social-btn co-social-x" title="X"><IconX /></a>}
                        {socials?.youtube_url && <a href={socials.youtube_url} target="_blank" rel="noopener noreferrer" className="co-social-btn" title="YouTube"><IconYouTube /></a>}
                        {socials?.facebook_url && <a href={socials.facebook_url} target="_blank" rel="noopener noreferrer" className="co-social-btn" title="Facebook"><IconFacebook /></a>}
                        {socials?.instagram_url && <a href={socials.instagram_url} target="_blank" rel="noopener noreferrer" className="co-social-btn" title="Instagram"><IconInstagram /></a>}
                        {socials?.g2_url && <a href={socials.g2_url} target="_blank" rel="noopener noreferrer" className="co-social-btn co-social-g2" title="G2">G2</a>}
                    </div>
                    <button className="co-deepdive-btn" onClick={onDeepDive}>
                        <IconSearch />
                        Deep Dive
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="co-stats-divider" />
            <div className="co-stats-row">
                <div className="co-stat-card">
                    <span className="co-stat-label">Founded</span>
                    <span className="co-stat-value">{founded_year ?? "—"}</span>
                </div>
                <div className="co-stat-card">
                    <span className="co-stat-label">Headquarters</span>
                    <span className="co-stat-value co-stat-value--sm">
                        {hqParts.length > 0 ? hqParts.join(", ") : "—"}
                    </span>
                </div>
                <div className="co-stat-card">
                    <span className="co-stat-label">Employees</span>
                    <span className="co-stat-value">{formatEmployees(employees)}</span>
                </div>
                <div className="co-stat-card">
                    <span className="co-stat-label">Revenue</span>
                    <span className="co-stat-value">{formatRevenue(revenue)}</span>
                </div>
                <div className="co-stat-card">
                    <span className="co-stat-label">Website</span>
                    {website
                        ? <a href={website} target="_blank" rel="noopener noreferrer" className="co-stat-link">Visit <IconExternalLink /></a>
                        : <span className="co-stat-value">—</span>}
                </div>
            </div>
        </div>
    );
};

// ─── Business Description ────────────────────────────────────────────────────

const BusinessDescription: React.FC<{ data: CompanyData | null }> = ({ data }) => {
    const text = data?.seo_description || data?.description;
    return (
        <div className="co-section">
            <h2 className="co-section-title">Business Description</h2>
            {!data ? (
                <SectionSkeleton rows={4} />
            ) : text ? (
                <p className="co-description-text">{text}</p>
            ) : (
                <p className="co-empty">No description available.</p>
            )}
        </div>
    );
};

// ─── Business Timeline ───────────────────────────────────────────────────────

const typeColorMap: Record<string, string> = {
    founding: "co-tl-badge--founding",
    funding: "co-tl-badge--funding",
    acquisition: "co-tl-badge--acquisition",
    leadership: "co-tl-badge--leadership",
    product: "co-tl-badge--product",
    milestone: "co-tl-badge--milestone",
};

const BusinessTimeline: React.FC<{ data: TimelineData | null }> = ({ data }) => (
    <div className="co-section">
        <h2 className="co-section-title">
            <span className="co-section-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            </span>
            Business Timeline
        </h2>

        {!data ? (
            <div className="co-timeline">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="co-tl-item">
                        <div className="co-tl-line-wrap">
                            <Skeleton width="12px" height={12} className="co-skeleton-dot" />
                            <div className="co-tl-line" />
                        </div>
                        <div className="co-tl-card co-tl-card--skeleton">
                            <Skeleton width="20%" height={16} />
                            <Skeleton width="70%" height={13} style={{ marginTop: 6 }} />
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="co-timeline">
                {data.timeline?.map((item, idx) => (

                    <div key={idx} className="co-tl-item">
                        <div className="co-tl-line-wrap">
                            <div className="co-tl-dot" />
                            {idx < data.timeline.length - 1 && <div className="co-tl-line" />}
                        </div>
                        <div className="co-tl-card">
                            <div className="co-tl-card-header">
                                <span className="co-tl-year">{item.year}</span>
                                <span className={`co-tl-badge ${typeColorMap[item.type] || "co-tl-badge--milestone"}`}>
                                    {item.type}
                                </span>
                            </div>
                            <p className="co-tl-event">{item.event}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// ─── Key Triggers & News ─────────────────────────────────────────────────────

const priorityClass: Record<string, string> = {
    high: "co-news-badge--high",
    medium: "co-news-badge--medium",
    low: "co-news-badge--low",
};

const KeyTriggers: React.FC<{ data: NewsData | null }> = ({ data }) => {
    const items = data?.data?.filter((n) => n.priority !== "low").slice(0, 6) ?? null;

    return (
        <div className="co-section">
            <h2 className="co-section-title">
                <span className="co-section-icon"><IconBolt /></span>
                Key Triggers & Recent Developments
            </h2>

            {!data ? (
                <div className="co-news-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="co-news-card co-news-card--skeleton">
                            <Skeleton width="70%" height={15} />
                            <Skeleton width="30%" height={11} style={{ marginTop: 6 }} />
                            <Skeleton width="100%" height={12} style={{ marginTop: 10 }} />
                            <Skeleton width="85%" height={12} style={{ marginTop: 4 }} />
                        </div>
                    ))}
                </div>
            ) : items && items.length > 0 ? (
                <div className="co-news-grid">
                    {items?.map((item, idx) => (

                        <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="co-news-card">
                            <div className="co-news-card-top">
                                <span className="co-news-title">{item.title}</span>
                                <span className={`co-news-badge ${priorityClass[item.priority] || "co-news-badge--low"}`}>
                                    {item.priority}
                                </span>
                            </div>
                            <span className="co-news-meta">{item.source} · {item.date}</span>
                            <p className="co-news-snippet">{truncate(item.snippet, 120)}</p>
                        </a>
                    ))}
                </div>
            ) : (
                <p className="co-empty">No recent developments found.</p>
            )}
        </div>
    );
};

// ─── Peer Companies ──────────────────────────────────────────────────────────

const PeerCompanies: React.FC<{ data: CompetitorsData | null }> = ({ data }) => {
    const peers = data?.data?.data ?? null;

    return (
        <div className="co-section">
            <h2 className="co-section-title">
                <span className="co-section-icon"><IconBuilding /></span>
                Peer Companies
            </h2>

            {!data ? (
                <div className="co-peers-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="co-peer-card co-peer-card--skeleton">
                            <Skeleton width="50%" height={16} />
                            <Skeleton width="40%" height={11} style={{ marginTop: 6 }} />
                            <Skeleton width="100%" height={12} style={{ marginTop: 12 }} />
                            <Skeleton width="90%" height={12} style={{ marginTop: 4 }} />
                            <Skeleton width="70%" height={12} style={{ marginTop: 4 }} />
                        </div>
                    ))}
                </div>
            ) : peers && peers.length > 0 ? (
                <div className="co-peers-grid">
                    {peers?.map((peer, idx) => (

                        <a
                            key={idx}
                            href={`https://${peer.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="co-peer-card"
                        >
                            <div className="co-peer-header">
                                <div className="co-peer-logo">{getInitials(peer.name)}</div>
                                <div>
                                    <p className="co-peer-name">{peer.name}</p>
                                    <p className="co-peer-domain">{peer.domain}</p>
                                </div>
                            </div>
                            <p className="co-peer-location">
                                <IconPin />
                                {peer.location}
                            </p>
                            <p className="co-peer-desc">{truncate(peer.description, 130)}</p>
                        </a>
                    ))}
                </div>
            ) : (
                <p className="co-empty">No peer companies found.</p>
            )}
        </div>
    );
};

// ─── Main Export ─────────────────────────────────────────────────────────────

const CompanyOverview: React.FC<CompanyOverviewProps> = ({
    company, timeline, news, competitors, onDeepDive,
}) => {
    return (
        <div className="co-root">
            <CompanyHeader data={company} onDeepDive={onDeepDive} />

            <div className="co-body">
                <BusinessDescription data={company} />
                <BusinessTimeline data={timeline} />
                <KeyTriggers data={news} />
                <PeerCompanies data={competitors} />
            </div>
        </div>
    );
};

export default CompanyOverview;

// ─── Usage ───────────────────────────────────────────────────────────────────
// import CompanyOverview from "./CompanyOverview";
//
// <CompanyOverview
//   company={companyData}           // null while loading → shows skeleton
//   timeline={timelineData}         // null while loading → shows skeleton
//   news={newsData}                 // null while loading → shows skeleton
//   competitors={competitorsData}   // null while loading → shows skeleton
//   onDeepDive={() => {}}           // wire up later
// />