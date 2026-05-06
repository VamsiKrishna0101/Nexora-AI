import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Search, Plus, Trash2, Cpu, BarChart3, Users, Zap, AlertCircle, FileText, Briefcase, ChevronRight, GitBranch, Dna, Award, ShieldAlert, Scale, ArrowLeft, Brain } from "lucide-react";
import { reportsAPI, compareAPI } from "../services/api";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import SnapshotTab from "../components/compare/tabs/SnapshotTab";
import BehaviorTab from "../components/compare/tabs/BehaviorTab";
import CareerSkillsTab from "../components/compare/tabs/CareerSkillsTab";
import InfluenceEngagementTab from "../components/compare/tabs/InfluenceEngagementTab";
import RiskVerdictTab from "../components/compare/tabs/RiskVerdictTab";
import { useNavigate } from "react-router-dom";

import "../styles/compare.css";

interface Report {
  id: string;
  domain: string;
  company_name: string;
  report_data: any;
  created_at: string;
}

interface SelectedReport {
  id: string;
  name: string;
  type: "persona" | "company";
  data: any;
}

export default function Compare() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [slotA, setSlotA] = useState<SelectedReport | null>(null);
  const [slotB, setSlotB] = useState<SelectedReport | null>(null);

  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'selection' | 'result'>('selection');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const resp = await reportsAPI.getAll();
      if (resp.data.success) {
        setReports(resp.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (destination.droppableId === "slotA" || destination.droppableId === "slotB") {
      const report = reports.find(r => r.id === draggableId);
      if (!report) return;

      const type = report.report_data?.subject?.name ? "persona" : "company";
      const name = report.report_data?.subject?.name || report.company_name;
      const selected: SelectedReport = { id: report.id, name, type, data: report.report_data };

      const otherSlot = destination.droppableId === "slotA" ? slotB : slotA;

      // Block same report in both slots
      if (otherSlot && otherSlot.id === report.id) {
        setError("You can't compare a report with itself. Pick a different one.");
        return;
      }

      // Block type mismatch
      if (otherSlot && otherSlot.type !== type) {
        setError(`Type mismatch: You must compare ${type} to ${type}.`);
        return;
      }

      setError(null);
      if (destination.droppableId === "slotA") setSlotA(selected);
      else setSlotB(selected);
    }
  };

  const handleCompare = async () => {
    if (!slotA || !slotB) return;
    setComparing(true);
    setError(null);

    try {
      const existingResp = await compareAPI.findExisting(slotA.id, slotB.id);
      if (existingResp.data.success && existingResp.data.comparison) {
        setResult(existingResp.data.comparison.comparison_data);
        setViewMode('result');
        setComparing(false);
        return;
      }

      const triggerResp = await compareAPI.triggerPersonaCompare(slotA.id, slotB.id);
      if (triggerResp.data.success) {
        const resultData = triggerResp.data.data;
        setResult(resultData);
        setViewMode('result');
        await compareAPI.save({
          report1_id: slotA.id,
          report2_id: slotB.id,
          comparison_data: resultData
        });
      } else {
        setError(triggerResp.data.error || "Comparison failed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Error during comparison flow.");
    } finally {
      setComparing(false);
    }
  };

  const filteredReports = (reports || []).filter(r =>
    (r.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.report_data?.subject?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`compare-page ${viewMode}`}>
      {viewMode === 'selection' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          {/* ── Sidebar ── */}
          <div className="compare-sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Report Library</h2>
              <div className="report-search-box">
                <Search size={14} className="report-search-icon" />
                <input
                  type="text"
                  className="report-search-input"
                  placeholder="Search reports..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <Droppable droppableId="library" isDropDisabled={true}>
              {(provided) => (
                <div className="report-list" {...provided.droppableProps} ref={provided.innerRef}>
                  {loading ? (
                    <div className="text-center py-10 text-slate-400 text-[11px]">Syncing intelligence...</div>
                  ) : filteredReports.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <div className="text-slate-300 mb-2"><FileText size={24} className="mx-auto opacity-20" /></div>
                      <div className="text-slate-400 text-[11px]">No matching reports found.</div>
                      <div className="text-[10px] text-slate-300 mt-1 italic">Try searching by company or name.</div>
                    </div>
                  ) : filteredReports.map((report, index) => (
                    <Draggable key={report.id} draggableId={report.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          className={`draggable-report-card ${snapshot.isDragging ? "is-dragging" : ""}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            borderLeft: report.report_data?.subject?.name ? "3px solid #c8a96e" : "3px solid #3b7dd8"
                          }}
                        >
                          <div className="report-card-name">
                            {report.report_data?.subject?.name || report.company_name}
                          </div>
                          <div className="report-card-meta flex items-center justify-between">
                            <span>{report.report_data?.subject?.name ? "Persona" : "Company"}</span>
                            <span className="opacity-60">{report.domain}</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* ── Workspace ── */}
          <div className="compare-workspace">
            {/* Drop slots row */}
            <div className="drop-zones-row">
              <DropSlot
                id="slotA"
                label="Subject A"
                selected={slotA}
                onClear={() => { setSlotA(null); setResult(null); setError(null); }}
              />
              <div className="vs-badge-container">
                <div className="vs-badge">VS</div>
              </div>
              <DropSlot
                id="slotB"
                label="Subject B"
                selected={slotB}
                onClear={() => { setSlotB(null); setResult(null); setError(null); }}
              />
            </div>

            {/* Button + error below slots */}
            <div className="compare-action-area">
              {error && (
                <div className="compare-error-msg">
                  <AlertCircle size={13} />
                  {error}
                </div>
              )}
              <button
                className="compare-trigger-btn"
                disabled={!slotA || !slotB || comparing}
                onClick={handleCompare}
              >
                {comparing ? "Analyzing..." : "Generate Intelligence"}
              </button>
            </div>
          </div>
        </DragDropContext>
      ) : (
        <div className="compare-result-view animate-fade-in">
          <div className="result-container">
            {result && (
              <CompareDashboard
                data={result}
                nameA={slotA?.name}
                nameB={slotB?.name}
                idA={slotA?.id}
                idB={slotB?.id}
                onBack={() => setViewMode('selection')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DropSlot({ id, label, selected, onClear }: any) {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div
          className={`drop-slot ${snapshot.isDraggingOver ? "is-over" : ""}`}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {selected ? (
            <div className="selected-report-preview">
              <div className="preview-header">
                <span className="section-tag">{label}</span>
                <button onClick={onClear} className="preview-remove-btn"><Trash2 size={14} /></button>
              </div>
              <div className="flex items-center gap-4">
                <div className="preview-avatar">{selected.name[0]}</div>
                <div>
                  <div className="font-bold text-slate-900">{selected.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{selected.type} Report</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="drop-slot-empty">
              <Plus size={32} />
              <div className="drop-slot-label">{label}</div>
              <div className="text-[10px] text-slate-400 mt-2">Drag report here</div>
            </div>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

function CompareDashboard({ data, nameA, nameB, idA, idB, onBack }: any) {
  const [activeTab, setActiveTab] = useState("snapshot");
  const navigate = useNavigate();

  const TABS = [
    { id: "snapshot", label: "Overview", icon: FileText, purpose: "Quick snapshot and compatibility" },
    { id: "behavior", label: "Behavior", icon: Users, purpose: "Personality and working style" },
    { id: "career", label: "Career", icon: Briefcase, purpose: "Professional background and expertise" },
    { id: "influence", label: "Outreach", icon: GitBranch, purpose: "How to reach and engage them" },
    { id: "risk", label: "Verdict", icon: ShieldAlert, purpose: "Risk assessment and final recommendation" },
    { id: "ai", label: "Insights", icon: Cpu, purpose: "Deep-dive comparative AI analysis", isRedirect: true },
  ];

  return (
    <div className="compare-results-container">
      <div className="compare-tab-bar">
        <button className="tab-back-btn" onClick={onBack} title="Back to Workspace">
          <ArrowLeft size={14} />
        </button>
        <div className="tab-bar-divider" />
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`compare-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => {
              if (tab.isRedirect) {
                navigate(`/dashboard/insights?tab=Compare Persona&report1=${idA}&report2=${idB}`);
              } else {
                setActiveTab(tab.id);
              }
            }}
            title={tab.purpose}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="compare-tab-content">
        {activeTab === "snapshot" && <SnapshotTab data={data} nameA={nameA} nameB={nameB} />}
        {activeTab === "behavior" && <BehaviorTab data={data} nameA={nameA} nameB={nameB} />}
        {activeTab === "career" && <CareerSkillsTab data={data} nameA={nameA} nameB={nameB} />}
        {activeTab === "influence" && <InfluenceEngagementTab data={data} nameA={nameA} nameB={nameB} />}
        {activeTab === "risk" && <RiskVerdictTab data={data} nameA={nameA} nameB={nameB} />}
      </div>
    </div>
  );
}