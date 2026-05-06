import { THEME } from "./theme";
import { addSlideHeader, addPanel, addBullet, addLargeStat } from "./components";
import { fmt } from "./parser";

// 1. LinkedIn Digital Footprint
export const createLinkedInSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "LinkedIn Authority & Reach", "Professional audience engagement and content velocity");

  const li = data.online.linkedin || {};

  // Follower Stats - LARGE
  addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 1.5, label: "Platform Metrics" });
  addLargeStat(slide, { x: 1.0, y: 1.7, label: "Total Followers", value: fmt(li.followers), color: THEME.accentBlue });
  addLargeStat(slide, { x: 5.0, y: 1.7, label: "Avg Likes / Post", value: fmt(li.avg_likes_per_post), color: THEME.accentGreen });
  addLargeStat(slide, { x: 9.0, y: 1.7, label: "Avg Comments", value: fmt(li.avg_comments_per_post), color: THEME.accent });

  // Top Topics
  addPanel(slide, { x: 0.5, y: 3.0, w: 12.3, h: 1.8, label: "Primary Content Themes" });
  (li.top_topics || []).slice(0, 5).forEach((topic: string, i: number) => {
    const x = 0.8 + i * 2.4;
    slide.addText(topic, {
      shape: ppt.ShapeType.rect,
      fill: { color: THEME.border },
      line: { color: THEME.accentBlue, pt: 2 },
      x: x, y: 3.5, w: 2.2, h: 0.6,
      align: "center", valign: "middle", margin: 0,
      color: THEME.textPrimary, fontSize: 13, bold: true, fontFace: THEME.font
    });
  });

  // Recent Summary
  addPanel(slide, { x: 0.5, y: 5.1, w: 12.3, h: 1.9, label: "Platform Activity Summary" });
  slide.addText(li.last_post_summary || data.online.recent_activity_summary || "Active engagement in tier-1 tech ecosystems.", {
    x: 0.8, y: 5.6, w: 11.5, h: 1.2, valign: "top",
    color: THEME.textPrimary, fontSize: 16, lineSpacing: 24, fontFace: THEME.font
  });
};

// 2. Twitter/X Network Presence
export const createTwitterSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "X (Twitter) Digital Footprint", "Real-time engagement and public narrative influence");

  const tw = data.online.twitter || {};

  // Follower Stats
  addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 1.5, label: "Platform Metrics" });
  addLargeStat(slide, { x: 1.0, y: 1.7, label: "Total Followers", value: fmt(tw.followers), color: THEME.accentBlue });
  addLargeStat(slide, { x: 5.0, y: 1.7, label: "Avg Likes / Tweet", value: fmt(tw.avg_likes_per_tweet), color: THEME.accentGreen });
  addLargeStat(slide, { x: 9.0, y: 1.7, label: "Avg Retweets", value: fmt(tw.avg_retweets_per_tweet), color: THEME.accent });

  // Profile Handle
  addPanel(slide, { x: 0.5, y: 3.0, w: 12.3, h: 1.0, label: "Verified Handle" });
  slide.addText(tw.handle || "@SUBJECT", {
    x: 0.8, y: 3.4, w: 11.5,
    color: THEME.accent, fontSize: 32, bold: true, fontFace: THEME.font
  });

  // Content Focus
  addPanel(slide, { x: 0.5, y: 4.3, w: 12.3, h: 2.8, label: "Key Discourse Areas" });
  const areas = tw.top_topics || [];
  if (areas.length > 0) {
    const textObjects = areas.slice(0, 5).map((area: string) => ({
      text: area,
      options: { bullet: { characterCode: '25A0', color: THEME.accentBlue } }
    }));
    slide.addText(textObjects, {
      x: 0.7, y: 4.9, w: 11.8, h: 2.0,
      color: THEME.textPrimary, fontSize: 16, fontFace: THEME.font, lineSpacing: 28, margin: 0, valign: "top"
    });
  }
};

