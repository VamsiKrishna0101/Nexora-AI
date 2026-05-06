import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";
import { reportsAPI, insightsAPI } from "../services/api";
import ExecutivePersonaBuilder from "../components/persona/ExecutivePersonaBuilder";
import DeepDiveLoader from "../components/persona/DeepDiveLoader";
import "../styles/dashboard.css";

interface Report {
  id: string;
  domain: string;
  company_name: string;
  created_at: string;
  report_data?: any;
}

export default function PersonaList() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = () => {
    setLoading(true);
    reportsAPI.getAll()
      .then((res) => setReports(res.data.data || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (data: any) => {
    setIsGenerating(true);
    setError(null);

    // Extract linkedin_id (slug) for indexing
    let linkedinId = data.linkedin_url.split("/in/")[1]?.split("/")[0] || data.linkedin_url;
    
    try {
      // 1. Check if already exists for this user
      const checkRes = await reportsAPI.checkExisting(linkedinId);
      if (checkRes.data?.exists && checkRes.data.data?.id) {
        console.log("[Cache] Found existing report. Redirecting...");
        navigate(`/dashboard/personas/${checkRes.data.data.id}`);
        return;
      }

      // 2. Not in cache, call Agent API
      const res = await fetch("http://localhost:8001/api/persona/deep-dive", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("leo_token")}`
        },
        body: JSON.stringify({
            name: data.name,
            company: data.company,
            designation: data.designation,
            linkedin_url: data.linkedin_url,
            twitter_handle: data.twitter_handle
        })
      });

      const result = await res.json();

      if (result.success) {
        // 3. Save to our Node.js Backend
        const saveRes = await reportsAPI.save({
            domain: data.company,
            company_name: data.company,
            report_data: result,
            linkedin_id: linkedinId
        });

        if (saveRes.data?.success) {
            navigate(`/dashboard/personas/${saveRes.data.report.id}`);
        } else {
            setError("Failed to save dossier to local database.");
        }
      } else {
        setError(result.error || "Intelligence synthesis failed.");
      }
    } catch (err: any) {
        setError(err.message || "A network error occurred during analysis.");
    } finally {
        // Only stop generating if we didn't navigate away
        // If we stay, allow return to builder
        if (error) setIsGenerating(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (isGenerating) {
    return (
      <div className="persona-list-page" style={{ background: "#f8fafc" }}>
        <DeepDiveLoader isError={!!error} errorMsg={error || ""} />
      </div>
    );
  }

  return (
    <div className="persona-list-page">
      {/* Premium Builder Form */}
      <ExecutivePersonaBuilder 
        onGenerate={handleGenerate} 
        loading={isGenerating} 
      />

      {/* Grid Header */}
      <div className="recent-reports-header">
        <h2 className="recent-reports-title">Recently Generated Reports</h2>
        <div className="reports-count">{reports.length} Reports Found</div>
      </div>

      {/* Loading */}
      {loading && reports.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="dashboard-spinner" style={{ margin: "0 auto" }} />
        </div>
      )}

      {/* Empty State */}
      {!loading && reports.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={48} strokeWidth={1} /></div>
          <h2 className="empty-state-title">No intelligence dossiers found</h2>
          <p className="empty-state-desc">
            Use the Executive Persona Builder above to generate your first intelligence profile.
          </p>
        </div>
      )}

      {/* Persona Grid */}
      {!loading && reports.length > 0 && (
        <div className="persona-grid">
          {reports.map((report) => {
            const subject = report.report_data?.subject || {};
            const name = subject.name || report.company_name || "Unknown";
            const designation = subject.designation || "Executive";
            const company = subject.company || report.domain;

            return (
              <div
                key={report.id}
                className="persona-card"
                onClick={() => navigate(`/dashboard/personas/${report.id}`)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div className="persona-card-avatar">{getInitials(name)}</div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
                <h3 className="persona-card-name">{name}</h3>
                <p className="persona-card-role">{designation} · {company}</p>
                <div className="persona-card-footer">
                  <span className="persona-card-date">{formatDate(report.created_at)}</span>
                  <span className="persona-chip">Deep Dive</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
