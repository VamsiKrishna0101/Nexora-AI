
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PersonaList from "./pages/PersonaList";
import PersonaDetail from "./pages/PersonaDetail";

import Home from "./pages/Home";
import AiInsights from "./pages/AiInsights";
import Compare from "./pages/Compare";
import CompanyList from "./pages/CompanyList";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyDeepDiveDashboard from "./pages/CompanyDeepDiveDashboard";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Dashboard */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Home />} />
            <Route path="personas" element={<PersonaList />} />
            <Route path="personas/:id" element={<PersonaDetail />} />
            
            {/* Company Intelligence */}
            <Route path="company" element={<CompanyList />} />
            <Route path="company/:domain" element={<CompanyDashboard />} />
            <Route path="company/:domain/deep-dive" element={<CompanyDeepDiveDashboard />} />

            {/* Real pages */}
            <Route path="insights"     element={<AiInsights />} />
            <Route path="compare"      element={<Compare />} />
            <Route path="settings"     element={<Settings />} />
            <Route path="subscription" element={<Subscription />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard/personas" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: 40, color: "#94a3b8", textAlign: "center" }}>
      <h2 style={{ color: "#1e293b" }}>{title}</h2>
      <p>This section is coming soon.</p>
    </div>
  );
}

export default App;
