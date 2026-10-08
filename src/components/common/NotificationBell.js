import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  AlertTriangle,
  CalendarCheck,
  Database,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import './NotificationBell.css';

export default function NotificationBell() {
  const navigate = useNavigate();
  const { eleves, paiements, absences } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('gsek_read_notifs');
    return saved ? JSON.parse(saved) : [];
  });
  const bellRef = useRef(null);

  // Fermer la popover si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sauvegarde des notifications lues
  useEffect(() => {
    localStorage.setItem('gsek_read_notifs', JSON.stringify(readIds));
  }, [readIds]);

  // Calcul dynamique des alertes scolaires
  const notifications = [];

  // 1. Alertes d'impayés
  const elevesActifs = eleves.filter(e => e.statut === 'actif');
  const impayesOctobre = elevesActifs.filter(eleve => {
    return !paiements.some(p => p.eleveId === eleve.id && p.type === 'mensualite' && p.mois === 'Octobre');
  });

  if (impayesOctobre.length > 0) {
    notifications.push({
      id: 'notif-impayes',
      type: 'warning',
      icon: AlertTriangle,
      title: 'Mensualités en attente',
      description: `${impayesOctobre.length} élève(s) ont une mensualité d'octobre impayée.`,
      path: '/paiement',
      actionLabel: 'Consulter les impayés'
    });
  }

  // 2. Alertes assiduité
  const today = new Date().toISOString().split('T')[0];
  const absencesAujourdhui = absences.filter(a => a.date === today);
  if (absencesAujourdhui.length > 0) {
    notifications.push({
      id: `notif-absences-${today}`,
      type: 'info',
      icon: CalendarCheck,
      title: 'Pointage du jour',
      description: `${absencesAujourdhui.length} absence(s) ou retard(s) signalé(s) aujourd'hui.`,
      path: '/viescolaire',
      actionLabel: 'Voir la feuille d\'appel'
    });
  }

  // 3. Alerte sauvegarde
  notifications.push({
    id: 'notif-backup',
    type: 'tip',
    icon: Database,
    title: 'Sauvegarde des données',
    description: 'Pensez à télécharger une copie JSON sécurisée de vos registres.',
    path: '/parametres',
    actionLabel: 'Sauvegarder'
  });

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const handleMarkAllRead = () => {
    setReadIds(notifications.map(n => n.id));
  };

  const handleClickItem = (item) => {
    if (!readIds.includes(item.id)) {
      setReadIds(prev => [...prev, item.id]);
    }
    navigate(item.path);
    setIsOpen(false);
  };

  return (
    <div className="notif-wrapper" ref={bellRef}>
      <button
        className="notif-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        title="Centre de notifications & alertes"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <div>
              <div className="notif-title">Alertes & Notifications</div>
              <div className="notif-subtitle">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</div>
            </div>
            {unreadCount > 0 && (
              <button className="notif-mark-read-btn" onClick={handleMarkAllRead}>
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.map(item => {
              const isRead = readIds.includes(item.id);
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className={`notif-item ${isRead ? 'read' : 'unread'} ${item.type}`}
                  onClick={() => handleClickItem(item)}
                >
                  <div className={`notif-item-icon ${item.type}`}>
                    <Icon size={16} />
                  </div>
                  <div className="notif-item-content">
                    <div className="notif-item-title">
                      {item.title}
                      {!isRead && <span className="notif-item-dot" />}
                    </div>
                    <div className="notif-item-desc">{item.description}</div>
                    <div className="notif-item-action">
                      {item.actionLabel} <ExternalLink size={11} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="notif-footer">
            <span>Centre de veille automatique GSEK</span>
          </div>
        </div>
      )}
    </div>
  );
}
