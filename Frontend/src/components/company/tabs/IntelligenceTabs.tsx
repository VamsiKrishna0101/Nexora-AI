import React, { useState } from "react";
import { 
  BarChart3, 
  ShieldAlert, 
  Users, 
  Globe, 
  TrendingUp, 
  FileText, 
  Activity 
} from "lucide-react";
import OverviewTab from "./OverviewTab";
import FinancialsTab from "./FinancialsTab";
import LeadershipTab from "./LeadershipTab";
import CompetitiveTab from "./CompetitiveTab";
import SwotTab from "./SwotTab";
import ContentTab from "./ContentTab";
import VerdictTab from "./VerdictTab";
import "../styles/IntelligenceReport.css";

interface IntelligenceTabsProps {
  reportData: any;
  leadersData?: any[];
}

type TabType = 
  | "overview" 
  | "financials" 
  | "leadership" 
  | "competitive" 
  | "swot" 
  | "content" 
  | "verdict";

const IntelligenceTabs: React.FC<IntelligenceTabsProps> = ({ reportData, leadersData }) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const TABS: { id: TabType; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "financials", label: "Financials", icon: TrendingUp },
    { id: "leadership", label: "Leadership", icon: Users },
    { id: "competitive", label: "Competitive", icon: Globe },
    { id: "swot", label: "SWOT", icon: ShieldAlert },
    { id: "content", label: "Content", icon: BarChart3 },
    { id: "verdict", label: "Verdict", icon: FileText },
  ];

  const renderActivePanel = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab 
            brief={reportData.executive_brief} 
            signals={reportData.strategic_signals} 
            techStack={reportData.technology_fingerprint} 
          />
        );
      case "financials":
        return <FinancialsTab financialProfile={reportData.financial_profile} />;
      case "leadership":
        return <LeadershipTab personas={reportData.leadership_personas} leadersData={leadersData} />;
      case "competitive":
        return <CompetitiveTab landscape={reportData.competitive_landscape} marketPosition={reportData.market_position} />;
      case "swot":
        return <SwotTab swot={reportData.swot} />;
      case "content":
        return <ContentTab contentMessaging={reportData.content_messaging} />;
      case "verdict":
        return <VerdictTab verdict={reportData.analyst_verdict} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ marginTop: "24px" }}>
      {/* Floating Tab Bar (Persona Style) */}
      <div className="ir-floating-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`ir-floating-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Panel (Floating Card) */}
      <div className="ir-wrap ir-identity-card" style={{ borderTop: "1px solid #e2e8f0" }}>
        <div className="ir-body" style={{ padding: "32px" }}>
          {renderActivePanel()}
        </div>
      </div>
    </div>
  );
};

export default IntelligenceTabs;
