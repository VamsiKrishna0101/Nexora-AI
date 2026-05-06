import React, { useState, useEffect } from "react";
import { Search, RotateCcw, Link, MessageSquare, Building2, User2, Briefcase, Loader2, Globe } from "lucide-react";
import { companyAPI } from "../../services/api";

interface BuilderProps {
  onGenerate: (data: {
    name: string;
    company: string;
    designation: string;
    linkedin_url: string;
    twitter_handle?: string;
  }) => void;
  loading: boolean;
}


export default function ExecutivePersonaBuilder({ onGenerate, loading }: BuilderProps) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    designation: "",
    linkedin_url: "",
    twitter_handle: ""
  });

  interface Suggestion {
    name: string;
    domain: string;
    logo_url?: string;
  }

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Executive name is required";
    if (!formData.company) newErrors.company = "Company name is required";
    if (!formData.linkedin_url) newErrors.linkedin_url = "LinkedIn URL is mandatory";
    else if (!formData.linkedin_url.includes("linkedin.com/")) {
      newErrors.linkedin_url = "Invalid LinkedIn URL";
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
      company: "",
      designation: "",
      linkedin_url: "",
      twitter_handle: ""
    });
    setErrors({});
  };

  // Real-time Name Search Suggestions
  useEffect(() => {
    const name = formData.company.trim();
    if (name.length >= 2 && !showSuggestions) {
      const timer = setTimeout(async () => {
        setLoadingSuggestions(true);
        try {
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
  }, [formData.company]);

  const selectSuggestion = (s: Suggestion) => {
    setFormData({
      ...formData,
      company: s.name,
      // Auto-fill designation or other fields if possible? No, usually just company
    });
    setShowSuggestions(false);
  };

  return (
    <div className="persona-builder-card">
      <div className="builder-header">
        <div className="builder-title-group">
          <h1 className="builder-main-title">Executive Persona Builder</h1>
          <p className="builder-subtitle">Generate AI-powered executive profiles with personality insights</p>
        </div>
      </div>

      <form className="builder-framer" onSubmit={handleSubmit}>
        <div className="builder-section-label">
          <span className="label-bar" /> Search Filters
        </div>

        <div className="builder-grid">
          <div className="builder-field" style={{ position: "relative" }}>
            <label>Company Name</label>
            <div className={`input-wrapper ${errors.company ? 'has-error' : ''}`}>
              <Building2 size={16} className="field-icon" />
              <input
                type="text"
                placeholder="Search companies..."
                value={formData.company}
                onChange={(e) => {
                  setFormData({ ...formData, company: e.target.value });
                  setShowSuggestions(false);
                }}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              />
              {loadingSuggestions && <Loader2 size={14} className="spin" style={{ marginRight: 8, color: "#94a3b8" }} />}
            </div>

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

          {/* Executive Name */}
          <div className="builder-field">
            <label>Executive Name</label>
            <div className={`input-wrapper ${errors.name ? 'has-error' : ''}`}>
              <User2 size={16} className="field-icon" />
              <input
                type="text"
                placeholder="Enter executive name..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="builder-field">
            <label>Designation Level</label>
            <div className="input-wrapper">
              <Briefcase size={16} className="field-icon" />
              <input
                type="text"
                placeholder="Enter designation (e.g. CEO)..."
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
          </div>

          {/* LinkedIn URL */}
          <div className="builder-field">
            <label>LinkedIn URL</label>
            <div className={`input-wrapper ${errors.linkedin_url ? 'has-error' : ''}`}>
              <Link size={16} className="field-icon" />
              <input
                type="text"
                placeholder="Enter LinkedIn URL..."
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
            <button type="submit" className="btn-primary-builder" disabled={loading}>
              <Search size={18} />
              {loading ? "Generating..." : "Generate Analysis"}
            </button>
            <button type="button" className="btn-secondary-builder" onClick={handleReset}>
              <RotateCcw size={16} />
              Reset Filters
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
