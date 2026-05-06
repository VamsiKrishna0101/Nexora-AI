import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { companyAPI, agentsAPI } from "../services/api";
import MegaAgentLoader from "../components/company/MegaAgentLoader";
import IntelligenceTabs from "../components/company/tabs/IntelligenceTabs";
import CompanyHeader from "../components/company/pages/Companyoverview"; // This exports default CompanyOverview actually
import "../styles/dashboard.css";
import { ChevronLeft, Share2, Download, Printer } from "lucide-react";
import ReportPPT from "../components/company/layout/ReportPPT";
import { generateCompanyPPT } from "../utils/company_pptx";
import { useRef } from "react";

export default function CompanyDeepDiveDashboard() {
  const { domain } = useParams<{ domain: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state?.searchData;

  const [status, setStatus] = useState<"gathering" | "analyzing" | "completed" | "error">("gathering");
  const [currentStep, setCurrentStep] = useState(0);
  const [reportData, setReportData] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const pptRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const startAnalysis = async () => {
    if (!domain) return;

    try {
      // PHASE 1: Data Gathering (Node Backend)
      setStatus("gathering");
      setCurrentStep(0);

      const gatherRes = await companyAPI.gatherCompany({
        domain,
        manual_linkedin_url: searchData?.linkedin_url
      });

      if (!gatherRes.data.success) {
        throw new Error("Intelligence gathering failed. Basic data sources unavailable.");
      }

      // Fetch core company stats for the header
      companyAPI.getData(domain).then(res => {
        if (res.data.success) setCompanyData(res.data.data);
      });

      // PHASE 2: Agentic Synthesis (Python Backend)
      setStatus("analyzing");
      setCurrentStep(1); // Starting Executive Brief

      // Simulated Progress because the actual call is blocking for 7-8 mins
      // We'll increment the step every 35-40 seconds to cover the ~7.5 min duration
      const progressInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < 10) return prev + 1;
          return prev;
        });
      }, 35000);

      const agentRes = await agentsAPI.generateFullReport(domain);

      clearInterval(progressInterval);

      if (!agentRes.data.success) {
        throw new Error(agentRes.data.errors?.[0] || "Agentic synthesis discontinued.");
      }

      setReportData(agentRes.data.full_report);
      setStatus("completed");
      setCurrentStep(12);

    } catch (err: any) {
      console.error("Deep Dive Error:", err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred during synthesis.");
    }
  };

  useEffect(() => {
    if (!domain) {
      navigate("/dashboard/company");
      return;
    }

    // If we don't have searchData (direct navigation), we might want to check if report already exists
    // For now, initiate the flow if searchData is present
    if (searchData) {
      startAnalysis();
    } else {
      // Check for existing report
      companyAPI.getFullReport(domain)
        .then(res => {
          if (res.data.success) {
            setReportData(res.data.data.report_data);
            setStatus("completed");
            // Also fetch company meta
            companyAPI.getData(domain).then(r => {
              if (r.data.success) setCompanyData(r.data.data);
            });
          } else {
            navigate("/dashboard/company");
          }
        })
        .catch(() => navigate("/dashboard/company"));
    }
  }, [domain]);

  if (status !== "completed") {
    return (
      <div className="deep-dive-page">
        <MegaAgentLoader
          currentStepIndex={currentStep}
          status={status}
          errorMsg={errorMessage}
        />
        {status === "error" && (
          <div className="error-actions" style={{ position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", zIndex: 10001 }}>
            <button className="btn-secondary-builder" onClick={() => navigate("/dashboard/company")}>
              Return to Safety
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="deep-dive-report-view">
      <div className="report-container" style={{ padding: "16px 28px 60px" }}>
        <div className="ir-wrap ir-identity-card">
          {/* IDENTITIY HEADER (Exact Replica of Image 2) */}
          <div className="ir-header" style={{ borderBottom: "none", padding: "24px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: "20px" }}>
                <div className="ir-logo-box" style={{ width: "56px", height: "56px", borderRadius: "12px", background: "#1a1a1a", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {companyData?.logo_url ? (
                    <img src={companyData.logo_url} alt={companyData.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "6px" }} />
                  ) : (
                    <span style={{ fontSize: "16px", color: "#e91e8c", fontWeight: "800" }}>{companyData?.name?.charAt(0) || domain.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.4px" }}>{companyData?.name || domain}</h1>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <span className="ir-tag" style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569" }}>{companyData?.industry || "Software"}</span>
                    <span className="ir-tag" style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569" }}>{companyData?.type || "Partnership"}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Social Buttons (Match Image 2) */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <a href={companyData?.socials?.linkedin_url || "#"} className="ir-action-circle" style={{ width: "32px", height: "32px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ color: "#0a66c2", fontSize: "14px", fontWeight: "bold" }}>in</div>
                  </a>
                  <a href={companyData?.socials?.twitter_url || "#"} className="ir-action-circle" style={{ width: "32px", height: "32px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#000" }}>X</div>
                  </a>
                </div>
                <button
                  className="ir-btn-primary"
                  style={{
                    height: "36px",
                    padding: "0 20px",
                    background: "#c0392b",
                    boxShadow: "0 1px 3px rgba(192, 57, 43, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: isExporting ? 0.7 : 1
                  }}
                  disabled={isExporting}
                  onClick={async () => {
                    setIsExporting(true);
                    try {
                      await generateCompanyPPT({
                          ...reportData, 
                          companyName: companyData?.name,
                          domain: domain,
                          logo_url: companyData?.logo_url
                      });
                    } catch(err) {
                        console.error(err);
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                >
                  <Download size={15} />
                  {isExporting ? "Generating Deck..." : "Export PPTX"}
                </button>
              </div>
            </div>

            <div className="ir-stats-row" style={{ marginTop: "20px", paddingTop: "0px", background: "none", borderTop: "1px solid #f1f5f9", margin: "24px -32px -0px" }}>
              <div className="ir-stat" style={{ textAlign: "left", padding: "14px 24px", borderRight: "1px solid #e2e8f0" }}>
                <label style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: "600", letterSpacing: "0.5px" }}>FOUNDED</label>
                <div className="value" style={{ fontSize: "17px", color: "#0f172a", fontWeight: "700" }}>{companyData?.founded_year || "2018"}</div>
              </div>
              <div className="ir-stat" style={{ textAlign: "left", padding: "14px 24px", borderRight: "1px solid #e2e8f0" }}>
                <label style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: "600", letterSpacing: "0.5px" }}>HEADQUARTERS</label>
                <div className="value" style={{ fontSize: "15px", color: "#0f172a", fontWeight: "700" }}>{companyData?.location?.city?.name || "Toronto, Canada"}</div>
              </div>
              <div className="ir-stat" style={{ textAlign: "left", padding: "14px 24px", borderRight: "1px solid #e2e8f0" }}>
                <label style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: "600", letterSpacing: "0.5px" }}>EMPLOYEES</label>
                <div className="value" style={{ fontSize: "17px", color: "#0f172a", fontWeight: "700" }}>{companyData?.employees || "51–200"}</div>
              </div>
              <div className="ir-stat" style={{ textAlign: "left", padding: "14px 24px", borderRight: "1px solid #e2e8f0" }}>
                <label style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: "600", letterSpacing: "0.5px" }}>REVENUE</label>
                <div className="value" style={{ fontSize: "17px", color: "#0f172a", fontWeight: "700" }}>{companyData?.revenue || "—"}</div>
              </div>
              <div className="ir-stat" style={{ textAlign: "left", padding: "14px 24px", borderRight: "none" }}>
                <label style={{ fontSize: "10.5px", color: "#94a3b8", fontWeight: "600", letterSpacing: "0.5px" }}>WEBSITE</label>
                <div className="value">
                  <a href={companyData?.website || "#"} target="_blank" rel="noreferrer" style={{ fontSize: "15px", color: "#c0392b", fontWeight: "600", textDecoration: "none" }}>Visit &nearr;</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <IntelligenceTabs reportData={reportData} leadersData={reportData.leaders_data} />
        </div>
      </div>

    </div>
  );
}
