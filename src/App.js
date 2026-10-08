import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/Dashboard';
import ElevesPage from './pages/eleves/ElevesPage';
import EleveDetail from './pages/eleves/EleveDetail';
import BadgesPage from './pages/eleves/BadgesPage';
import VieScolairePage from './pages/viescolaire/VieScolairePage';
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
          <Routes>
            {/* Route publique de connexion */}
            <Route path="/login" element={<LoginPage />} />

            {/* Routes d'application protégées par authentification et rôle RBAC */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      
                      {/* Tableau de bord : accessible à tous les rôles */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute allowedRoles={['directeur', 'comptable', 'secretaire', 'enseignant']}>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />

                      {/* Élèves & Fiches */}
                      <Route
                        path="/eleves"
                        element={
                          <ProtectedRoute allowedRoles={['directeur', 'secretaire', 'enseignant']}>
                            <ElevesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/eleves/:id"
                        element={
                          <ProtectedRoute allowedRoles={['directeur', 'secretaire', 'enseignant']}>
                            <EleveDetail />
                          </ProtectedRoute>
                        }
                      />

                      {/* Cartes & Badges (Directeur & Secrétariat uniquement) */}
                      <Route
                        path="/badges"
                        element={
                          <ProtectedRoute allowedRoles={['directeur', 'secretaire']}>
                            <BadgesPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Vie Scolaire / Assiduité */}
                      <Route
                        path="/viescolaire"
                        element={
                          <ProtectedRoute allowedRoles={['directeur', 'secretaire', 'enseignant']}>
                            <VieScolairePage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Bulletins de notes */}
                      <Route
                        path="/bulletin"
                        element={
                          <ProtectedRoute allowedRoles={['directeur', 'secretaire', 'enseignant']}>
                            <BulletinPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/bulletin/:id"
                        element={
                          <ProtectedRoute allowedRoles={['directeur', 'secretaire', 'enseignant']}>
                            <BulletinDetail />
                          </ProtectedRoute>
                        }
                      />

                      {/* Comptabilité (Directeur & Comptable uniquement) */}
                      <Route
                        path="/comptabilite"
                        element={
                          <ProtectedRoute allowedRoles={['directeur', 'comptable']}>
                            <ComptabilitePage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Reçus & Paiements (Directeur, Comptable, Secrétaire uniquement) */}
                      <Route
                        path="/paiement"
                        element={
                          <ProtectedRoute allowedRoles={['directeur', 'comptable', 'secretaire']}>
                            <PaiementPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/paiement/:id"
                        element={
                          <ProtectedRoute allowedRoles={['directeur', 'comptable', 'secretaire']}>
                            <PaiementDetail />
                          </ProtectedRoute>
                        }
                      />

                      {/* Gestion du Personnel (Directeur & Comptable uniquement) */}
                      <Route
                        path="/personnel"
                        element={
                          <ProtectedRoute allowedRoles={['directeur', 'comptable']}>
                            <PersonnelPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Paramètres & Clôture (Directeur Général exclusivement) */}
                      <Route
                        path="/parametres"
                        element={
                          <ProtectedRoute allowedRoles={['directeur']}>
                            <ParametresPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Redirection fallback */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
