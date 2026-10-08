import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Search,
  GraduationCap,
  CreditCard,
  CalendarCheck,
  FileText,
  Receipt,
  Wallet,
  Users,
  Settings,
  LayoutDashboard,
  User,
  ArrowRight,
  X
} from 'lucide-react';
import './CommandPalette.css';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { eleves, paiements, personnel } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global keydown listener for Escape & Arrow navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, totalResults - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          handleSelect(flatResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const q = query.trim().toLowerCase();

  // Pages navigation
  const pages = [
    { title: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard, category: 'Pages' },
    { title: 'Gestion des Élèves', path: '/eleves', icon: GraduationCap, category: 'Pages' },
    { title: 'Cartes Scolaires & Badges QR', path: '/badges', icon: CreditCard, category: 'Pages' },
    { title: 'Vie Scolaire & Présences', path: '/viescolaire', icon: CalendarCheck, category: 'Pages' },
    { title: 'Bulletins de notes', path: '/bulletin', icon: FileText, category: 'Pages' },
    { title: 'Reçus de Paiement & Impayés', path: '/paiement', icon: Receipt, category: 'Pages' },
    { title: 'Comptabilité & Flux', path: '/comptabilite', icon: Wallet, category: 'Pages' },
    { title: 'Gestion du Personnel', path: '/personnel', icon: Users, category: 'Pages' },
    { title: 'Paramètres & Sauvegarde', path: '/parametres', icon: Settings, category: 'Pages' },
  ].filter(p => !q || p.title.toLowerCase().includes(q));

  // Search students
  const studentResults = q
    ? eleves
        .filter(e => (e.nom + ' ' + e.prenom + ' ' + (e.matricule || '') + ' ' + e.classe).toLowerCase().includes(q))
        .slice(0, 5)
        .map(e => ({
          title: `${e.nom} ${e.prenom}`,
          subtitle: `${e.matricule} · ${e.classe}`,
          path: `/eleves/${e.id}`,
          icon: GraduationCap,
          category: 'Élèves'
        }))
    : [];

  // Search receipts
  const receiptResults = q
    ? paiements
        .filter(p => ((p.ref || '') + ' ' + (p.eleveNom || '') + ' ' + (p.mois || '')).toLowerCase().includes(q))
        .slice(0, 4)
        .map(p => ({
          title: `Reçu ${p.ref}`,
          subtitle: `${p.eleveNom} · ${p.montant?.toLocaleString('fr-SN')} FCFA`,
          path: `/paiement/${p.id}`,
          icon: Receipt,
          category: 'Reçus'
        }))
    : [];

  // Search staff
  const staffResults = q
    ? personnel
        .filter(p => (p.nom + ' ' + p.prenom + ' ' + p.role).toLowerCase().includes(q))
        .slice(0, 3)
        .map(p => ({
          title: `${p.nom} ${p.prenom}`,
          subtitle: `${p.role} · ${p.matricule}`,
          path: '/personnel',
          icon: User,
          category: 'Personnel'
        }))
    : [];

  const flatResults = [
    ...studentResults,
    ...receiptResults,
    ...staffResults,
    ...pages
  ];

  const totalResults = flatResults.length;

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette-modal" onClick={e => e.stopPropagation()}>
        <div className="palette-search-box">
          <Search size={20} className="palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder="Rechercher un élève, un reçu, un membre du personnel ou une page..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className="palette-esc-badge" onClick={onClose}>ESC</span>
        </div>

        <div className="palette-results">
          {totalResults === 0 ? (
            <div className="palette-empty">
              Aucun résultat pour "<strong>{query}</strong>"
            </div>
          ) : (
            <div>
              {studentResults.length > 0 && (
                <div className="palette-group">
                  <div className="palette-group-title">Élèves</div>
                  {studentResults.map((item, idx) => {
                    const globalIdx = idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <div
                        key={item.path}
                        className={`palette-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      >
                        <div className="palette-item-icon blue">
                          <item.icon size={16} />
                        </div>
                        <div className="palette-item-content">
                          <div className="palette-item-title">{item.title}</div>
                          <div className="palette-item-subtitle">{item.subtitle}</div>
                        </div>
                        <ArrowRight size={14} className="palette-item-arrow" />
                      </div>
                    );
                  })}
                </div>
              )}

              {receiptResults.length > 0 && (
                <div className="palette-group">
                  <div className="palette-group-title">Reçus de Paiement</div>
                  {receiptResults.map((item, idx) => {
                    const globalIdx = studentResults.length + idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <div
                        key={item.path}
                        className={`palette-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      >
                        <div className="palette-item-icon green">
                          <item.icon size={16} />
                        </div>
                        <div className="palette-item-content">
                          <div className="palette-item-title">{item.title}</div>
                          <div className="palette-item-subtitle">{item.subtitle}</div>
                        </div>
                        <ArrowRight size={14} className="palette-item-arrow" />
                      </div>
                    );
                  })}
                </div>
              )}

              {staffResults.length > 0 && (
                <div className="palette-group">
                  <div className="palette-group-title">Personnel</div>
                  {staffResults.map((item, idx) => {
                    const globalIdx = studentResults.length + receiptResults.length + idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <div
                        key={item.path + idx}
                        className={`palette-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      >
                        <div className="palette-item-icon gold">
                          <item.icon size={16} />
                        </div>
                        <div className="palette-item-content">
                          <div className="palette-item-title">{item.title}</div>
                          <div className="palette-item-subtitle">{item.subtitle}</div>
                        </div>
                        <ArrowRight size={14} className="palette-item-arrow" />
                      </div>
                    );
                  })}
                </div>
              )}

              {pages.length > 0 && (
                <div className="palette-group">
                  <div className="palette-group-title">Navigation Rapide</div>
                  {pages.map((item, idx) => {
                    const globalIdx = studentResults.length + receiptResults.length + staffResults.length + idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <div
                        key={item.path}
                        className={`palette-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      >
                        <div className="palette-item-icon">
                          <item.icon size={16} />
                        </div>
                        <div className="palette-item-content">
                          <div className="palette-item-title">{item.title}</div>
                        </div>
                        <ArrowRight size={14} className="palette-item-arrow" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="palette-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> pour naviguer</span>
          <span><kbd>↵</kbd> pour ouvrir</span>
          <span><kbd>ESC</kbd> pour fermer</span>
        </div>
      </div>
    </div>
  );
}
