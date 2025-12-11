import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import SocialProof from './components/SocialProof';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Comparison from './components/Comparison';
import DemoTeaser from './components/DemoTeaser';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import ConnectionPage from './components/ConnectionPage';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import IntegrationPage from './pages/IntegrationPage';
import AgendaPage from './pages/AgendaPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import LoginPage from './pages/LoginPage';
import LoginSection from './components/LoginSection';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ProtectedRoute from './components/ProtectedRoute';

const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <Header onLoginClick={() => setIsLoginOpen(!isLoginOpen)} />
      <LoginSection isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Comparison />
      <DemoTeaser />
      <Pricing />
      <FAQ />
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="bg-slate-950 min-h-screen text-slate-200 font-sans selection:bg-primary selection:text-white">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/conectar" element={<ConnectionPage />} />
          <Route path="/privacidade" element={<PrivacyPolicyPage />} />


          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="crm" element={<CRM />} />
            <Route path="integracoes" element={<IntegrationPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
            {/* Placeholders for other sidebar links */}
            <Route path="mensagens" element={<div className="p-8 text-center text-slate-500">Módulo de Mensagens em desenvolvimento</div>} />
          </Route>

        </Routes>
      </div>
    </Router>
  );
}

export default App;
