import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Layout.css';

const nav = [
  { path: '/dashboard',    icon: '🏠', label: 'Tableau de bord' },
  { path: '/eleves',       icon: '🎒', label: 'Élèves & Matricules' },
  { path: '/bulletin',     icon: '📋', label: 'Bulletins de notes' },
  { path: '/paiement',     icon: '🧾', label: 'Reçus de paiement' },
  { path: '/comptabilite', icon: '💰', label: 'Comptabilité' },
  { path: '/personnel',    icon: '👨‍🏫', label: 'Personnel' },
  { path: '/parametres',   icon: '⚙️', label: 'Paramètres' },
];

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={`app-layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <span className="logo-star">✦</span>
          </div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">GSEK</span>
              <span className="brand-sub">Système de gestion</span>
            </div>
          )}
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {!collapsed && (
          <div className="sidebar-school-name">
            <p>Groupe Scolaire d'Excellence</p>
            <p className="school-konate">Sidy Konaté</p>
          </div>
        )}

        <nav className="sidebar-nav">
          {nav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && <span>© 2025 GSEK</span>}
        </div>
      </aside>

      <div className="main-area">
        <header className="top-header no-print">
          <div className="header-left">
            <div className="header-school">
              <span className="header-icon">🏫</span>
              <div>
                <div className="header-school-name">Groupe Scolaire d'Excellence Sidy Konaté</div>
                <div className="header-school-sub">Année scolaire 2024-2025</div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="header-user">
              <div className="user-avatar">AD</div>
              <div>
                <div className="user-name">Administrateur</div>
                <div className="user-role">Direction</div>
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
