import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export default function UnauthorizedPage({ requiredRoles = [] }) {
  const navigate = useNavigate();
  const { currentUser, logout, ROLES } = useApp();

  const userRoleLabel = ROLES[currentUser?.role]?.label || currentUser?.role;
  const requiredRolesLabels = requiredRoles.map(r => ROLES[r]?.label || r).join(', ');

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      padding: '32px 16px'
    }}>
      <div style={{
        maxWidth: 500,
        width: '100%',
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '36px 32px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: 14,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <ShieldAlert size={32} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
          Accès Restreint (403)
        </h2>

        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.55, marginBottom: 20 }}>
          Vous êtes connecté en tant que <strong>{userRoleLabel}</strong>. Vous ne disposez pas des permissions requises pour accéder à ce module.
        </p>

        {requiredRolesLabels && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 12.5,
            color: '#475569',
            marginBottom: 24
          }}>
            <strong>Droits requis :</strong> {requiredRolesLabels}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={15} /> Tableau de bord
          </button>
          <button
            className="btn btn-outline"
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <LogOut size={15} /> Changer de compte
          </button>
        </div>
      </div>
    </div>
  );
}
