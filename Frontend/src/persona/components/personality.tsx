import React from "react";
import "../../styles/intelligence.css";
import { Brain, Zap, Target, AlertTriangle, ShieldCheck } from "lucide-react";

interface TraitCircleProps {
  score: number;
  label: string;
  color: string;
}

const TraitCircle: React.FC<TraitCircleProps> = ({ score, label, color }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="trait-score-box">
      <svg className="circle-svg">
        <circle className="circle-bg" cx="35" cy="35" r={radius} />
        <circle
          className="circle-progress"
          cx="35"
          cy="35"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="score-text">{score}%</span>
      <span className="label-text">{label}</span>
    </div>
  );
};

export default function Personality({ data }: any) {
  const meta = data?.personality_analysis?.data;
  if (!meta) return <div className="p-8 text-slate-400">Intelligence profile not available.</div>;

  const profile = meta.behavioral_profile || {};
  const scores = meta.trait_scores || {};
  const drives = meta.what_drives_them || {};
  const tactics = meta.dos_and_donts || {};

  return (
    <div className="personality-dashboard">
      {/* Archetype Header */}
      <div className="intel-card archetype-banner">
        <div className="archetype-title">Behavioral Archetype</div>
        <div className="archetype-name">{profile.archetype || "Strategic Profile"}</div>
        <p className="mt-2 text-slate-500 text-sm leading-relaxed">
          {profile.one_line_description}
        </p>
        <div className="tag-cloud">
          {profile.trait_tags?.map((tag: string) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* Trait Matrix */}
      <div className="intel-card">
        <div className="tab-header">
          <Brain size={18} />
          <span>Core Personality Matrix</span>
        </div>
        <div className="trait-container">
          <TraitCircle score={scores.pace || 0} label="Pace" color="var(--accent-pace)" />
          <TraitCircle score={scores.dominance || 0} label="Dominance" color="var(--accent-dominance)" />
          <TraitCircle score={scores.pragmatism || 0} label="Pragmatic" color="var(--accent-pragmatism)" />
          <TraitCircle score={scores.risk_appetite || 0} label="Risk" color="var(--accent-risk)" />
          <TraitCircle score={scores.social_energy || 0} label="Social" color="var(--accent-social)" />
          <TraitCircle score={scores.expressiveness || 0} label="Expression" color="var(--accent-expression)" />
        </div>
      </div>

      <div className="intel-grid">
        {/* Success Drivers & Motivations */}
        <div className="intel-card">
          <div className="tab-header">
            <ShieldCheck size={18} className="text-emerald-500" />
            <span>Success Drivers & Dos</span>
          </div>
          <ul className="bullet-list">
            {tactics.dos?.map((item: string, i: number) => (
              <li key={i} className="bullet-item">{item}</li>
            ))}
          </ul>
          
          <div className="tab-header mt-8">
            <Zap size={18} className="text-amber-500" />
            <span>Core Energizers</span>
          </div>
          <ul className="bullet-list">
            {drives.energizers?.map((item: string, i: number) => (
              <li key={i} className="bullet-item">{item}</li>
            ))}
          </ul>
        </div>

        {/* Blind Spots & Friction Points */}
        <div className="intel-card">
          <div className="tab-header">
            <AlertTriangle size={18} className="text-rose-500" />
            <span>Blind Spots & Risks</span>
          </div>
          <ul className="bullet-list">
            {meta.blind_spots?.map((item: string, i: number) => (
              <li key={i} className="bullet-item">{item}</li>
            ))}
          </ul>

          <div className="tab-header mt-8">
            <Target size={18} className="text-indigo-500" />
            <span>Decision Style</span>
          </div>
          <div className="space-y-4">
            <div className="text-sm">
              <span className="font-semibold block text-slate-700">Approach:</span>
              <p className="text-slate-500">{meta.working_style?.decision_making}</p>
            </div>
            <div className="text-sm">
              <span className="font-semibold block text-slate-700">Conflict:</span>
              <p className="text-slate-500">{meta.working_style?.conflict_style}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Playbook */}
      {meta.engagement_guide && (
        <div className="intel-card mt-6">
          <div className="tab-header">
            <Zap size={18} className="text-amber-500" />
            <span>The Outreach Playbook</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="playbook-section">
              <span className="playbook-label">How to Open</span>
              <ul className="bullet-list-mini">
                {meta.engagement_guide.how_to_open?.map((tip: string, i: number) => (
                  <li key={i} className="playbook-tip">{tip}</li>
                ))}
              </ul>
            </div>
            <div className="playbook-section">
              <span className="playbook-label">Email Strategy</span>
              <ul className="bullet-list-mini">
                {meta.engagement_guide.how_to_email?.map((tip: string, i: number) => (
                  <li key={i} className="playbook-tip">{tip}</li>
                ))}
              </ul>
            </div>
            <div className="playbook-section">
              <span className="playbook-label">Building Trust</span>
              <ul className="bullet-list-mini">
                {meta.engagement_guide.how_to_build_trust?.map((tip: string, i: number) => (
                  <li key={i} className="playbook-tip">{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}