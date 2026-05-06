import React, { useState } from "react";
import { User, Lock, Bell, Shield, Wallet, Save } from "lucide-react";
import "../styles/Settings.css";
import { useAuth } from "../context/AuthContext";

type SettingsTab = "profile" | "security" | "notifications" | "billing";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 800);
  };

  return (
    <div className="settings-root">
      <div className="settings-header">
        <h1 className="settings-title">Account Settings</h1>
        <p className="settings-subtitle">Manage your account preferences and security settings.</p>
      </div>

      <div className="settings-container">
        {/* Sidebar Tabs */}
        <aside className="settings-tabs">
          <button 
            className={`tab-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={18} />
            <span>Profile</span>
          </button>
          <button 
            className={`tab-item ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Lock size={18} />
            <span>Security</span>
          </button>
          <button 
            className={`tab-item ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={18} />
            <span>Notifications</span>
          </button>
          <button 
            className={`tab-item ${activeTab === "billing" ? "active" : ""}`}
            onClick={() => setActiveTab("billing")}
          >
            <Wallet size={18} />
            <span>Billing</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="settings-content">
          {activeTab === "profile" && (
            <div className="settings-section">
              <h3>Personal Information</h3>
              <div className="settings-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" defaultValue={user?.name || ""} placeholder="John Doe" />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" defaultValue={user?.email || ""} placeholder="john@company.com" disabled />
                  <span className="helper-text">Email cannot be changed directly.</span>
                </div>
                <div className="input-group" style={{ gridColumn: "span 2" }}>
                  <label>Bio</label>
                  <textarea placeholder="Tell us about yourself..." rows={4}></textarea>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="settings-section">
              <h3>Security & Password</h3>
              <div className="settings-grid">
                <div className="input-group" style={{ gridColumn: "span 2" }}>
                  <label>Current Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="input-group">
                  <label>New Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="input-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="security-tip">
                <Shield size={16} />
                <span>Two-factor authentication is recommended for higher security.</span>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="settings-section">
              <h3>Notification Preferences</h3>
              <div className="checkbox-list">
                <label className="checkbox-item">
                  <input type="checkbox" defaultChecked />
                  <div className="checkbox-text">
                    <span className="check-title">Report Completion</span>
                    <span className="check-desc">Get notified when a deep-dive report is finished.</span>
                  </div>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" defaultChecked />
                  <div className="checkbox-text">
                    <span className="check-title">Market Alerts</span>
                    <span className="check-desc">Daily summary of important triggers and news.</span>
                  </div>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" />
                  <div className="checkbox-text">
                    <span className="check-title">Weekly Insights</span>
                    <span className="check-desc">Trends and competitive movements summary.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="settings-section">
              <h3>Billing History</h3>
              <p className="settings-empty">No transactions found. View your <a href="/dashboard/subscription">subscription plans</a>.</p>
            </div>
          )}

          <div className="settings-footer">
            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
