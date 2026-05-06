import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("leo_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post("/api/auth/register", { email, password, name }),
  me: () => api.get("/api/auth/me"),
};

// Reports (Persona)
export const reportsAPI = {
  getAll: () => api.get("/api/reports/my"),
  getById: (id: string) => api.get(`/api/reports/${id}`),
  checkExisting: (linkedinId: string) => 
    api.get(`/api/reports/check-existing?linkedin_id=${linkedinId}`),
  save: (data: { 
    domain: string; 
    company_name: string; 
    report_data: any; 
    linkedin_id: string; 
  }) => api.post("/api/reports", data),
};

// Python Backend (Insights)
export const pythonAPI = axios.create({
  baseURL: "http://localhost:8001",
  headers: { "Content-Type": "application/json" },
});

pythonAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("leo_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const insightsAPI = {
  generateForensic: (data: { 
    report_id: string, 
    theme_id: string, 
    target_name: string, 
    company_name: string,
    comparison_id?: string,
    compare_report_id?: string
  }) => pythonAPI.post("/api/persona/forensic-insight", data),

  generateCompanyForensic: (data: { 
    report_id: string, 
    theme_id: string, 
    target_name: string, 
    company_name: string
  }) => pythonAPI.post("/api/agents/company-forensic", data),
  
  // Cache Management - Persona
  checkSavedForensic: (params: { type: string; reportId?: string; comparisonId?: string }) => 
    api.get("/api/saved/forensic/check", { params }),
    
  saveForensic: (data: { 
    type: string; 
    data: any; 
    reportId?: string; 
    comparisonId?: string; 
    compareReportId?: string 
  }) => api.post("/api/saved/forensic/save", data),

  // Cache Management - Company
  checkCompanyForensic: (params: { type: string; companyId?: string; comparisonId?: string }) => 
    api.get("/api/saved/company-forensic/check", { params }),

  saveCompanyForensic: (data: { 
    type: string; 
    data: any; 
    companyId?: string; 
    comparisonId?: string; 
    compareCompanyId?: string 
  }) => api.post("/api/saved/company-forensic/save", data)
};

// Comparison
export const compareAPI = {
  findExisting: (report1_id: string, report2_id: string) =>
    api.post("/api/compare/find", { report1_id, report2_id }),
  save: (data: { report1_id: string, report2_id: string, comparison_data: any }) =>
    api.post("/api/compare", data),
  getById: (id: string) => api.get(`/api/compare/${id}`),
  // Python endpoint to run the AI comparison
  triggerPersonaCompare: (report1_id: string, report2_id: string) =>
    pythonAPI.post("/api/persona/compare", { report1_id, report2_id })
};

// Company Intelligence
export const companyAPI = {
  getMy: () => api.get("/api/companies/my"),
  suggest: (name: string) => api.get(`/api/companies/suggest?name=${encodeURIComponent(name)}`),
  checkExisting: (domain: string) => api.get(`/api/companies/check-existing?domain=${domain}`),
  getData: (domain: string) => api.post("/api/companies/getcompany", { domain }),
  getTimeline: (data: { company_name: string; domain: string; description?: string }) => 
    api.post("/api/timeline", data),
  getNews: (data: { company_name: string; domain: string; description?: string }) => 
    api.post("/api/news", data),
  getCompetitors: (data: { company_name: string; domain: string; description?: string }) => 
    api.post("/api/competitors", data),
  
  // Deep Dive & Gathering
  gatherCompany: (data: { domain: string; manual_linkedin_url?: string }) => 
    api.post("/api/gather/company", data),
  saveFullReport: (data: { domain: string; company_name: string; report_data: any }) => 
    api.post("/api/companies/save-full-report", data),
  getFullReport: (domain: string) => 
    api.get(`/api/companies/full-report/${domain}`),
};

// Python Agents
export const agentsAPI = {
  generateFullReport: (domain: string) => 
    pythonAPI.post("/api/agents/full-report", { domain }),
};

export default api;

