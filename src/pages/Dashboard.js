import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  GraduationCap,
  Users,
  Wallet,
  Receipt,
  Calendar,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard
} from 'lucide-react';
import './Dashboard.css';

const fmt = (n) => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const { eleves, personnel, paiements, transactions, absences, parametres, CLASSES } = useApp();
  const navigate = useNavigate();

  // Calcul dynamique des recettes et dépenses par mois selon l'année scolaire
  const chartData = useMemo(() => {
    const moisScolaires = [
      { key: '09', label: 'Sep' },
      { key: '10', label: 'Oct' },
      { key: '11', label: 'Nov' },
      { key: '12', label: 'Déc' },
      { key: '01', label: 'Jan' },
      { key: '02', label: 'Fév' },
      { key: '03', label: 'Mar' },
      { key: '04', label: 'Avr' },
      { key: '05', label: 'Mai' },
      { key: '06', label: 'Juin' },
    ];

    return moisScolaires.map(m => {
      const txMois = transactions.filter(t => {
        if (!t.date) return false;
        const parts = t.date.split('-');
        return parts[1] === m.key;
      });

      const rec = txMois
        .filter(t => t.type === 'recette')
        .reduce((sum, t) => sum + (Number(t.montant) || 0), 0);

      const dep = txMois
        .filter(t => t.type === 'depense')
        .reduce((sum, t) => sum + (Number(t.montant) || 0), 0);

      return { mois: m.label, recettes: rec, depenses: dep };
    });
  }, [transactions]);

  const totalRecettes = transactions.filter(t => t.type === 'recette').reduce((s, t) => s + (Number(t.montant) || 0), 0);
  const totalDepenses = transactions.filter(t => t.type === 'depense').reduce((s, t) => s + (Number(t.montant) || 0), 0);
  const solde = totalRecettes - totalDepenses;

  const elevesActifs = eleves.filter(e => e.statut === 'actif').length;
  const fillesCount = eleves.filter(e => e.statut === 'actif' && e.sexe === 'F').length;
  const garconsCount = eleves.filter(e => e.statut === 'actif' && e.sexe === 'M').length;
  const pctFilles = elevesActifs ? Math.round((fillesCount / elevesActifs) * 100) : 50;
  const pctGarcons = elevesActifs ? (100 - pctFilles) : 50;

  const personnelActif = personnel.filter(p => p.statut === 'actif').length;
  const enseignantsList = personnel.filter(p => p.statut === 'actif' && (p.role === 'enseignant' || p.matiere));
  const enseignantsCount = enseignantsList.length;

  const totalEncaissePaiements = paiements.reduce((s, p) => s + (Number(p.montant) || 0), 0);
  const paiementsRecents = [...paiements].sort((a, b) => new Date(b.datePaiement) - new Date(a.datePaiement)).slice(0, 5);

  // Estimation du taux de recouvrement
  const scolariteTheorique = Math.max(totalEncaissePaiements, elevesActifs * 300000);
  const tauxRecouvrement = Math.min(100, Math.round((totalEncaissePaiements / (scolariteTheorique || 1)) * 100));

  // Répartition par classe
  const classesAffichees = useMemo(() => {
    const classesCount = (CLASSES || []).map(cls => ({
      nom: cls,
      count: eleves.filter(e => e.classe === cls).length
    }));
    classesCount.sort((a, b) => b.count - a.count);
    return classesCount.slice(0, 5);
  }, [CLASSES, eleves]);

  return (
    <div className="page-container">
      {/* En-tête de page moderne */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Tableau de bord</span>
            <span style={{ fontSize: 13, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 9999, padding: '2px 10px', fontWeight: 600 }}>
              GSEK ERP
            </span>
          </h1>
          <p className="page-subtitle">
            {parametres?.nom || "Groupe Scolaire d'Excellence Sidy Konaté"} · Année scolaire {parametres?.anneeScolaire || "2024-2025"}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', background: '#ffffff', padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}>
          <Calendar size={16} color="var(--primary-accent)" />
          <span style={{ fontWeight: 600 }}>
            {new Date().toLocaleDateString('fr-SN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Cartes KPI Statistiques inspirées de FlyonUI */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card" onClick={() => navigate('/eleves')}>
          <div>
            <div className="stat-header">
              <div className="stat-icon-box blue">
                <GraduationCap size={22} />
              </div>
              <span className="stat-badge-pill success">
                <TrendingUp size={12} /> Actifs
              </span>
            </div>
            <div className="stat-title">Élèves inscrits</div>
            <div className="stat-value">{elevesActifs}</div>
          </div>
          <div>
            <div className="stat-footer-text">
              <span>{CLASSES?.length || 6} classes actives</span>
              <span>·</span>
              <span>{pctFilles}% filles</span>
            </div>
            <div className="stat-progress">
              <div className="stat-progress-bar" style={{ width: `${Math.min(100, elevesActifs * 5)}%`, background: '#2563eb' }} />
            </div>
          </div>
        </div>

        <div className="dash-stat-card" onClick={() => navigate('/personnel')}>
          <div>
            <div className="stat-header">
              <div className="stat-icon-box amber">
                <Users size={22} />
              </div>
              <span className="stat-badge-pill warning">
                <Sparkles size={12} /> Staff
              </span>
            </div>
            <div className="stat-title">Personnel & Enseignants</div>
            <div className="stat-value">{personnelActif}</div>
          </div>
          <div>
            <div className="stat-footer-text">
              <span>{enseignantsCount} enseignants</span>
              <span>·</span>
              <span>{personnelActif - enseignantsCount} admin</span>
            </div>
            <div className="stat-progress">
              <div className="stat-progress-bar" style={{ width: '85%', background: '#d97706' }} />
            </div>
          </div>
        </div>

        <div className="dash-stat-card" onClick={() => navigate('/comptabilite')}>
          <div>
            <div className="stat-header">
              <div className="stat-icon-box emerald">
                <Wallet size={22} />
              </div>
              <span className={`stat-badge-pill ${solde >= 0 ? 'success' : 'warning'}`}>
                {solde >= 0 ? 'Solde excédentaire' : 'Solde déficitaire'}
              </span>
            </div>
            <div className="stat-title">Solde de Trésorerie</div>
            <div className="stat-value" style={{ color: solde >= 0 ? '#059669' : '#dc2626' }}>
              {fmt(solde)}
            </div>
          </div>
          <div>
            <div className="stat-footer-text">
              <span>Recettes : {fmt(totalRecettes)}</span>
            </div>
            <div className="stat-progress">
              <div className="stat-progress-bar" style={{ width: '75%', background: '#10b981' }} />
            </div>
          </div>
        </div>

        <div className="dash-stat-card" onClick={() => navigate('/paiement')}>
          <div>
            <div className="stat-header">
              <div className="stat-icon-box purple">
                <Receipt size={22} />
              </div>
              <span className="stat-badge-pill purple">
                <CheckCircle2 size={12} /> Certifiés
              </span>
            </div>
            <div className="stat-title">Reçus & Encaissements</div>
            <div className="stat-value">{paiements.length}</div>
          </div>
          <div>
            <div className="stat-footer-text">
              <span>Total : {fmt(totalEncaissePaiements)}</span>
            </div>
            <div className="stat-progress">
              <div className="stat-progress-bar" style={{ width: '92%', background: '#7c3aed' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Rangée Executive Banner (Recouvrement & Démographie) */}
      <div className="executive-row">
        {/* Recouvrement des Frais Scolaires */}
        <div className="executive-card">
          <div className="executive-header">
            <div className="executive-header-title">
              <div className="stat-icon-box blue" style={{ width: 36, height: 36, borderRadius: 8 }}>
                <CreditCard size={18} />
              </div>
              <div>
                <h3>Recouvrement des Frais Scolaires</h3>
                <p>Niveau global de recouvrement des scolarités</p>
              </div>
            </div>
            <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => navigate('/comptabilite')}>
              Audit caisse <ArrowRight size={13} />
            </button>
          </div>

          <div className="recovery-gauge">
            <div className="recovery-meta">
              <div className="recovery-pct">{tauxRecouvrement}%</div>
              <div className="recovery-amounts">
                <strong>{fmt(totalEncaissePaiements)}</strong> encaissés sur {fmt(scolariteTheorique)}
              </div>
            </div>
            <div className="recovery-bar-container">
              <div className="recovery-bar-fill" style={{ width: `${tauxRecouvrement}%` }} />
            </div>
            <div className="recovery-pills">
              <div className="recovery-pill-item">
                <span className="recovery-dot" style={{ background: '#2563eb' }} />
                <span>Espèces & Guichet</span>
              </div>
              <div className="recovery-pill-item">
                <span className="recovery-dot" style={{ background: '#10b981' }} />
                <span>Wave & Orange Money</span>
              </div>
              <div className="recovery-pill-item">
                <span className="recovery-dot" style={{ background: '#f59e0b' }} />
                <span>Virements & Chèques</span>
              </div>
            </div>
          </div>
        </div>

        {/* Démographie & Assiduité Scolaire */}
        <div className="executive-card">
          <div className="executive-header">
            <div className="executive-header-title">
              <div className="stat-icon-box emerald" style={{ width: 36, height: 36, borderRadius: 8 }}>
                <Clock size={18} />
              </div>
              <div>
                <h3>Assiduité & Démographie</h3>
                <p>Répartition des apprenants & ponctualité</p>
              </div>
            </div>
            <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => navigate('/viescolaire')}>
              Vie scolaire <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: '#2563eb' }}>Garçons : {garconsCount} ({pctGarcons}%)</span>
              <span style={{ color: '#ec4899' }}>Filles : {fillesCount} ({pctFilles}%)</span>
            </div>
            <div className="demographics-bar">
              <div className="demographics-fill-m" style={{ width: `${pctGarcons}%` }} />
              <div className="demographics-fill-f" style={{ width: `${pctFilles}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 12.5, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} color="#10b981" /> Assiduité moyenne générale
              </span>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>97.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grille Principale (Graphique financier + Répartition & Personnel) */}
      <div className="dash-main-grid">
        {/* Colonne Gauche : BarChart + Récents Paiements */}
        <div className="dash-main-column">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Flux Financier Mensuel</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Recettes vs Dépenses (en FCFA)</p>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#1e3a8a', display: 'inline-block' }} />
                  Recettes
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#d97706', display: 'inline-block' }} />
                  Dépenses
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} barSize={26}>
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                <Bar dataKey="recettes" fill="#1e3a8a" name="Recettes" radius={[4, 4, 0, 0]} />
                <Bar dataKey="depenses" fill="#d97706" name="Dépenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Derniers Paiements Encaissés</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Reçus certifiés avec QR Code</p>
              </div>
              <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => navigate('/paiement')}>
                Tous les reçus <ArrowRight size={13} />
              </button>
            </div>
            {paiementsRecents.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 10px' }}><p>Aucun paiement récent</p></div>
            ) : (
              paiementsRecents.map(p => {
                const initials = p.eleveNom ? p.eleveNom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'PA';
                return (
                  <div key={p.id} className="payment-item">
                    <div className="payment-left">
                      <div className="payment-avatar">{initials}</div>
                      <div>
                        <div style={{ fontWeight: 650, fontSize: 13.5, color: '#0f172a' }}>{p.eleveNom}</div>
                        <div style={{ fontSize: 11.5, color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          {p.ref} · {p.datePaiement} · <span style={{ textTransform: 'capitalize' }}>{p.mode || 'Espèces'}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-success" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {fmt(p.montant)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Colonne Droite : Classes + Équipe Enseignante (FlyonUI Widgets pattern) */}
        <div className="dash-main-column">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Effectifs par Classe</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Top classes par nombre d'élèves</p>
              </div>
              <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => navigate('/eleves')}>
                Classes
              </button>
            </div>
            {classesAffichees.map(item => {
              const count = item.count;
              const pct = elevesActifs ? Math.round((count / elevesActifs) * 100) : 0;
              return (
                <div key={item.nom} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{item.nom}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      {count} élève{count > 1 ? 's' : ''} ({pct}%)
                    </span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 9999, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${pct || 0}%`, background: 'var(--primary-accent)', height: '100%', borderRadius: 9999, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Équipe Pédagogique & Enseignants (FlyonUI Widget-2 Instructors pattern) */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Corps Enseignant</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Personnel pédagogique clé</p>
              </div>
              <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => navigate('/personnel')}>
                Personnel
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {enseignantsList.slice(0, 4).map(ens => {
                const initials = `${ens.prenom?.[0] || ''}${ens.nom?.[0] || ''}`.toUpperCase();
                return (
                  <div key={ens.id} className="instructor-item">
                    <div className="instructor-avatar">{initials}</div>
                    <div className="instructor-info">
                      <div className="instructor-name">{ens.prenom} {ens.nom}</div>
                      <div className="instructor-subject">{ens.matiere || 'Enseignant principal'}</div>
                    </div>
                    <span className="instructor-status">
                      <CheckCircle2 size={11} /> Actif
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Raccourcis et Actions Rapides */}
      <div className="card" style={{ marginTop: 8 }}>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text)' }}>Actions Rapides</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Raccourcis vers les flux opérationnels prioritaires</p>
        </div>
        <div className="dash-quick-pills">
          <button className="quick-action-pill primary" onClick={() => navigate('/eleves')}>
            <Plus size={15} /> Inscrire un élève
          </button>
          <button className="quick-action-pill secondary" onClick={() => navigate('/paiement')}>
            <Receipt size={15} /> Émettre un reçu
          </button>
          <button className="quick-action-pill" onClick={() => navigate('/badges')}>
            <CreditCard size={15} /> Imprimer les badges
          </button>
          <button className="quick-action-pill" onClick={() => navigate('/bulletin')}>
            <FileText size={15} /> Saisir les notes
          </button>
          <button className="quick-action-pill" onClick={() => navigate('/viescolaire')}>
            <Clock size={15} /> Pointage présence
          </button>
          <button className="quick-action-pill" onClick={() => navigate('/comptabilite')}>
            <Wallet size={15} /> Clôture de caisse
          </button>
        </div>
      </div>
    </div>
  );
}
