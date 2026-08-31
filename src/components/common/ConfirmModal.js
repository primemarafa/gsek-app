import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirmation',
  message = 'Êtes-vous sûr de vouloir continuer ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger', // danger or primary
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: variant === 'danger' ? '#fee2e2' : '#e0e7ff',
              color: variant === 'danger' ? '#dc2626' : '#1a3a6b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: 18, margin: 0, color: '#1e293b' }}>{title}</h3>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body" style={{ marginTop: 12 }}>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>{message}</p>
        </div>
        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 16 }}>
          <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            style={{ fontSize: 13 }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
