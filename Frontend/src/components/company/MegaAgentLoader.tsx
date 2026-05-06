import React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import "../../styles/dashboard.css";

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: "gather", label: "Intelligence gathering & scrape" },
  { id: "executive_brief", label: "Executive brief analysis" },
  { id: "market_position", label: "Market position & narrative" },
  { id: "product_intelligence", label: "Product & feature fingerprinting" },
  { id: "financial_profile", label: "Capital & funding forensic" },
  { id: "competitive_landscape", label: "Competitive intensity map" },
  { id: "technology_fingerprint", label: "Tech stack & infrastructure" },
  { id: "talent_org", label: "Talent & organizational flow" },
  { id: "leadership", label: "Leadership persona synthesis" },
  { id: "content_messaging", label: "Messaging & content audit" },
  { id: "strategic_signals", label: "Strategic signals detection" },
  { id: "swot", label: "SWOT matrix generation" },
  { id: "verdict", label: "Final analyst verdict" },
];

interface Props {
  currentStepIndex: number;
  status: "gathering" | "analyzing" | "completed" | "error";
  errorMsg?: string;
}

export default function MegaAgentLoader({ currentStepIndex, status, errorMsg }: Props) {
  const totalSteps = SECTIONS.length;
  const completedCount = status === "completed" ? totalSteps : currentStepIndex;
  const progressPct = Math.round((completedCount / totalSteps) * 100);

  const stageLabel =
    status === "gathering" ? "Stage 1 — Establishing data pipelines" :
      status === "analyzing" ? "Stage 2 — Agentic analysis" :
        status === "completed" ? "Synthesis complete" :
          "Intelligence disruption";

  const subLabel =
    status === "gathering" ? "Establishing secure data pipelines..." :
      status === "analyzing" ? "This takes 7–8 minutes. You can navigate away and come back." :
        status === "completed" ? "Polishing your report..." :
          errorMsg ?? "Something went wrong. Please retry.";

  const minutesLeft = Math.ceil(((totalSteps - completedCount) / totalSteps) * 8);

  return (
    <div className="mal-root">
      <div className="mal-inner">

        {/* ── Top progress bar ── */}
        <div className="mal-topbar">
          <div
            className="mal-topbar-fill"
            style={{ width: status === "completed" ? "100%" : `${progressPct}%` }}
          />
        </div>

        {/* ── Status eyebrow ── */}
        <div className="mal-eyebrow">
          {status !== "error" && status !== "completed" && (
            <span className="mal-pulse-dot" />
          )}
          <span className="mal-eyebrow-text">
            {status === "error" ? "Error" : "Synthesizing enterprise intelligence"}
          </span>
        </div>

        {/* ── Headline ── */}
        <h1 className="mal-headline">{stageLabel}</h1>
        <p className="mal-subline">{subLabel}</p>

        {/* ── Step list ── */}
        <div className="mal-steps">
          {SECTIONS.map((section, index) => {
            const isDone = index < completedCount || status === "completed";
            const isCurrent = index === currentStepIndex && status !== "completed" && status !== "error";
            const isPending = !isDone && !isCurrent;

            return (
              <div
                key={section.id}
                className={`mal-step ${isDone ? "mal-step--done" : ""} ${isCurrent ? "mal-step--active" : ""} ${isPending ? "mal-step--pending" : ""}`}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="mal-step-icon">
                  {isDone && <CheckCircle2 size={16} />}
                  {isCurrent && <Loader2 size={16} className="mal-spin" />}
                  {isPending && <span className="mal-dot" />}
                </div>

                <span className="mal-step-label">{section.label}</span>

                {isDone && <span className="mal-step-meta">done</span>}
                {isCurrent && <span className="mal-step-meta mal-step-meta--active">processing</span>}
              </div>
            );
          })}
        </div>

        {/* ── Footer meta ── */}
        {status !== "error" && (
          <div className="mal-footer">
            <span>{completedCount} / {totalSteps} complete</span>
            {status !== "completed" && (
              <span>~{minutesLeft} min remaining</span>
            )}
            {status === "completed" && (
              <span>All steps complete</span>
            )}
          </div>
        )}

        {/* ── Error retry ── */}
        {status === "error" && (
          <button className="mal-retry">Retry analysis</button>
        )}

      </div>
    </div>
  );
}