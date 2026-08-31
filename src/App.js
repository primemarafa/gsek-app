import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ElevesPage from './pages/eleves/ElevesPage';
import EleveDetail from './pages/eleves/EleveDetail';
import BulletinPage from './pages/bulletin/BulletinPage';
import BulletinDetail from './pages/bulletin/BulletinDetail';
import PersonnelPage from './pages/personnel/PersonnelPage';
import ComptabilitePage from './pages/comptabilite/ComptabilitePage';
import PaiementPage from './pages/paiement/PaiementPage';
import PaiementDetail from './pages/paiement/PaiementDetail';
import ParametresPage from './pages/parametres/ParametresPage';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import './App.css';

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Router>
          <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/eleves" element={<ElevesPage />} />
            <Route path="/eleves/:id" element={<EleveDetail />} />
            <Route path="/bulletin" element={<BulletinPage />} />
            <Route path="/bulletin/:id" element={<BulletinDetail />} />
            <Route path="/personnel" element={<PersonnelPage />} />
            <Route path="/comptabilite" element={<ComptabilitePage />} />
            <Route path="/paiement" element={<PaiementPage />} />
            <Route path="/paiement/:id" element={<PaiementDetail />} />
            <Route path="/parametres" element={<ParametresPage />} />
          </Routes>
        </Layout>
        </Router>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
