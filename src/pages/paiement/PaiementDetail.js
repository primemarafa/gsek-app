import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Printer, School } from 'lucide-react';
import './Receipt.css';

const fmt = n => new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';

export default function PaiementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { paiements, parametres } = useApp();
  const printRef = useRef();

  const p = paiements.find(x => x.id === id);
  if (!p) return <div className="page-container"><p>Reçu introuvable.</p></div>;

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  return (
    <div className="page-container">
      <div className="page-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-outline" onClick={() => navigate('/paiement')}>
            <ArrowLeft size={16} /> Retour
          </button>
          <div>
            <h1 className="page-title">Reçu {p.ref}</h1>
            <p className="page-subtitle">{p.eleveNom} · {p.datePaiement}</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} /> Imprimer le reçu
        </button>
      </div>

      <div ref={printRef} className="receipt-wrapper">
        <div className="receipt-card">
          <div className="receipt-header">
            <div className="receipt-logo-block">
              <div className="receipt-logo">
                <School size={28} color="#ffffff" />
              </div>
              <div>
                <div className="receipt-school-name">{parametres?.nom || "GROUPE SCOLAIRE D'EXCELLENCE SIDY KONATÉ"}</div>
                <div className="receipt-school-sub">{parametres?.devise || 'Excellence · Discipline · Réussite'} · {parametres?.adresse || 'Dakar, Sénégal'}</div>
                <div className="receipt-school-sub">Tél : {parametres?.telephone || '+221 33 000 00 00'}</div>
              </div>
            </div>
            <div className="receipt-ref-badge">
              <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>REÇU N°</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{p.ref}</div>
            </div>
          </div>

          <div className="receipt-title">REÇU DE PAIEMENT</div>

          <div className="receipt-body">
            <div className="receipt-section">
              <div className="receipt-section-title">Informations de l'élève</div>
              <div className="receipt-row"><span>Nom et prénom</span><span><strong>{p.eleveNom}</strong></span></div>
              <div className="receipt-row"><span>Matricule</span><span style={{ fontFamily: 'var(--font-mono)' }}>{p.eleveMatricule}</span></div>
              <div className="receipt-row"><span>Classe</span><span>{p.eleveClasse}</span></div>
            </div>

            <div className="receipt-section">
              <div className="receipt-section-title">Détails du paiement</div>
              <div className="receipt-row"><span>Type</span><span>{p.type === 'inscription' ? "Frais d'inscription" : 'Mensualité scolaire'}</span></div>
              {p.mois && <div className="receipt-row"><span>Mois concerné</span><span>{p.mois}</span></div>}
              <div className="receipt-row"><span>Mode de paiement</span><span style={{ textTransform: 'capitalize' }}>{p.modePaiement?.replace('_', ' ')}</span></div>
              <div className="receipt-row"><span>Date de paiement</span><span>{p.datePaiement}</span></div>
            </div>

            {p.remarques && (
              <div className="receipt-section">
                <div className="receipt-section-title">Remarques</div>
                <p style={{ fontSize: 14, color: '#444', fontStyle: 'italic' }}>{p.remarques}</p>
              </div>
            )}
          </div>

          <div className="receipt-total">
            <div>
              <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Montant total payé</div>
              <div className="receipt-amount" style={{ fontFamily: 'var(--font-mono)' }}>{fmt(p.montant)}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 13, opacity: 0.85 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>REÇU ET APPROUVÉ</div>
              <div>Année scolaire {parametres?.anneeScolaire || '2024-2025'}</div>
            </div>
          </div>

          <div className="receipt-signatures">
            <div className="receipt-sig">
              <div className="sig-area" />
              <div className="sig-label">Signature du caissier / comptable</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="receipt-stamp">GSEK<br />Dakar</div>
            </div>
            <div className="receipt-sig">
              <div className="sig-area" />
              <div className="sig-label">Signature du parent / tuteur</div>
            </div>
          </div>

          <div className="receipt-footer">
            Ce reçu est valable comme preuve de paiement officielle · Groupe Scolaire d'Excellence Sidy Konaté
          </div>
        </div>
      </div>
    </div>
  );
}
