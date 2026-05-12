import React, { useState } from 'react';

export default function ParametresPage() {
  const [ecole, setEcole] = useState({
    nom: "Groupe Scolaire d'Excellence Sidy Konaté",
    adresse: 'Dakar, Sénégal',
    telephone: '+221 33 000 00 00',
    email: 'contact@gsek.sn',
    siteWeb: 'www.gsek.sn',
    devise: 'Excellence · Discipline · Réussite',
    anneeScolaire: '2024-2025',
    fraisInscription: 75000,
    fraisMensualite: 35000,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('gsek_parametres', JSON.stringify(ecole));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Paramètres</h1>
          <p className="page-subtitle">Configuration de l'établissement</p>
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
            <input value={ecole.nom} onChange={e => setEcole({ ...ecole, nom: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Devise / Slogan</label>
            <input value={ecole.devise} onChange={e => setEcole({ ...ecole, devise: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Adresse</label>
            <input value={ecole.adresse} onChange={e => setEcole({ ...ecole, adresse: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input value={ecole.telephone} onChange={e => setEcole({ ...ecole, telephone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={ecole.email} onChange={e => setEcole({ ...ecole, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Site web</label>
            <input value={ecole.siteWeb} onChange={e => setEcole({ ...ecole, siteWeb: e.target.value })} />
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 20, fontSize: 17 }}>📅 Année scolaire</h3>
            <div className="form-group">
              <label>Année scolaire en cours</label>
              <select value={ecole.anneeScolaire} onChange={e => setEcole({ ...ecole, anneeScolaire: e.target.value })}>
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
              <input type="number" value={ecole.fraisInscription} onChange={e => setEcole({ ...ecole, fraisInscription: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Mensualité standard (FCFA)</label>
              <input type="number" value={ecole.fraisMensualite} onChange={e => setEcole({ ...ecole, fraisMensualite: e.target.value })} />
            </div>
          </div>

          <div className="card" style={{ background: '#f0f7ff', borderColor: '#c0d8f5' }}>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>ℹ️ À propos du système</h3>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <div>Version : <strong>1.0.0</strong></div>
              <div>Établissement : <strong>GSEK</strong></div>
              <div>Données stockées localement dans votre navigateur.</div>
              <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff3cd', borderRadius: 6, color: '#856404', fontSize: 12 }}>
                ⚠️ Sauvegardez régulièrement vos données importantes.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24, background: '#fff5f5', borderColor: '#f5c6cb' }}>
        <h3 style={{ marginBottom: 12, fontSize: 16, color: 'var(--danger)' }}>⚠️ Zone de danger</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Ces actions sont irréversibles. Procédez avec la plus grande prudence.</p>
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
