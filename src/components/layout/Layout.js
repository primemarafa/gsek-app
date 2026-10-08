import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import CommandPalette from '../common/CommandPalette';
import NotificationBell from '../common/NotificationBell';
import {
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  CalendarCheck,
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
  ShieldCheck,
  Search
} from 'lucide-react';
import './Layout.css';

const nav = [
  { path: '/dashboard',    icon: LayoutDashboard, label: 'Tableau de bord', roles: ['directeur', 'comptable', 'secretaire', 'enseignant'] },
  { path: '/eleves',       icon: GraduationCap,   label: 'Élèves & Fiches', roles: ['directeur', 'secretaire', 'enseignant'] },
  { path: '/badges',       icon: CreditCard,      label: 'Cartes & Badges', roles: ['directeur', 'secretaire'] },
  { path: '/viescolaire',  icon: CalendarCheck,   label: 'Vie Scolaire',    roles: ['directeur', 'secretaire', 'enseignant'] },
  { path: '/bulletin',     icon: FileText,        label: 'Bulletins',       roles: ['directeur', 'secretaire', 'enseignant'] },
  { path: '/paiement',     icon: Receipt,         label: 'Reçus & Impayés', roles: ['directeur', 'comptable', 'secretaire'] },
  { path: '/comptabilite', icon: Wallet,          label: 'Comptabilité',    roles: ['directeur', 'comptable'] },
  { path: '/personnel',    icon: Users,           label: 'Personnel',       roles: ['directeur', 'comptable'] },
  { path: '/parametres',   icon: Settings,        label: 'Paramètres',      roles: ['directeur'] },
];

export default function Layout({ children }) {
  const { parametres, currentRole, changeRole, ROLES } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Raccourci global Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtrer les onglets accessibles par le profil actif
  const visibleNav = nav.filter(item => item.roles.includes(currentRole || 'directeur'));

  return (
    <div className={`app-layout ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <GraduationCap size={20} color="#f59e0b" />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <div className="brand-name">
                <span>GSEK</span>
                <span className="brand-badge">Scolaire</span>
              </div>
              <span className="brand-sub">Sidy Konaté</span>
            </div>
          )}
          <button
            className="sidebar-collapse-btn desktop-only"
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
          {visibleNav.map(item => {
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
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>© {new Date().getFullYear()} GSEK</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                Rôle : {ROLES[currentRole]?.label}
              </span>
            </div>
          )}
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
              <Menu size={20} />
            </button>
            <div className="header-school-tag">
              <School size={16} className="school-tag-icon" />
              <span className="school-tag-title">{parametres?.nom || "Groupe Scolaire d'Excellence Sidy Konaté"}</span>
              <span className="school-tag-badge">Année {parametres?.anneeScolaire || "2024-2025"}</span>
            </div>
          </div>

          <div className="header-right">
            {/* Barre de recherche rapide (Ctrl+K) */}
            <button
              className="header-ctrlk-btn desktop-only"
              onClick={() => setPaletteOpen(true)}
              title="Recherche universelle rapide (Ctrl + K)"
            >
              <Search size={14} className="ctrlk-icon" />
              <span className="ctrlk-label">Rechercher...</span>
              <kbd className="ctrlk-kbd">Ctrl K</kbd>
            </button>

            {/* Centre de notifications */}
            <NotificationBell />

            {/* Sélecteur de rôle en direct (RBAC multi-postes) */}
            <div className="header-role-pill desktop-only">
              <ShieldCheck size={14} className="role-pill-icon" />
              <span className="role-pill-text">Profil :</span>
              <select
                value={currentRole}
                onChange={e => changeRole(e.target.value)}
                className="role-pill-select"
                title="Changer de profil d'accès"
              >
                {Object.values(ROLES).map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Profil utilisateur connecté */}
            <div className="header-user-badge">
              <div className="user-badge-avatar" style={{ background: currentRole === 'directeur' ? 'var(--secondary)' : 'var(--primary-light)' }}>
                {currentRole[0].toUpperCase()}
              </div>
              <div className="user-badge-meta desktop-only">
                <span className="user-badge-name">{ROLES[currentRole]?.label}</span>
                <span className="user-badge-role">{currentRole === 'directeur' ? 'Admin' : 'Accès restreint'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Palette de commande Ctrl+K */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
