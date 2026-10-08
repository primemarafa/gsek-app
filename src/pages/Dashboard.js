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
  Plus
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
          <h3 style={{ marginBottom: 20 }}>📊 Recettes vs Dépenses (FCFA)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="recettes" fill="#1a3a6b" name="Recettes" radius={[4,4,0,0]} />
              <Bar dataKey="depenses" fill="#c8960c" name="Dépenses" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>🎒 Répartition par classe</h3>
          {classesAffichees.map(item => {
            const count = item.count;
            const pct = elevesActifs ? Math.round((count / elevesActifs) * 100) : 0;
            return (
              <div key={item.nom} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{item.nom}</span><span style={{ fontWeight: 600 }}>{count} élève{count > 1 ? 's' : ''}</span>
                </div>
                <div style={{ background: '#eef2f9', borderRadius: 4, height: 8 }}>
                  <div style={{ width: `${pct || 0}%`, background: 'var(--primary)', height: '100%', borderRadius: 4, transition: 'width 0.6s' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>🧾 Paiements récents</h3>
            <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => navigate('/paiement')}>Voir tout</button>
          </div>
          {paiementsRecents.length === 0 ? (
            <div className="empty-state"><p>Aucun paiement enregistré</p></div>
          ) : (
            paiementsRecents.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.eleveNom}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.ref} · {p.datePaiement}</div>
                </div>
                <div>
                  <span className="badge badge-success">{fmt(p.montant)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dash-quick-actions card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>⚡ Actions rapides</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/eleves')}>
            <Plus size={16} /> Inscrire un élève
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/paiement')}>
            <Receipt size={16} /> Nouveau reçu
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/bulletin')}>
            <FileText size={16} /> Saisir les notes
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/comptabilite')}>
            <Wallet size={16} /> Ajouter transaction
          </button>
        </div>
      </div>
    </div>
  );
}
