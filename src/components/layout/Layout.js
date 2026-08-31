import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Receipt,
  Wallet,
  Users,
  Settings,
  School,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import './Layout.css';

const nav = [
  { path: '/dashboard',    icon: LayoutDashboard, label: 'Tableau de bord' },
  { path: '/eleves',       icon: GraduationCap,   label: 'Élèves & Matricules' },
  { path: '/bulletin',     icon: FileText,        label: 'Bulletins de notes' },
  { path: '/paiement',     icon: Receipt,         label: 'Reçus de paiement' },
  { path: '/comptabilite', icon: Wallet,          label: 'Comptabilité' },
  { path: '/personnel',    icon: Users,           label: 'Personnel' },
  { path: '/parametres',   icon: Settings,        label: 'Paramètres' },
];

export default function Layout({ children }) {
  const { parametres } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`app-layout ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Sparkles size={20} className="logo-star" />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">{parametres?.nom ? parametres.nom.split(' ')[0] : 'GSEK'}</span>
              <span className="brand-sub">Système de gestion</span>
            </div>
          )}
          <button
            className="collapse-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Agrandir le menu" : "Réduire le menu"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          <button
            className="mobile-close-btn mobile-only"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {!collapsed && (
          <div className="sidebar-school-name">
            <p>{parametres?.nom || "Groupe Scolaire d'Excellence"}</p>
            <p className="school-devise">{parametres?.devise || "Excellence · Discipline · Réussite"}</p>
          </div>
        )}

        <nav className="sidebar-nav">
          {nav.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon"><Icon size={19} /></span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && <span>© {new Date().getFullYear()} {parametres?.nom || 'GSEK'}</span>}
        </div>
      </aside>

      <div className="main-area">
        <header className="top-header no-print">
          <div className="header-left">
            <button
              className="mobile-menu-btn mobile-only"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>
            <div className="header-school">
              <div className="header-icon-box">
                <School size={20} />
              </div>
              <div>
                <div className="header-school-name">{parametres?.nom || "Groupe Scolaire d'Excellence Sidy Konaté"}</div>
                <div className="header-school-sub">Année scolaire {parametres?.anneeScolaire || "2024-2025"}</div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="header-user">
              <div className="user-avatar">AD</div>
              <div className="user-info desktop-only">
                <div className="user-name">Direction</div>
                <div className="user-role">Administrateur</div>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
