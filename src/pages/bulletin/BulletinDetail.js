import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Printer, GraduationCap, MessageSquare, Award } from 'lucide-react';
import { formatPhoneNumberForWhatsApp } from '../../utils/whatsapp';
import './BulletinPrint.css';

export default function BulletinDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { bulletins, eleves, parametres, absences } = useApp();
  const printRef = useRef();

  const bulletin = bulletins.find(b => b.id === id);
  if (!bulletin) return <div className="page-container"><p>Bulletin introuvable.</p></div>;

  const eleve = eleves.find(e => e.id === bulletin.eleveId);
  const eleveAbsences = (absences || []).filter(a => a.eleveId === bulletin.eleveId || (eleve && a.eleveMatricule === eleve.matricule));
  const totalInjustifieesH = eleveAbsences.filter(a => a.type === 'injustifiee').reduce((s, a) => s + (Number(a.dureeHeures) || 0), 0);
  const totalJustifieesH = eleveAbsences.filter(a => a.type === 'justifiee').reduce((s, a) => s + (Number(a.dureeHeures) || 0), 0);
  const totalRetardsCount = eleveAbsences.filter(a => a.type === 'retard').length;
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  // Calcul dynamique du rang dans la classe pour ce trimestre
  const classeNom = bulletin.classe || bulletin.eleveClasse || eleve?.classe;
  const bulletinsClasse = (bulletins || []).filter(b =>
    (b.classe === classeNom || b.eleveClasse === classeNom) &&
    b.trimestre === bulletin.trimestre &&
    b.annee === bulletin.annee
  );
  const sortedClass = [...bulletinsClasse].sort((a, b) => (parseFloat(b.moyenneGenerale) || 0) - (parseFloat(a.moyenneGenerale) || 0));
  const myIndex = sortedClass.findIndex(b => b.id === bulletin.id);
  const rang = myIndex >= 0 ? myIndex + 1 : (bulletin.rang || null);
  const totalClasseEleves = sortedClass.length;

  const mention = (moy) => {
    const m = parseFloat(moy);
    if (m >= 16) return 'Très Bien';
    if (m >= 14) return 'Bien';
    if (m >= 12) return 'Assez Bien';
    if (m >= 10) return 'Passable';
    return 'Insuffisant';
  };

  const distinction = (moy) => {
    const m = parseFloat(moy);
    if (m >= 16) return 'Félicitations du Conseil';
    if (m >= 14) return 'Encouragements & Tableau d\'Honneur';
    if (m >= 12) return 'Tableau d\'Honneur';
    if (m < 9) return 'Avertissement Travail';
    return null;
  };

  const handleSendWhatsAppResults = () => {
    const tel = eleve?.parentTel;
    if (!tel) {
      toast.warning(`Aucun numéro de téléphone enregistré pour le parent de ${bulletin.eleveNom}.`);
      return;
    }
    const cleanPhone = formatPhoneNumberForWhatsApp(tel);
    const rangText = rang ? ` (Rang : ${rang}${rang === 1 ? 'er' : 'ème'}/${totalClasseEleves})` : '';
    const distText = distinction(bulletin.moyenneGenerale) ? `\n• Distinction : *${distinction(bulletin.moyenneGenerale)}*` : '';

    const message =
`🎓 *${parametres?.nom || "Groupe Scolaire d'Excellence Sidy Konaté"}*
Relevé de Résultats — *${bulletin.trimestre}*

Bonjour ${eleve.parentNom ? `M./Mme ${eleve.parentNom}` : 'Cher Parent'},

Nous vous transmettons le bilan trimestriel de votre enfant *${bulletin.eleveNom}* (Classe : ${classeNom}) :

• Moyenne Générale : *${bulletin.moyenneGenerale} / 20*
• Mention : *${mention(bulletin.moyenneGenerale)}*${rangText}${distText}
• Assiduité : ${totalInjustifieesH}h d'absence(s), ${totalRetardsCount} retard(s)

Le bulletin officiel signé est disponible auprès de la direction de l'établissement.`;

    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success("Bilan WhatsApp préparé pour le parent !");
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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
            onClick={handleSendWhatsAppResults}
            title="Envoyer le relevé de notes au parent par WhatsApp"
          >
            <MessageSquare size={16} /> Bilan WhatsApp
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Imprimer le bulletin
          </button>
        </div>
      </div>

      <div ref={printRef} className="bulletin-print">
        <div className="bulletin-header">
          <div className="bulletin-logo">
            <GraduationCap size={36} color="#ffffff" />
          </div>
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
            <span className="info-value">{bulletin.eleveClasse || classeNom}</span>
          </div>
          <div className="info-block">
            <span className="info-label">Rang</span>
            <span className="info-value" style={{ fontWeight: 700, color: rang === 1 ? '#c8960c' : 'inherit' }}>
              {rang ? `${rang}${rang === 1 ? 'er' : 'ème'} / ${totalClasseEleves || 1}` : '—'}
            </span>
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
            {distinction(bulletin.moyenneGenerale) && (
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#c8960c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Award size={13} /> {distinction(bulletin.moyenneGenerale)}
              </div>
            )}
          </div>
          <div className="appreciation-box">
            <div className="app-label">Appréciation générale de la direction</div>
            <div className="app-lines">
              {['', '', ''].map((_, i) => <div key={i} className="app-line" />)}
            </div>
          </div>
        </div>

        <div className="bulletin-assiduite-section" style={{ margin: '14px 0', padding: '10px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
          <div><strong>Vie Scolaire & Assiduité :</strong></div>
          <div>Absences justifiées : <strong>{totalJustifieesH} h</strong></div>
          <div>Absences non justifiées : <strong style={{ color: totalInjustifieesH > 0 ? '#d85a30' : 'inherit' }}>{totalInjustifieesH} h</strong></div>
          <div>Retards : <strong>{totalRetardsCount}</strong></div>
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
