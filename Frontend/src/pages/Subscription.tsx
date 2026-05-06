import React, { useState } from "react";
import { Check, Star } from "lucide-react";
import "../styles/Subscription.css";

export default function Subscription() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  return (
    <div className="sub-root">
      <div className="sub-header">
        <h1 className="sub-title">Upgrade Your Intelligence Arsenal</h1>
        <p className="sub-desc">
          Choose the tier that fits your scale. Go annual to save 20% across all plans.
        </p>

        <div className="sub-toggle-wrapper">
          <div className="sub-toggle-bg">
            <button
              className={`sub-toggle-btn ${billingCycle === "monthly" ? "active" : ""}`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`sub-toggle-btn ${billingCycle === "annual" ? "active" : ""}`}
              onClick={() => setBillingCycle("annual")}
            >
              Annual
            </button>
          </div>
        </div>
      </div>

      <div className="sub-pricing-grid">
        {/* Starter Plan */}
        <div className="sub-card">
          <div className="sub-card-top">
            <h3 className="sub-plan-name">Starter</h3>
            <p className="sub-plan-ideal">For agile teams and boutiques</p>
            <div className="sub-price-block">
              <span className="sub-currency">$</span>
              <span className="sub-price">{billingCycle === "annual" ? "49" : "59"}</span>
              <span className="sub-interval">/mo</span>
            </div>
            {billingCycle === "annual" && (
              <div className="sub-billed-annually">Billed $588 yearly</div>
            )}
            <button className="sub-action-btn">Subscribe to Starter</button>
          </div>
          
          <div className="sub-features">
            <p className="sub-features-title">What's included</p>
            <ul className="sub-feature-list">
              <li><Check size={16} className="feature-icon" /> 100 Company Profiles / month</li>
              <li><Check size={16} className="feature-icon" /> Basic Executive Discovery</li>
              <li><Check size={16} className="feature-icon" /> Standard Market News Updates</li>
              <li><Check size={16} className="feature-icon" /> Email Support</li>
            </ul>
          </div>
        </div>

        {/* Professional / Premium Plan */}
        <div className="sub-card popular-card">
          <div className="popular-badge">
            <Star size={14} fill="#c8a96e" /> Most Popular
          </div>
          <div className="sub-card-top">
            <h3 className="sub-plan-name">Professional</h3>
            <p className="sub-plan-ideal">For aggressive growth strategies</p>
            <div className="sub-price-block">
              <span className="sub-currency">$</span>
              <span className="sub-price">{billingCycle === "annual" ? "149" : "179"}</span>
              <span className="sub-interval">/mo</span>
            </div>
            {billingCycle === "annual" && (
              <div className="sub-billed-annually">Billed $1,788 yearly</div>
            )}
            <button className="sub-action-btn primary">Start Free 7-Day Trial</button>
          </div>

          <div className="sub-features">
            <p className="sub-features-title">Everything in Starter, plus</p>
            <ul className="sub-feature-list">
              <li><Check size={16} className="feature-icon highlight" /> Unlimited Company Profiles</li>
              <li><Check size={16} className="feature-icon highlight" /> Agentic Deep Dive Analysis</li>
              <li><Check size={16} className="feature-icon highlight" /> Full Executive Personas</li>
              <li><Check size={16} className="feature-icon highlight" /> Relationship Mapping Access</li>
              <li><Check size={16} className="feature-icon highlight" /> Export to PDF & CSV</li>
            </ul>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="sub-card">
          <div className="sub-card-top">
            <h3 className="sub-plan-name">Enterprise</h3>
            <p className="sub-plan-ideal">For institutional dominance</p>
            <div className="sub-price-block">
              <span className="sub-price custom">Custom</span>
            </div>
            <div className="sub-billed-annually">Tailored to your bespoke workflows</div>
            <button className="sub-action-btn outline">Contact Sales</button>
          </div>

          <div className="sub-features">
            <p className="sub-features-title">Everything in Professional, plus</p>
            <ul className="sub-feature-list">
              <li><Check size={16} className="feature-icon" /> Raw API Access</li>
              <li><Check size={16} className="feature-icon" /> Custom AI Knowledge Integration</li>
              <li><Check size={16} className="feature-icon" /> Whitelabel Reporting Options</li>
              <li><Check size={16} className="feature-icon" /> Dedicated Account Manager</li>
              <li><Check size={16} className="feature-icon" /> Enterprise SLA & Security</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
