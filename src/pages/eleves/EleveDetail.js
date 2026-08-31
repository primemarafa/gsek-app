import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Printer, GraduationCap } from 'lucide-react';

export default function EleveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { eleves, paiements, bulletins, parametres } = useApp();
  const printRef = useRef();

  const eleve = eleves.find(e => e.id === id);
  if (!eleve) return <div className="page-container"><p>Élève introuvable.</p></div>;

  const elevePaiements = paiements.filter(p => p.eleveId === id);
  const eleveBulletins = bulletins.filter(b => b.eleveId === id);

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  return (
    <div className="page-container">
      <div className="page-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-outline" onClick={() => navigate('/eleves')}>
            <ArrowLeft size={16} /> Retour
          </button>
          <div>
            <h1 className="page-title">{eleve.prenom} {eleve.nom}</h1>
            <p className="page-subtitle">{eleve.matricule} · {eleve.classe}</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} /> Imprimer la fiche
        </button>
      </div>

      <div ref={printRef} className="print-eleve-card" style={{ padding: 20 }}>
        <PrintHeader parametres={parametres} />
        <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid var(--primary)' }}>
          <h2 style={{ fontSize: 22 }}>FICHE DE L'ÉLÈVE</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <SectionTitle>Informations personnelles</SectionTitle>
            <InfoRow label="Matricule" value={<strong>{eleve.matricule}</strong>} />
            <InfoRow label="Nom" value={eleve.nom} />
            <InfoRow label="Prénom" value={eleve.prenom} />
            <InfoRow label="Sexe" value={eleve.sexe === 'M' ? 'Masculin' : 'Féminin'} />
            <InfoRow label="Date de naissance" value={eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString('fr-SN') : '—'} />
            <InfoRow label="Adresse" value={eleve.adresse || '—'} />
          </div>
          <div>
            <SectionTitle>Scolarité</SectionTitle>
            <InfoRow label="Classe" value={eleve.classe} />
            <InfoRow label="Date d'inscription" value={eleve.dateInscription ? new Date(eleve.dateInscription).toLocaleDateString('fr-SN') : '—'} />
            <InfoRow label="Statut" value={eleve.statut} />
            <SectionTitle style={{ marginTop: 16 }}>Contact parent / tuteur</SectionTitle>
            <InfoRow label="Nom" value={eleve.parentNom || '—'} />
            <InfoRow label="Téléphone" value={eleve.parentTel || '—'} />
          </div>
        </div>

        <div className="no-print" style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Paiements ({elevePaiements.length})</h3>
          {elevePaiements.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Aucun paiement</p> : (
            <table>
              <thead><tr><th>Réf</th><th>Type</th><th>Montant</th><th>Date</th></tr></thead>
              <tbody>
                {elevePaiements.map(p => (
                  <tr key={p.id}>
                    <td>{p.ref}</td>
                    <td>{p.type}</td>
                    <td style={{ fontWeight: 600 }}>{p.montant?.toLocaleString('fr-SN')} FCFA</td>
                    <td>{p.datePaiement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <h3 style={{ marginTop: 24, marginBottom: 16 }}>Bulletins ({eleveBulletins.length})</h3>
          {eleveBulletins.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Aucun bulletin</p> : (
            eleveBulletins.map(b => (
              <div key={b.id} className="card" style={{ marginBottom: 12, padding: '12px 16px' }}>
                <div style={{ fontWeight: 600 }}>{b.trimestre} — {b.annee}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{b.notes?.length || 0} matières saisies</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PrintHeader({ parametres }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 0', marginBottom: 20, borderBottom: '3px solid var(--primary)' }}>
      <div style={{ width: 70, height: 70, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 30, fontWeight: 700 }}>✦</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Playfair Display, serif' }}>
          {parametres?.nom || "GROUPE SCOLAIRE D'EXCELLENCE SIDY KONATÉ"}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {parametres?.devise || "Excellence · Discipline · Réussite"} — {parametres?.adresse || "Dakar, Sénégal"}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, style }) {
  return <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, marginTop: 8, ...style }}>{children}</div>;
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
