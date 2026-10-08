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
  ArrowRight
} from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const { eleves, personnel, paiements, transactions, parametres, CLASSES } = useApp();
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

  const totalRecettes = transactions.filter(t => t.type === 'recette').reduce((s, t) => s + t.montant, 0);
  const totalDepenses = transactions.filter(t => t.type === 'depense').reduce((s, t) => s + t.montant, 0);
  const solde = totalRecettes - totalDepenses;

  const elevesActifs = eleves.filter(e => e.statut === 'actif').length;
  const personnelActif = personnel.filter(p => p.statut === 'actif').length;
  const paiementsRecents = [...paiements].sort((a, b) => new Date(b.datePaiement) - new Date(a.datePaiement)).slice(0, 5);

  // Répartition dynamique des classes ayant des élèves (ou top 5 des classes)
  const classesAffichees = useMemo(() => {
    const classesCount = (CLASSES || []).map(cls => ({
      nom: cls,
      count: eleves.filter(e => e.classe === cls).length
    }));
    // Trier par nombre d'élèves décroissant
    classesCount.sort((a, b) => b.count - a.count);
    return classesCount.slice(0, 5);
  }, [CLASSES, eleves]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">{parametres?.nom || "Groupe Scolaire d'Excellence Sidy Konaté"} — Année {parametres?.anneeScolaire || "2024-2025"}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', background: 'white', padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('fr-SN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="dash-stats">
        <div className="stat-card" onClick={() => navigate('/eleves')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon blue"><GraduationCap size={26} /></div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Élèves inscrits</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{elevesActifs}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Actifs cette année</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/personnel')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon gold"><Users size={26} /></div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Personnel</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{personnelActif}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Membres actifs</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/comptabilite')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon green"><Wallet size={26} /></div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Solde général</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: solde >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {fmt(solde)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Recettes – Dépenses</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/paiement')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon red"><Receipt size={26} /></div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Reçus émis</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{paiements.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total paiements</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card" style={{ gridColumn: '1 / 3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Recettes vs Dépenses</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Flux financier mensuel (FCFA)</p>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
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
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={24}>
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="recettes" fill="#1e3a8a" name="Recettes" radius={[4, 4, 0, 0]} />
              <Bar dataKey="depenses" fill="#d97706" name="Dépenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Répartition par classe</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Top classes par effectif</p>
          </div>
          {classesAffichees.map(item => {
            const count = item.count;
            const pct = elevesActifs ? Math.round((count / elevesActifs) * 100) : 0;
            return (
              <div key={item.nom} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 500, color: 'var(--text)' }}>{item.nom}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{count} élève{count > 1 ? 's' : ''} ({pct}%)</span>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${pct || 0}%`, background: 'var(--primary-accent)', height: '100%', borderRadius: 6, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Paiements récents</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Derniers encaissements</p>
            </div>
            <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => navigate('/paiement')}>
              Voir tout <ArrowRight size={13} />
            </button>
          </div>
          {paiementsRecents.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 10px' }}><p>Aucun paiement enregistré</p></div>
          ) : (
            paiementsRecents.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{p.eleveNom}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.ref} · {p.datePaiement}</div>
                </div>
                <div>
                  <span className="badge badge-success" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmt(p.montant)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dash-quick-actions card" style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Actions rapides</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Raccourcis vers les opérations courantes</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/eleves')}>
            <Plus size={15} /> Inscrire un élève
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/paiement')}>
            <Receipt size={15} /> Nouveau reçu
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/bulletin')}>
            <FileText size={15} /> Saisir les notes
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/comptabilite')}>
            <Wallet size={15} /> Ajouter transaction
          </button>
        </div>
      </div>
    </div>
  );
}
