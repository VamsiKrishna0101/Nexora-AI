import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { companyAPI } from "../services/api";
import CompanyOverview from "../components/company/pages/Companyoverview";
import type { CompanyData, TimelineData, NewsData, CompetitorsData } from "../components/company/pages/Companyoverview";
import KrishLoader from "../components/company/KrishLoader";

export default function CompanyDashboard() {
  const { domain } = useParams<{ domain: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // States for tiered loading
  const [tier1Loading, setTier1Loading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [news, setNews] = useState<NewsData | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorsData | null>(null);

  const fetchIntelligence = async (targetDomain: string) => {
    setTier1Loading(true);
    setError(null);
    
    try {
      // ── TIER 1: Identity Resolution ──
      const t1Res = await companyAPI.getData(targetDomain);
      if (!t1Res.data?.success) throw new Error("Could not resolve company identity.");
      
      const compData = t1Res.data.data;
      setCompany(compData);
      setTier1Loading(false); // Identity found! Show the dashboard immediately with skeletons for others

      // ── TIER 2: Parallel Deep Analysis ──
      const meta = {
        company_name: compData.name,
        domain: targetDomain,
        description: compData.description || compData.seo_description || ""
      };

      // Firing parallel calls but not awaiting all of them together 
      // so we can "pop" them in as they arrive
      
      companyAPI.getTimeline(meta)
        .then(res => setTimeline(res.data?.data))
        .catch(err => console.error("Timeline failed:", err));

      companyAPI.getNews(meta)
        .then(res => setNews(res.data))
        .catch(err => console.error("News failed:", err));

      companyAPI.getCompetitors(meta)
        .then(res => setCompetitors(res.data))
        .catch(err => console.error("Competitors failed:", err));

    } catch (err: any) {
      setError(err.message || "Failed to conduct company intelligence synthesis.");
      setTier1Loading(false);
    }
  };

  useEffect(() => {
    if (domain) {
      fetchIntelligence(domain);
    }
  }, [domain]);

  if (tier1Loading) {
    return (
      <div className="persona-list-page" style={{ background: "#f8fafc", minHeight: "100vh" }}>
        <KrishLoader isError={!!error} errorMsg={error || ""} />
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="persona-list-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
         <KrishLoader isError={true} errorMsg={error} />
      </div>
    );
  }

  return (
    <div className="persona-list-page" style={{ padding: 0 }}>
       <CompanyOverview 
         company={company}
         timeline={timeline}
         news={news}
         competitors={competitors}
         onDeepDive={() => {
          navigate("/dashboard/company", { 
            state: { 
              mode: "deep_dive",
              prefillData: {
                name: company?.name,
                domain: domain,
                description: company?.description || company?.seo_description,
                linkedin_url: company?.linkedin_url
              } 
            } 
          });
        }}

       />
    </div>
  );
}
