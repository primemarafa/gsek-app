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
                <span>{parametres?.nom ? parametres.nom.split(' ')[0] : 'GSEK'}</span>
                <span className="accent-dot" />
              </div>
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
              <span>© {new Date().getFullYear()} {parametres?.nom?.split(' ')[0] || 'GSEK'}</span>
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
            {/* Barre de recherche rapide (Ctrl+K) */}
            <button
              className="header-quick-search-btn desktop-only"
              onClick={() => setPaletteOpen(true)}
              title="Recherche universelle rapide (Ctrl + K)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: '#f8fafc',
                color: '#64748b',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Search size={14} color="#64748b" />
              <span>Rechercher...</span>
              <kbd style={{ fontSize: 10, background: 'white', padding: '1px 5px', borderRadius: 4, border: '1px solid #cbd5e1', fontWeight: 700, color: '#475569', marginLeft: 4 }}>
                Ctrl K
              </kbd>
            </button>

            {/* Centre de notifications */}
            <NotificationBell />

            {/* Sélecteur de rôle en direct (RBAC multi-postes) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
              <ShieldCheck size={15} color="var(--primary)" />
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }} className="desktop-only">Profil :</label>
              <select
                value={currentRole}
                onChange={e => changeRole(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 12,
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  outline: 'none',
                  padding: '2px 0'
                }}
                title="Changer de profil d'accès (Directeur / Comptable / Secrétaire / Enseignant)"
              >
                {Object.values(ROLES).map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="header-user">
              <div className="user-avatar" style={{ background: currentRole === 'directeur' ? 'var(--secondary)' : 'var(--primary)' }}>
                {currentRole[0].toUpperCase()}
              </div>
              <div className="user-info desktop-only">
                <div className="user-name">{ROLES[currentRole]?.label}</div>
                <div className="user-role">{currentRole === 'directeur' ? 'Administrateur' : 'Poste restreint'}</div>
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
