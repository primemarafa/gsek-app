import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Printer,
  ArrowLeft,
  Filter,
  CheckSquare,
  Square,
  QrCode,
  GraduationCap
} from 'lucide-react';
import './Badges.css';

export default function BadgesPage() {
  const { eleves, parametres, CLASSES } = useApp();
  const navigate = useNavigate();
  const printRef = useRef();

  const [filterClasse, setFilterClasse] = useState(CLASSES[0] || '6ème A');
  const [selectedIds, setSelectedIds] = useState([]);

  const elevesClasse = eleves.filter(e => (!filterClasse || e.classe === filterClasse) && e.statut === 'actif');

  const toggleSelectAll = () => {
    if (selectedIds.length === elevesClasse.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(elevesClasse.map(e => e.id));
    }
  };

  const toggleSelectEleve = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const elevesToPrint = selectedIds.length > 0
    ? elevesClasse.filter(e => selectedIds.includes(e.id))
    : elevesClasse;

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `GSEK_Cartes_Scolaires_${filterClasse || 'Toutes'}`
  });

  return (
    <div className="page-container">
      <div className="page-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-outline" onClick={() => navigate('/eleves')}>
            <ArrowLeft size={16} /> Retour
          </button>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CreditCard size={28} /> Cartes & Badges Scolaires avec QR Code
            </h1>
            <p className="page-subtitle">Impression des cartes d'identité scolaires officielles</p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handlePrint}
          disabled={elevesToPrint.length === 0}
        >
          <Printer size={16} /> Imprimer les cartes ({elevesToPrint.length})
        </button>
      </div>

      <div className="card no-print" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Filter size={16} color="#64748b" />
            <label style={{ fontWeight: 600, fontSize: 14 }}>Sélectionner une classe :</label>
            <select
              value={filterClasse}
              onChange={e => { setFilterClasse(e.target.value); setSelectedIds([]); }}
              style={{ width: 'auto', minWidth: 160 }}
            >
              <option value="">Toutes les classes</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-secondary"
              onClick={toggleSelectAll}
              style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {selectedIds.length === elevesClasse.length && elevesClasse.length > 0 ? (
                <><CheckSquare size={16} /> Tout désélectionner</>
              ) : (
                <><Square size={16} /> Tout sélectionner ({elevesClasse.length})</>
              )}
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {selectedIds.length > 0 ? `${selectedIds.length} sélectionné(s)` : 'Tous affichés par défaut'}
            </span>
          </div>
        </div>
      </div>

      {elevesToPrint.length === 0 ? (
        <div className="empty-state">
          <div className="icon"><QrCode size={44} /></div>
          <h3>Aucun élève trouvé pour cette classe</h3>
          <p>Sélectionnez une autre classe ou ajoutez des élèves.</p>
        </div>
      ) : (
        <div ref={printRef} className="badges-print-container">
          <div className="badges-grid">
            {elevesToPrint.map(eleve => {
              const qrData = JSON.stringify({
                matricule: eleve.matricule,
                nom: `${eleve.nom} ${eleve.prenom}`,
                classe: eleve.classe,
                ecole: parametres?.nom || 'GSEK'
              });

              return (
                <div
                  key={eleve.id}
                  className={`badge-card ${selectedIds.includes(eleve.id) ? 'selected' : ''}`}
                  onClick={() => toggleSelectEleve(eleve.id)}
                >
                  <div className="badge-header">
                    <div className="badge-logo-icon">
                      <GraduationCap size={15} color="#ffffff" />
                    </div>
                    <div className="badge-header-text">
                      <div className="badge-school-name">{parametres?.nom || "GROUPE SCOLAIRE D'EXCELLENCE SIDY KONATÉ"}</div>
                      <div className="badge-title">CARTE D'IDENTITÉ SCOLAIRE</div>
                    </div>
                  </div>

                  <div className="badge-body">
                    <div className="badge-avatar-box">
                      <div className="badge-avatar-placeholder">
                        {eleve.prenom ? eleve.prenom[0] : ''}{eleve.nom ? eleve.nom[0] : ''}
                      </div>
                      <div className="badge-year">{parametres?.anneeScolaire || '2024-2025'}</div>
                    </div>

                    <div className="badge-info">
                      <div className="badge-matricule">{eleve.matricule}</div>
                      <div className="badge-name">{eleve.prenom} {eleve.nom}</div>
                      <div className="badge-detail"><strong>Classe :</strong> {eleve.classe}</div>
                      <div className="badge-detail"><strong>Sexe :</strong> {eleve.sexe === 'M' ? 'M' : 'F'}</div>
                      <div className="badge-detail"><strong>Né(e) le :</strong> {eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString('fr-SN') : '—'}</div>
                      <div className="badge-detail badge-contact"><strong>Urgence :</strong> {eleve.parentTel || '—'}</div>
                    </div>

                    <div className="badge-qrcode">
                      <QRCodeSVG
                        value={qrData}
                        size={64}
                        level="M"
                        includeMargin={false}
                      />
                      <span className="badge-scan-label">SCAN</span>
                    </div>
                  </div>

                  <div className="badge-footer">
                    <span>{parametres?.devise || 'Excellence · Discipline · Réussite'}</span>
                    <span className="badge-signature">La Direction</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
