import { Search, Bell, CreditCard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import axios from "axios";

interface Suggestion {
  name: string;
  domain: string;
  logo?: string;
}

export default function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>("");

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  // Fetch suggestions from Clearbit autocomplete
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`
        );
        setSuggestions(res.data.slice(0, 6));
        setShowDropdown(true);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleCompanyClick = (suggestion: Suggestion) => {
    // Navigate to the company dashboard directly using the domain from Clearbit
    navigate(`/dashboard/company/${suggestion.domain}`);
    setShowDropdown(false);
    setQuery("");
  };


  return (
    <header className="topbar">
      {/* Search */}
      <div className="topbar-search" ref={wrapperRef} style={{ position: "relative" }}>
        <Search size={14} className="topbar-search-icon" />
        <input
          type="text"
          placeholder="Search companies, executives, or keywords..."
          className="topbar-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        />

        {/* Dropdown */}
        {showDropdown && (
          <div className="search-dropdown">
            {loading ? (
              <div className="search-dropdown-loading">Searching...</div>
            ) : suggestions.length === 0 ? (
              <div className="search-dropdown-empty">No results found</div>
            ) : (
              suggestions.map((s) => (
                <button
                  key={s.domain}
                  className="search-dropdown-item"
                  onMouseDown={() => handleCompanyClick(s)}
                >
                  {s.logo ? (
                    <img
                      src={s.logo}
                      alt={s.name}
                      className="search-dropdown-logo"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="search-dropdown-logo-fallback">
                      {s.name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="search-dropdown-text">
                    <span className="search-dropdown-name">{s.name}</span>
                    <span className="search-dropdown-domain">{s.domain}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="topbar-right">
        <div className="topbar-credits">
          <CreditCard size={13} />
          <span>582 Credits</span>
        </div>
        <button className="topbar-icon-btn" title="Notifications">
          <Bell size={15} />
          <span className="topbar-notif-dot" />
        </button>
        <button className="topbar-avatar" title={user?.name || "Profile"}>
          {initials}
        </button>
      </div>
    </header>
  );
}