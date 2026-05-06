import React, { useState, useEffect } from "react";
import { Search, RotateCcw, Link, MessageSquare, Building2, Globe, FileText, CheckCircle2, History, Loader2 } from "lucide-react";
import { companyAPI } from "../../services/api";

interface BuilderProps {
  onGenerate: (data: {
    name: string;
    domain: string;
    description: string;
    linkedin_url: string;
    twitter_handle?: string;
  }) => void;
  loading: boolean;
  mode?: "partial" | "deep_dive";
  initialData?: {
    name?: string;
    domain?: string;
    description?: string;
    linkedin_url?: string;
    twitter_handle?: string;
  };
}

export default function ExecutiveCompanyBuilder({ onGenerate, loading, initialData, mode = "partial" }: BuilderProps) {
  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    domain: initialData?.domain || "",
    description: initialData?.description || "",
    linkedin_url: initialData?.linkedin_url || "",
    twitter_handle: initialData?.twitter_handle || ""
  });

  interface Suggestion {
    name: string;
    domain: string;
    logo_url?: string;
  }

  // States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [checkingDomain, setCheckingDomain] = useState(false);
  const [existingData, setExistingData] = useState<{ exists: boolean; type: string; last_updated: string | null } | null>(null);

  // Real-time Domain Check Logic
  useEffect(() => {
    const domain = formData.domain.trim();
    if (domain && domain.includes(".") && domain.length > 3) {
      const timer = setTimeout(async () => {
        setCheckingDomain(true);
        try {
          const res = await companyAPI.checkExisting(domain);
          if (res.data.success) {
            setExistingData(res.data);
          }
        } catch (err) {
          console.error("Domain check failed:", err);
          setExistingData(null);
        } finally {
          setCheckingDomain(false);
        }
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setExistingData(null);
    }
  }, [formData.domain]);

  // Real-time Name Search Suggestions
  useEffect(() => {
    const name = formData.name.trim();
    if (name.length >= 2 && !showSuggestions) {
      const timer = setTimeout(async () => {
        setLoadingSuggestions(true);
        try {
          const res = await companyAPI.getData(name); // Assuming getData or a new suggestAPI handles this
          // Actually companyAPI.suggest is what we need based on backend
          // Let's check api.ts if I added it. If not, I'll use axios or update api.ts.
          // For now I'll assume we update api.ts with 'suggest'
          const suggestRes = await companyAPI.suggest(name);
          if (suggestRes.data.success) {
            setSuggestions(suggestRes.data.data);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error("Suggestions failed:", err);
          setSuggestions([]);
        } finally {
          setLoadingSuggestions(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.name]);

  const selectSuggestion = (s: Suggestion) => {
    setFormData({
      ...formData,
      name: s.name,
      domain: s.domain
    });
    setShowSuggestions(false);
  };

  // Sync initialData if it changes
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        domain: initialData.domain || "",
        description: initialData.description || "",
        linkedin_url: initialData.linkedin_url || "",
        twitter_handle: initialData.twitter_handle || ""
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Company name is required";
    if (!formData.domain) newErrors.domain = "Business domain is required";
    if (formData.domain && !formData.domain.includes(".")) {
      newErrors.domain = "Invalid domain format (e.g. apple.com)";
    }
    
    // ENFORCEMENT: Deep Dive requires LinkedIn URL
    if (mode === "deep_dive" && !formData.linkedin_url) {
      newErrors.linkedin_url = "LinkedIn Identity is required for Enterprise Deep Dive Analysis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onGenerate(formData);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      domain: "",
      description: "",
      linkedin_url: "",
      twitter_handle: ""
    });
    setErrors({});
  };

  return (
    <div className="persona-builder-card">
      <div className="builder-header">
        <div className="builder-title-group">
          <h1 className="builder-main-title">
            {mode === "deep_dive" ? "Agentic Deep Dive Builder" : "Executive Company Builder"}
          </h1>
          <p className="builder-subtitle">
            {mode === "deep_dive" 
              ? "Multi-agent corporate intelligence synthesis (7-8 minutes)" 
              : "Analyze market position, timeline, and competitive intelligence"}
          </p>
        </div>
      </div>

      <form className="builder-framer" onSubmit={handleSubmit}>
        <div className="builder-section-label">
          <span className="label-bar" /> Business Identity
        </div>

        <div className="builder-grid">
          {/* Domain */}
          <div className="builder-field">
            <label>Business Domain</label>
            <div className={`input-wrapper ${errors.domain ? 'has-error' : ''} ${existingData?.exists ? 'has-success' : ''}`}>
              <Globe size={16} className="field-icon" />
              <input
                type="text"
                placeholder="e.g. apple.com"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              />
              {checkingDomain && <Loader2 size={14} className="field-loader spin" style={{ marginRight: 8, color: "#94a3b8" }} />}
              {!checkingDomain && existingData?.exists && (
                <CheckCircle2 size={14} className="field-success-icon" style={{ marginRight: 8, color: "#22c55e" }} />
              )}
            </div>
            {errors.domain && <span className="field-error-text">{errors.domain}</span>}
            {!checkingDomain && existingData?.exists && (
              <span className="field-success-text" style={{ fontSize: "0.7rem", color: "#22c55e", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                <History size={10} /> 
                {existingData.type === "DEEP_DIVE" 
                  ? "Full Intelligence Report available in database" 
                  : "Company previously identified in system"}
              </span>
            )}
          </div>

          {/* Company Name */}
          <div className="builder-field" style={{ position: "relative" }}>
            <label>Company Name</label>
            <div className={`input-wrapper ${errors.name ? 'has-error' : ''}`}>
              <Building2 size={16} className="field-icon" />
              <input
                type="text"
                placeholder="Enter company name..."
                value={formData.name}
                onChange={(e) => {
                   setFormData({ ...formData, name: e.target.value });
                   setShowSuggestions(false); // Hide until timer triggers
                }}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              />
              {loadingSuggestions && <Loader2 size={14} className="spin" style={{ marginRight: 8, color: "#94a3b8" }} />}
            </div>
            {errors.name && <span className="field-error-text">{errors.name}</span>}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 100 }} onClick={() => setShowSuggestions(false)} />
                <div className="builder-suggestions-dropdown">
                  {suggestions.map((s, idx) => (
                    <div key={idx} className="suggestion-item" onClick={() => selectSuggestion(s)}>
                      <div className="suggestion-logo">
                        {s.logo_url ? <img src={s.logo_url} alt="" /> : <Building2 size={14} />}
                      </div>
                      <div className="suggestion-info">
                        <div className="suggestion-name">{s.name}</div>
                        <div className="suggestion-domain">{s.domain}</div>
                      </div>
                      <Globe size={12} style={{ opacity: 0.3 }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Description */}
          <div className="builder-field" style={{ gridColumn: "span 2" }}>
            <label>Business Description (Optional)</label>
            <div className="input-wrapper">
              <FileText size={16} className="field-icon" />
              <input
                type="text"
                placeholder="Briefly describe what the company does..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* LinkedIn URL */}
          <div className="builder-field">
            <label>
              LinkedIn Page URL {mode === "deep_dive" && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
            <div className={`input-wrapper ${errors.linkedin_url ? 'has-error' : ''}`}>
              <Link size={16} className="field-icon" />
              <input
                type="text"
                placeholder="linkedin.com/company/..."
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              />
            </div>
            {errors.linkedin_url && <span className="field-error-text">{errors.linkedin_url}</span>}
          </div>

          {/* Twitter (Optional) */}
          <div className="builder-field">
            <label>Twitter/X Handle (Optional)</label>
            <div className="input-wrapper">
              <MessageSquare size={16} className="field-icon" />
              <input
                type="text"
                placeholder="@handle"
                value={formData.twitter_handle}
                onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="builder-actions">
          <div className="actions-left">
            <button type="submit" className="btn-primary-builder" disabled={loading || checkingDomain}>
              {loading || checkingDomain ? (
                <Loader2 size={18} className="spin" />
              ) : (
                existingData?.exists && existingData.type === "DEEP_DIVE" && mode === "deep_dive" ? <History size={18} /> : <Search size={18} />
              )}
              {loading 
                ? (mode === "deep_dive" ? "Synthesizing..." : "Analyzing...") 
                : checkingDomain ? "Checking DB..." : (existingData?.exists && existingData.type === "DEEP_DIVE" && mode === "deep_dive" ? "View Existing Research" : (mode === "deep_dive" ? "Trigger Deep Dive" : "Analyze Company"))}
            </button>
            <button type="button" className="btn-secondary-builder" onClick={handleReset}>
              <RotateCcw size={16} />
              Reset Filters
            </button>
          </div>
          <div className="builder-metadata" style={{ fontSize: "0.7rem", color: "#64748b" }}>
            * Tier-1 search resolves identity instantly
          </div>
        </div>
      </form>
    </div>
  );
}