// 3. Content & Thought Leadership
export const createThoughtLeadershipSlide = (ppt: any, data: any) => {
  if (!data.thoughtLead || Object.keys(data.thoughtLead).length === 0) return;

  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "Thought Leadership & Public Presence", "Conferences, podcast appearances, and authority tiering");

  // Tier & Assessment
  addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 2.5, label: "Authority Assessment" });
  slide.addText(data.thoughtLead.thought_leadership_tier || "INDUSTRY AUTHORITY", {
    x: 0.8, y: 1.7, w: 6.0,
    color: THEME.accentGreen, fontSize: 36, bold: true, fontFace: THEME.font
  });
  slide.addText(data.thoughtLead.thought_leadership_assessment || "", {
    x: 0.8, y: 2.5, w: 11.5, h: 1.0, valign: "top",
    color: THEME.textPrimary, fontSize: 15, lineSpacing: 22, fontFace: THEME.font
  });

  // Recent Engagements
  addPanel(slide, { x: 0.5, y: 4.0, w: 6.0, h: 3.0, label: "Recent Keynote Talks" });
  const talks = data.thoughtLead.conference_talks || [];
  talks.slice(0, 3).forEach((item: any, i: number) => {
    const y = 4.5 + i * 0.8;
    slide.addText(item.talk_title || item.event, {
      x: 0.8, y: y, w: 5.5,
      color: THEME.textPrimary, fontSize: 14, bold: true, fontFace: THEME.font
    });
    slide.addText(item.event, {
      x: 0.8, y: y + 0.35, w: 5.5,
      color: THEME.accentBlue, fontSize: 11, bold: true, fontFace: THEME.font
    });
  });

  // Podcasts/Interviews
  addPanel(slide, { x: 6.8, y: 4.0, w: 6.0, h: 3.0, label: "Media Appearances" });
  const media = [...(data.thoughtLead.podcast_appearances || []), ...(data.thoughtLead.interviews || [])];
  media.slice(0, 3).forEach((item: any, i: number) => {
    const y = 4.5 + i * 0.8;
    slide.addText(item.episode_title || item.title, {
      x: 7.0, y: y, w: 5.5,
      color: THEME.textPrimary, fontSize: 14, bold: true, fontFace: THEME.font
    });
    slide.addText(item.show_name || item.outlet, {
      x: 7.0, y: y + 0.35, w: 5.5,
      color: THEME.accent, fontSize: 11, bold: true, fontFace: THEME.font
    });
  });
};

// 4. Strategic Network Reach & Communities
export const createNetworkSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "Network & Ecosystem Influence", "Institutional affiliations and industry community standing");

  // Network Reach
  addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 1.5, label: "Strategic Reach Classification" });
  slide.addText(data.network.network_reach || "TIER 1 (GLOBAL)", {
    x: 0.8, y: 1.7, w: 11.5,
    color: THEME.accent, fontSize: 48, bold: true, fontFace: THEME.font
  });

  // Affiliated Companies
  addPanel(slide, { x: 0.5, y: 3.0, w: 6.0, h: 4.0, label: "Institutional Affiliations" });
  const companies = data.network.associated_companies || [];
  companies.slice(0, 4).forEach((item: any, i: number) => {
    const y = 3.5 + i * 0.9;
    slide.addText(item.company.toUpperCase(), {
      x: 0.8, y: y, w: 5.5,
      color: THEME.accentBlue, fontSize: 18, bold: true, fontFace: THEME.font
    });
    slide.addText(item.role, {
      x: 0.8, y: y + 0.45, w: 5.5,
      color: THEME.textPrimary, fontSize: 14, fontFace: THEME.font
    });
  });

  // Industry Communities
  addPanel(slide, { x: 6.8, y: 3.0, w: 6.0, h: 4.0, label: "Ecosystem Communities", accent: THEME.accentGreen });
  const communities = data.network.industry_communities || [];
  if (communities.length > 0) {
    const commTexts = communities.map((c: string) => ({
      text: c,
      options: { bullet: { characterCode: '25A0', color: THEME.accentGreen } }
    }));
    slide.addText(commTexts, {
      x: 7.0, y: 3.5, w: 5.6, h: 3.3,
      color: THEME.textPrimary, fontSize: 16, fontFace: THEME.font, lineSpacing: 26, margin: 0, valign: "top"
    });
  }
};