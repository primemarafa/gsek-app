import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

export default function ParametresPage() {
  const {
    parametres,
    updateParametres,
    exportData,
    importData,
    eleves,
    personnel,
    paiements,
    bulletins,
    transactions
  } = useApp();

  const [ecole, setEcole] = useState(parametres);
  const [saved, setSaved] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (parametres) {
      setEcole(parametres);
    }
  }, [parametres]);

  const handleSave = () => {
    updateParametres(ecole);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (window.confirm('Voulez-vous vraiment restaurer ces données ? Toutes les données actuelles seront remplacées.')) {
          const res = importData(json);
          if (res.success) {
            setImportStatus({ type: 'success', message: '✅ Restauration réussie avec succès !' });
          } else {
            setImportStatus({ type: 'error', message: `❌ Erreur : ${res.error}` });
          }
        }
      } catch (err) {
        setImportStatus({ type: 'error', message: '❌ Fichier invalide ou corrompu.' });
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Paramètres</h1>
          <p className="page-subtitle">Configuration de l'établissement & Sauvegarde</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? '✅ Enregistré !' : '💾 Sauvegarder'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 17 }}>🏫 Informations de l'école</h3>
          <div className="form-group">
            <label>Nom de l'établissement</label>
            <input value={ecole.nom || ''} onChange={e => setEcole({ ...ecole, nom: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Devise / Slogan</label>
            <input value={ecole.devise || ''} onChange={e => setEcole({ ...ecole, devise: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Adresse</label>
            <input value={ecole.adresse || ''} onChange={e => setEcole({ ...ecole, adresse: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input value={ecole.telephone || ''} onChange={e => setEcole({ ...ecole, telephone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={ecole.email || ''} onChange={e => setEcole({ ...ecole, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Site web</label>
            <input value={ecole.siteWeb || ''} onChange={e => setEcole({ ...ecole, siteWeb: e.target.value })} />
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 20, fontSize: 17 }}>📅 Année scolaire</h3>
            <div className="form-group">
              <label>Année scolaire en cours</label>
              <select value={ecole.anneeScolaire || '2024-2025'} onChange={e => setEcole({ ...ecole, anneeScolaire: e.target.value })}>
                <option>2023-2024</option>
                <option>2024-2025</option>
                <option>2025-2026</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 20, fontSize: 17 }}>💰 Tarification</h3>
            <div className="form-group">
              <label>Frais d'inscription (FCFA)</label>
              <input type="number" value={ecole.fraisInscription || 0} onChange={e => setEcole({ ...ecole, fraisInscription: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="form-group">
              <label>Mensualité standard (FCFA)</label>
              <input type="number" value={ecole.fraisMensualite || 0} onChange={e => setEcole({ ...ecole, fraisMensualite: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>

          <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', marginBottom: 20 }}>
            <h3 style={{ marginBottom: 12, fontSize: 16, color: '#166534' }}>💾 Sauvegarde & Sécurité des données</h3>
            <p style={{ fontSize: 13, color: '#15803d', marginBottom: 16 }}>
              Exportez régulièrement une sauvegarde de toutes vos données scolaires sur votre ordinateur ou clé USB.
            </p>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, background: '#fff', padding: '10px 14px', borderRadius: 6, border: '1px solid #e5e7eb' }}>
              📊 Données actuelles : <strong>{eleves.length}</strong> élèves · <strong>{personnel.length}</strong> employés · <strong>{bulletins.length}</strong> bulletins · <strong>{paiements.length}</strong> reçus
            </div>

            {importStatus && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 6,
                marginBottom: 14,
                fontSize: 13,
                fontWeight: 600,
                background: importStatus.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: importStatus.type === 'success' ? '#166534' : '#991b1b'
              }}>
                {importStatus.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={exportData}>
                📥 Exporter la sauvegarde (JSON)
              </button>
              <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => fileInputRef.current?.click()}>
                📤 Restaurer une sauvegarde
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="card" style={{ background: '#f0f7ff', borderColor: '#c0d8f5' }}>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>ℹ️ À propos du système</h3>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <div>Version : <strong>1.0.0</strong></div>
              <div>Établissement : <strong>{ecole.nom || 'GSEK'}</strong></div>
              <div>Données enregistrées localement dans votre navigateur.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24, background: '#fff5f5', borderColor: '#f5c6cb' }}>
        <h3 style={{ marginBottom: 12, fontSize: 16, color: 'var(--danger)' }}>⚠️ Zone de danger</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Ces actions sont irréversibles. Pensez à faire une sauvegarde avant.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-danger" style={{ fontSize: 13 }}
            onClick={() => { if (window.confirm('Effacer TOUTES les données ? Cette action est irréversible !')) { localStorage.clear(); window.location.reload(); } }}>
            🗑 Réinitialiser toutes les données
          </button>
        </div>
      </div>
    </div>
  );
}
