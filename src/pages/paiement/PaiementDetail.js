import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Printer, School, MessageSquare, CheckCircle2, FileText, Receipt } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { numberToWordsFR } from '../../utils/numberToWords';
import { getWhatsAppRecuLink } from '../../utils/whatsapp';
import './Receipt.css';

const fmt = n => new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';

export default function PaiementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { paiements, eleves, parametres, currentUser } = useApp();
  const [formatMode, setFormatMode] = useState('a5'); // 'a5' | 'ticket80'
  const printRef = useRef();

  const p = paiements.find(x => x.id === id);
  if (!p) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>Reçu introuvable</h3>
          <button className="btn btn-primary" onClick={() => navigate('/paiement')}>Retour aux paiements</button>
        </div>
      </div>
    );
  }

  const eleve = eleves.find(e => e.id === p.eleveId);
  const parentTel = eleve?.parentTel || p.parentTel || '';
  const parentNom = eleve?.parentNom || p.parentNom || '';

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: formatMode === 'ticket80'
      ? `@page { size: 80mm auto; margin: 4mm; } @media print { body { -webkit-print-color-adjust: exact; } }`
      : `@page { size: A5 landscape; margin: 8mm; } @media print { body { -webkit-print-color-adjust: exact; } }`
  });

  const handleSendWhatsApp = () => {
    if (!parentTel) {
      toast.warning(`Aucun numéro de téléphone enregistré pour le parent de ${p.eleveNom}.`);
      return;
    }
    const res = getWhatsAppRecuLink({
      parentTel,
      parentNom,
      eleveNom: p.eleveNom,
      classe: p.classe || p.eleveClasse,
      ref: p.ref,
      montant: p.montant,
      mois: p.mois,
      ecoleNom: parametres?.nom
    });

    window.open(res.url, '_blank');
    toast.success(`Confirmation WhatsApp préparée pour le parent !`);
  };

  // Données de vérification encodées dans le QR Code
  const qrVerificationData = JSON.stringify({
    app: 'GSEK-VERIF',
    ref: p.ref,
    eleve: p.eleveNom,
    matricule: p.eleveMatricule,
    montant: p.montant,
    date: p.date || p.datePaiement,
    ecole: parametres?.nom || 'GSEK'
  });

  const montantLettres = numberToWordsFR(p.montant);

  return (
    <div className="page-container">
      {/* Barre d'outils supérieure */}
      <div className="page-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-outline" onClick={() => navigate('/paiement')}>
            <ArrowLeft size={16} /> Retour
          </button>
          <div>
            <h1 className="page-title">Reçu {p.ref}</h1>
            <p className="page-subtitle">{p.eleveNom} · {p.date || p.datePaiement}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Sélecteur de format d'impression */}
          <div className="segmented-control" style={{ display: 'inline-flex', background: '#f1f5f9', padding: 3, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className={`segmented-btn ${formatMode === 'a5' ? 'active' : ''}`}
              onClick={() => setFormatMode('a5')}
              style={{
                border: 'none',
                background: formatMode === 'a5' ? '#ffffff' : 'transparent',
                fontWeight: 600,
                fontSize: 12,
                padding: '6px 12px',
                borderRadius: 6,
                boxShadow: formatMode === 'a5' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <FileText size={14} /> Format A5 Officiel
            </button>
            <button
              type="button"
              className={`segmented-btn ${formatMode === 'ticket80' ? 'active' : ''}`}
              onClick={() => setFormatMode('ticket80')}
              style={{
                border: 'none',
                background: formatMode === 'ticket80' ? '#ffffff' : 'transparent',
                fontWeight: 600,
                fontSize: 12,
                padding: '6px 12px',
                borderRadius: 6,
                boxShadow: formatMode === 'ticket80' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Receipt size={14} /> Ticket Caisse (80 mm)
            </button>
          </div>

          {/* Bouton WhatsApp */}
          <button
            className="btn"
            style={{
              background: '#25D366',
              color: 'white',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600
            }}
            onClick={handleSendWhatsApp}
            title={parentTel ? `Envoyer confirmation WhatsApp à ${parentTel}` : 'Numéro du parent non renseigné'}
          >
            <MessageSquare size={16} /> Reçu WhatsApp
          </button>

          {/* Bouton Impression */}
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Imprimer ({formatMode === 'ticket80' ? 'Ticket 80mm' : 'Format A5'})
          </button>
        </div>
      </div>

      {/* Conteneur imprimable */}
      <div ref={printRef} className={`receipt-wrapper format-${formatMode}`}>
        {formatMode === 'ticket80' ? (
          /* ======================================================== */
          /* FORMAT TICKET THERMIQUE CAISSE (80 MM)                   */
          /* ======================================================== */
          <div className="receipt-thermal-card">
            <div className="thermal-header">
              <div className="thermal-school-name">{parametres?.nom || "GROUPE SCOLAIRE D'EXCELLENCE SIDY KONATÉ"}</div>
              <div className="thermal-school-sub">{parametres?.adresse || 'Dakar, Sénégal'}</div>
              <div className="thermal-school-sub">Tél : {parametres?.telephone || '+221 33 800 00 00'}</div>
              <div className="thermal-divider" />
              <div className="thermal-title">JUSTIFICATIF D'ENCAISSEMENT</div>
              <div className="thermal-ref">N° {p.ref}</div>
              <div className="thermal-date">Date : {p.date || p.datePaiement}</div>
            </div>

            <div className="thermal-divider" />

            <div className="thermal-info-block">
              <div className="thermal-row">
                <span>ÉLÈVE :</span>
                <strong>{p.eleveNom}</strong>
              </div>
              <div className="thermal-row">
                <span>MATRICULE :</span>
                <span>{p.eleveMatricule}</span>
              </div>
              <div className="thermal-row">
                <span>CLASSE :</span>
                <span>{p.classe || p.eleveClasse}</span>
              </div>
              <div className="thermal-row">
                <span>TYPE :</span>
                <span>{p.type === 'inscription' ? "Frais d'inscription" : 'Mensualité'}</span>
              </div>
              {p.mois && (
                <div className="thermal-row">
                  <span>MOIS :</span>
                  <strong>{p.mois}</strong>
                </div>
              )}
              <div className="thermal-row">
                <span>MODE :</span>
                <span style={{ textTransform: 'uppercase' }}>{p.modePaiement?.replace('_', ' ')}</span>
              </div>
              <div className="thermal-row">
                <span>CAISSE :</span>
                <span>{p.recuPar || currentUser?.prenom || 'Caisse Centrale'}</span>
              </div>
            </div>

            <div className="thermal-divider" />

            <div className="thermal-total-block">
              <div className="thermal-total-label">TOTAL RÉGLÉ :</div>
              <div className="thermal-total-amount">{fmt(p.montant)}</div>
              <div className="thermal-amount-words">« {montantLettres} »</div>
            </div>

            <div className="thermal-divider" />

            <div className="thermal-qr-block">
              <QRCodeSVG value={qrVerificationData} size={84} level="M" />
              <div className="thermal-qr-text">Authenticité certifiée GSEK</div>
            </div>

            <div className="thermal-divider" />

            <div className="thermal-footer">
              <div>Conservez ce ticket pour tout recours</div>
              <div style={{ marginTop: 4, fontStyle: 'italic' }}>{parametres?.devise || 'Excellence · Discipline · Réussite'}</div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* FORMAT A5 OFFICIEL (BUREAUTIQUE & ARCHIVES)              */
          /* ======================================================== */
          <div className="receipt-card">
            <div className="receipt-header">
              <div className="receipt-logo-block">
                <div className="receipt-logo">
                  <School size={30} color="#ffffff" />
                </div>
                <div>
                  <div className="receipt-school-name">{parametres?.nom || "GROUPE SCOLAIRE D'EXCELLENCE SIDY KONATÉ"}</div>
                  <div className="receipt-school-sub">{parametres?.devise || 'Excellence · Discipline · Réussite'} · {parametres?.adresse || 'Dakar, Sénégal'}</div>
                  <div className="receipt-school-sub">Tél : {parametres?.telephone || '+221 33 000 00 00'} · Email : {parametres?.email || 'contact@gsek.sn'}</div>
                </div>
              </div>
              <div className="receipt-ref-badge">
                <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 2 }}>REÇU OFFICIEL N°</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{p.ref}</div>
              </div>
            </div>

            <div className="receipt-title">REÇU DE RÈGLEMENT DE SCOLARITÉ</div>

            <div className="receipt-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                <div className="receipt-section">
                  <div className="receipt-section-title">Informations Élève & Famille</div>
                  <div className="receipt-row"><span>Nom et prénom :</span><span><strong>{p.eleveNom}</strong></span></div>
                  <div className="receipt-row"><span>Matricule :</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.eleveMatricule}</span></div>
                  <div className="receipt-row"><span>Classe fréquentée :</span><span>{p.classe || p.eleveClasse}</span></div>
                  {parentNom && <div className="receipt-row"><span>Parent / Tuteur :</span><span>{parentNom}</span></div>}
                  {parentTel && <div className="receipt-row"><span>Contact parent :</span><span>{parentTel}</span></div>}
                </div>

                <div className="receipt-section">
                  <div className="receipt-section-title">Modalités de Règlement</div>
                  <div className="receipt-row"><span>Motif :</span><span>{p.type === 'inscription' ? "Frais d'inscription" : 'Mensualité scolaire'}</span></div>
                  {p.mois && <div className="receipt-row"><span>Mois échu :</span><strong>{p.mois}</strong></div>}
                  <div className="receipt-row"><span>Mode d'encaissement :</span><span style={{ textTransform: 'capitalize' }}>{p.modePaiement?.replace('_', ' ')}</span></div>
                  <div className="receipt-row"><span>Date opération :</span><span>{p.date || p.datePaiement}</span></div>
                  <div className="receipt-row"><span>Agent caisse :</span><span>{p.recuPar || currentUser?.titre || 'Comptabilité'}</span></div>
                </div>
              </div>

              {p.remarques && (
                <div className="receipt-section" style={{ marginTop: 12 }}>
                  <div className="receipt-section-title">Remarques & Observations</div>
                  <p style={{ fontSize: 13, color: '#444', fontStyle: 'italic', margin: 0 }}>{p.remarques}</p>
                </div>
              )}

              {/* Mention légale du montant en toutes lettres */}
              <div className="receipt-amount-words-box">
                <span style={{ fontWeight: 600, color: '#1a3a6b' }}>Arrêté le présent reçu à la somme de : </span>
                <span style={{ fontStyle: 'italic', fontWeight: 700 }}>« {montantLettres} »</span>
              </div>
            </div>

            <div className="receipt-total">
              <div>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 2 }}>MONTANT TOTAL ENCAISSÉ</div>
                <div className="receipt-amount" style={{ fontFamily: 'var(--font-mono)' }}>{fmt(p.montant)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ textAlign: 'right', fontSize: 12, opacity: 0.9 }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                    <CheckCircle2 size={14} color="#10b981" /> RÈGLEMENT EFFECTUÉ
                  </div>
                  <div>Année scolaire {parametres?.anneeScolaire || '2024-2025'}</div>
                </div>
                <div style={{ background: '#ffffff', padding: 4, borderRadius: 6 }}>
                  <QRCodeSVG value={qrVerificationData} size={46} level="M" />
                </div>
              </div>
            </div>

            <div className="receipt-signatures">
              <div className="receipt-sig">
                <div className="sig-area" />
                <div className="sig-label">Signature & Cachet Caisse</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="receipt-stamp">
                  <span>GSEK</span>
                  <span style={{ fontSize: 9 }}>CAISSE</span>
                </div>
              </div>
              <div className="receipt-sig">
                <div className="sig-area" />
                <div className="sig-label">Émargement Déposant / Parent</div>
              </div>
            </div>

            <div className="receipt-footer">
              Ce reçu officiel délivré par le Groupe Scolaire d'Excellence Sidy Konaté atteste de la régularité du paiement · Vérifiable par QR Code
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
