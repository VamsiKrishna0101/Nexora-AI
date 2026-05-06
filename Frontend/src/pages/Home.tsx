import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Users, BrainCircuit } from "lucide-react";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-root">
      <div className="home-hero">
        <h1 className="home-title">Welcome to Nexora AI</h1>
        <h2 className="home-subtitle">Your AI Research Command Center</h2>
        <p className="home-desc">
          Access every intelligence module from one unified workspace.
        </p>
      </div>

      <div className="home-cards-container">
        {/* Companies Card */}
        <div className="home-node-card">
          <div className="home-card-header">
            <div className="home-icon-badge badge-blue">
              <Building2 size={24} color="#0284c7" />
            </div>
            <h3 className="home-card-title">Companies</h3>
            <p className="home-card-desc">
              Search and profile companies — view firmographics, financials, peers, and IT stack.
            </p>
          </div>
          <button 
            className="home-card-btn" 
            onClick={() => navigate("/dashboard/company")}
          >
            Open Module
          </button>
        </div>

        {/* Executives Card */}
        <div className="home-node-card">
          <div className="home-card-header">
            <div className="home-icon-badge badge-purple">
              <Users size={24} color="#7c3aed" />
            </div>
            <h3 className="home-card-title">Executives</h3>
            <p className="home-card-desc">
              Discover key executives, view contacts, and build AI-powered persona profiles.
            </p>
          </div>
          <button 
            className="home-card-btn" 
            onClick={() => navigate("/dashboard/personas")}
          >
            Open Module
          </button>
        </div>

        {/* AI Insights Card */}
        <div className="home-node-card">
          <div className="home-card-header">
            <div className="home-icon-badge badge-orange">
              <BrainCircuit size={24} color="#ea580c" />
            </div>
            <h3 className="home-card-title">AI Insights</h3>
            <p className="home-card-desc">
              Generate deep-dive agentic reports, SWOT analysis, and competitive landscape intelligence.
            </p>
          </div>
          <button 
            className="home-card-btn" 
            onClick={() => navigate("/dashboard/insights")}
          >
            Open Module
          </button>
        </div>
      </div>
    </div>
  );
}
