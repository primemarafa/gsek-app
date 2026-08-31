import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Settings,
  Save,
  School,
  Calendar,
  Coins,
  Database,
  Download,
  Upload,
  Info,
  AlertTriangle,
  Trash2
} from 'lucide-react';

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

  const toast = useToast();
  const [ecole, setEcole] = useState(parametres);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (parametres) {
      setEcole(parametres);
    }
  }, [parametres]);

  const handleSave = () => {
    updateParametres(ecole);
    toast.success('Paramètres enregistrés avec succès !');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setPendingImportData(json);
      } catch (err) {
        toast.error('Le fichier sélectionné est corrompu ou au mauvais format JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    if (pendingImportData) {
      const res = importData(pendingImportData);
      if (res.success) {
        toast.success('Données scolaires restaurées avec succès !');
      } else {
        toast.error(`Erreur de restauration : ${res.error}`);
      }
      setPendingImportData(null);
    }
  };

  const handleResetAll = () => {
    localStorage.clear();
    toast.info('Toutes les données ont été réinitialisées.');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={28} /> Paramètres
          </h1>
          <p className="page-subtitle">Configuration de l'établissement & Sauvegarde</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={16} /> Sauvegarder
        </button>
      </div>

      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
            <School size={19} color="var(--primary)" /> Informations de l'école
          </h3>
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
            <h3 style={{ marginBottom: 20, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={19} color="var(--primary)" /> Année scolaire
            </h3>
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
            <h3 style={{ marginBottom: 20, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Coins size={19} color="var(--primary)" /> Tarification standard
            </h3>
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
            <h3 style={{ marginBottom: 12, fontSize: 16, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={19} color="#166534" /> Sauvegarde & Sécurité des données
            </h3>
            <p style={{ fontSize: 13, color: '#15803d', marginBottom: 16, lineHeight: 1.5 }}>
              Exportez régulièrement une sauvegarde de toutes vos données scolaires sur votre ordinateur ou clé USB.
            </p>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, background: '#fff', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              📊 Données actuelles : <strong>{eleves.length}</strong> élèves · <strong>{personnel.length}</strong> employés · <strong>{bulletins.length}</strong> bulletins · <strong>{paiements.length}</strong> reçus
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => { exportData(); toast.success('Sauvegarde exportée avec succès !'); }}>
                <Download size={15} /> Exporter la sauvegarde (JSON)
              </button>
              <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => fileInputRef.current?.click()}>
                <Upload size={15} /> Restaurer une sauvegarde
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
            <h3 style={{ marginBottom: 12, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={19} color="var(--primary)" /> À propos du système
            </h3>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <div>Version : <strong>1.0.0</strong></div>
              <div>Établissement : <strong>{ecole.nom || 'GSEK'}</strong></div>
              <div>Données sécurisées localement dans votre navigateur.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24, background: '#fff5f5', borderColor: '#f5c6cb' }}>
        <h3 style={{ marginBottom: 12, fontSize: 16, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={19} color="var(--danger)" /> Zone de danger
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Ces actions sont irréversibles. Pensez à faire une sauvegarde avant.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-danger" style={{ fontSize: 13 }} onClick={() => setConfirmResetOpen(true)}>
            <Trash2 size={15} /> Réinitialiser toutes les données
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Réinitialiser toutes les données"
        message="Êtes-vous absolument sûr ? Cette action effacera irrémédiablement l'ensemble des élèves, bulletins, paiements et configurations enregistrés dans votre navigateur."
        confirmText="Tout effacer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={handleResetAll}
        onCancel={() => setConfirmResetOpen(false)}
      />

      <ConfirmModal
        isOpen={!!pendingImportData}
        title="Restaurer une sauvegarde"
        message="Voulez-vous vraiment restaurer ces données ? Toutes les données actuelles de l'établissement seront remplacées par celles du fichier."
        confirmText="Restaurer"
        cancelText="Annuler"
        variant="primary"
        onConfirm={confirmImport}
        onCancel={() => setPendingImportData(null)}
      />
    </div>
  );
}
