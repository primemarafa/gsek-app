import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Printer } from 'lucide-react';
import './BulletinPrint.css';

export default function BulletinDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bulletins, eleves, parametres } = useApp();
  const printRef = useRef();

  const bulletin = bulletins.find(b => b.id === id);
  if (!bulletin) return <div className="page-container"><p>Bulletin introuvable.</p></div>;

  const eleve = eleves.find(e => e.id === bulletin.eleveId);
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const mention = (moy) => {
    const m = parseFloat(moy);
    if (m >= 16) return 'Très Bien';
    if (m >= 14) return 'Bien';
    if (m >= 12) return 'Assez Bien';
    if (m >= 10) return 'Passable';
    return 'Insuffisant';
  };

  const notes = bulletin.notes?.filter(n => n.note !== '') || [];
  const totalPoints = notes.reduce((s, n) => s + parseFloat(n.note) * parseFloat(n.coeff || 1), 0);
  const totalCoeff = notes.reduce((s, n) => s + parseFloat(n.coeff || 1), 0);

  return (
    <div className="page-container">
      <div className="page-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-outline" onClick={() => navigate('/bulletin')}>
            <ArrowLeft size={16} /> Retour
          </button>
          <div>
            <h1 className="page-title">Bulletin — {bulletin.eleveNom}</h1>
            <p className="page-subtitle">{bulletin.trimestre} · {bulletin.annee}</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} /> Imprimer le bulletin
        </button>
      </div>

      <div ref={printRef} className="bulletin-print">
        <div className="bulletin-header">
          <div className="bulletin-logo">✦</div>
          <div className="bulletin-school-info">
            <div className="bulletin-school-name">{parametres?.nom || "GROUPE SCOLAIRE D'EXCELLENCE SIDY KONATÉ"}</div>
            <div className="bulletin-school-sub">{parametres?.devise || 'Excellence · Discipline · Réussite'}</div>
            <div className="bulletin-school-sub">{parametres?.adresse || 'Dakar, Sénégal'} {parametres?.telephone ? `· Tél : ${parametres.telephone}` : ''}</div>
          </div>
          <div className="bulletin-badge-wrapper">
            <div className="bulletin-year-badge">{bulletin.annee}</div>
          </div>
        </div>

        <div className="bulletin-title-bar">
          BULLETIN DE NOTES — {bulletin.trimestre?.toUpperCase()}
        </div>

        <div className="bulletin-eleve-info">
          <div className="info-block">
            <span className="info-label">Nom et prénom</span>
            <span className="info-value">{bulletin.eleveNom}</span>
          </div>
          <div className="info-block">
            <span className="info-label">Matricule</span>
            <span className="info-value">{eleve?.matricule || '—'}</span>
          </div>
          <div className="info-block">
            <span className="info-label">Classe</span>
            <span className="info-value">{bulletin.eleveClasse}</span>
          </div>
          <div className="info-block">
            <span className="info-label">Date</span>
            <span className="info-value">{new Date().toLocaleDateString('fr-SN')}</span>
          </div>
        </div>

        <table className="bulletin-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Matière</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Note</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Max.</th>
              <th style={{ width: '8%', textAlign: 'center' }}>Coeff.</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Points</th>
              <th style={{ width: '30%' }}>Appréciation du professeur</th>
            </tr>
          </thead>
          <tbody>
            {(bulletin.notes || []).filter(n => n.note !== '').map((n, i) => (
              <tr key={i} className={i % 2 === 0 ? 'row-even' : ''}>
                <td className="matiere-cell">{n.matiere}</td>
                <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 15 }}>{parseFloat(n.note).toFixed(2)}</td>
                <td style={{ textAlign: 'center', color: '#666' }}>20</td>
                <td style={{ textAlign: 'center' }}>{n.coeff}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{(parseFloat(n.note) * parseFloat(n.coeff || 1)).toFixed(2)}</td>
                <td style={{ fontStyle: 'italic', color: '#444', fontSize: 13 }}>{n.appreciation || '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan={3}><strong>TOTAUX</strong></td>
              <td style={{ textAlign: 'center' }}><strong>{totalCoeff}</strong></td>
              <td style={{ textAlign: 'center' }}><strong>{totalPoints.toFixed(2)}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div className="bulletin-moyenne-section">
          <div className="moyenne-box">
            <div className="moyenne-label">Moyenne générale</div>
            <div className="moyenne-value">{bulletin.moyenneGenerale}/20</div>
            <div className="moyenne-mention">{mention(bulletin.moyenneGenerale)}</div>
          </div>
          <div className="appreciation-box">
            <div className="app-label">Appréciation générale de la direction</div>
            <div className="app-lines">
              {['', '', ''].map((_, i) => <div key={i} className="app-line" />)}
            </div>
          </div>
        </div>

        <div className="bulletin-signatures">
          <div className="sig-block">
            <div className="sig-label">Signature du Directeur</div>
            <div className="sig-space" />
            <div className="sig-name">Le Directeur</div>
          </div>
          <div className="sig-block">
            <div className="sig-label">Cachet de l'établissement</div>
            <div className="sig-space" />
          </div>
          <div className="sig-block">
            <div className="sig-label">Signature du Parent / Tuteur</div>
            <div className="sig-space" />
            <div className="sig-name">Lu et approuvé</div>
          </div>
        </div>

        <div className="bulletin-footer">
          Groupe Scolaire d'Excellence Sidy Konaté — Dakar, Sénégal — Année {bulletin.annee}
        </div>
      </div>
    </div>
  );
}
