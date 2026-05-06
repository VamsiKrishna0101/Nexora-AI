import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2, ChevronRight, Globe, Database } from "lucide-react";
import { companyAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ExecutiveCompanyBuilder from "../components/company/ExecutiveCompanyBuilder";
import "../styles/dashboard.css";

interface SavedCompany {
  id: string;
  domain: string;
  company_name: string;
  logo_url?: string;
  description?: string;
  report_type: "PARTIAL" | "DEEP_DIVE";
  created_at: string;
}

export default function CompanyList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefillData = location.state?.prefillData;
  const mode = location.state?.mode || "partial";

  const [companies, setCompanies] = useState<SavedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = () => {
    setLoading(true);
    companyAPI.getMy()
      .then((res) => setCompanies(res.data.data || []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleGenerate = (data: any) => {
    if (mode === "deep_dive") {
      navigate(`/dashboard/company/${data.domain}/deep-dive`, { state: { searchData: data } });
    } else {
      navigate(`/dashboard/company/${data.domain}`, { state: { initialData: data } });
    }
  };

  const deepDives = companies.filter(c => c.report_type === "DEEP_DIVE");
  const partials = companies.filter(c => c.report_type === "PARTIAL");

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="persona-list-page">
      <ExecutiveCompanyBuilder 
        onGenerate={handleGenerate} 
        loading={isGenerating}
        mode={mode as any}
        initialData={prefillData}
      />

      <div className="recent-reports-header" style={{ marginTop: 40 }}>
        <h2 className="recent-reports-title">Enterprise Deep Dives</h2>
        <div className="reports-count">{deepDives.length} Reports Found</div>
      </div>
      
      {deepDives.length === 0 && (
        <div className="empty-state" style={{ padding: "40px 0" }}>
          <div className="empty-state-icon"><Database size={32} strokeWidth={1} /></div>
          <p className="empty-state-desc">No deep-dive reports generated yet.</p>
        </div>
      )}

      {deepDives.length > 0 && (
        <div className="persona-grid">
          {deepDives.map((comp) => (
            <div
              key={comp.id}
              className="persona-card"
              style={{ borderLeft: "4px solid #ef4444" }}
              onClick={() => navigate(`/dashboard/company/${comp.domain}/deep-dive`)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                {comp.logo_url ? (
                  <img src={comp.logo_url} alt={comp.company_name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain" }} />
                ) : (
                  <div className="persona-card-avatar" style={{ background: "#fef2f2", color: "#ef4444" }}>
                    {getInitials(comp.company_name)}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                   <div className="persona-chip" style={{ background: "#fef2f2", color: "#ef4444", fontWeight: 600 }}>Enterprise</div>
                   <ChevronRight size={16} color="#94a3b8" />
                </div>
              </div>

              <h3 className="persona-card-name" style={{ marginTop: 12 }}>{comp.company_name}</h3>
              <p className="persona-card-role" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Globe size={11} /> {comp.domain}
              </p>
              <div className="persona-card-footer">
                <span className="persona-card-date">Generated {formatDate(comp.created_at)}</span>
                <span className="persona-chip" style={{ background: "#0f172a", color: "#fff" }}>Report</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="recent-reports-header" style={{ marginTop: 24 }}>
        <h2 className="recent-reports-title">Recent Company Previews</h2>
        <div className="reports-count">{partials.length} Intelligence Previews</div>
      </div>

      {loading && partials.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="dashboard-spinner" style={{ margin: "0 auto" }} />
        </div>
      )}

      {!loading && partials.length === 0 && (
        <div className="empty-state" style={{ padding: "40px 0" }}>
          <div className="empty-state-icon"><Building2 size={32} strokeWidth={1} /></div>
          <p className="empty-state-desc">Your company search history will appear here.</p>
        </div>
      )}

      {!loading && partials.length > 0 && (
        <div className="persona-grid">
          {partials.map((comp) => (
            <div
              key={comp.id}
              className="persona-card"
              onClick={() => navigate(`/dashboard/company/${comp.domain}`)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                {comp.logo_url ? (
                  <img src={comp.logo_url} alt={comp.company_name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain" }} />
                ) : (
                  <div className="persona-card-avatar">{getInitials(comp.company_name)}</div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                   <button 
                     className="persona-chip" 
                     style={{ cursor: "pointer", background: "#f1f5f9", color: "#64748b" }}
                     onClick={(e) => {
                       e.stopPropagation();
                       navigate("/dashboard/company", { state: { prefillData: {
                         name: comp.company_name,
                         domain: comp.domain,
                         description: comp.description
                       }}});
                     }}
                   >
                     Seed Builder
                   </button>
                   <ChevronRight size={16} color="#94a3b8" />
                </div>
              </div>

              <h3 className="persona-card-name" style={{ marginTop: 12 }}>{comp.company_name}</h3>
              <p className="persona-card-role" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Globe size={11} /> {comp.domain}
              </p>
              <div className="persona-card-footer">
                <span className="persona-card-date">Searched {formatDate(comp.created_at)}</span>
                <span className="persona-chip" style={{ background: "#fef2f2", color: "#ef4444" }}>Preview</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

