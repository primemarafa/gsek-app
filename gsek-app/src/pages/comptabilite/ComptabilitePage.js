import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const fmt = n => new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';

const COLORS_REC = ['#1a3a6b', '#2451a3', '#4a74c9', '#7ea6e0'];
const COLORS_DEP = ['#c8960c', '#e8b020', '#d85a30', '#993c1d'];

export default function ComptabilitePage() {
  const { transactions, addTransaction } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], type: 'recette', categorie: 'Inscriptions', montant: '', description: '' });

  const filtered = transactions.filter(t => !filterType || t.type === filterType);
  const totalRecettes = transactions.filter(t => t.type === 'recette').reduce((s, t) => s + t.montant, 0);
  const totalDepenses = transactions.filter(t => t.type === 'depense').reduce((s, t) => s + t.montant, 0);
  const solde = totalRecettes - totalDepenses;

  const recettesCats = {};
  const depensesCats = {};
  transactions.filter(t => t.type === 'recette').forEach(t => { recettesCats[t.categorie] = (recettesCats[t.categorie] || 0) + t.montant; });
  transactions.filter(t => t.type === 'depense').forEach(t => { depensesCats[t.categorie] = (depensesCats[t.categorie] || 0) + t.montant; });

  const pieRecettes = Object.entries(recettesCats).map(([name, value]) => ({ name, value }));
  const pieDepenses = Object.entries(depensesCats).map(([name, value]) => ({ name, value }));

  const handleSubmit = () => {
    if (!form.montant) return alert('Montant requis');
    addTransaction({ ...form, montant: parseFloat(form.montant) });
    setShowModal(false);
    setForm({ date: new Date().toISOString().split('T')[0], type: 'recette', categorie: 'Inscriptions', montant: '', description: '' });
  };

  const catOptions = form.type === 'recette'
    ? ['Inscriptions', 'Mensualités', 'Dons', 'Subventions', 'Autres recettes']
    : ['Salaires', 'Fournitures', 'Eau & Électricité', 'Entretien', 'Communication', 'Transport', 'Autres dépenses'];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Comptabilité</h1>
          <p className="page-subtitle">{transactions.length} transactions enregistrées</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Nouvelle transaction</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon green">📈</div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Total recettes</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>{fmt(totalRecettes)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">📉</div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Total dépenses</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>{fmt(totalDepenses)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">💼</div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Solde net</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: solde >= 0 ? 'var(--success)' : 'var(--danger)' }}>{fmt(solde)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>📊 Recettes par catégorie</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieRecettes} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {pieRecettes.map((_, i) => <Cell key={i} fill={COLORS_REC[i % COLORS_REC.length]} />)}
              </Pie>
              <Tooltip formatter={fmt} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>📊 Dépenses par catégorie</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieDepenses} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {pieDepenses.map((_, i) => <Cell key={i} fill={COLORS_DEP[i % COLORS_DEP.length]} />)}
              </Pie>
              <Tooltip formatter={fmt} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <select style={{ width: 'auto', minWidth: 180 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Toutes les transactions</option>
            <option value="recette">Recettes uniquement</option>
            <option value="depense">Dépenses uniquement</option>
          </select>
        </div>
        <table>
          <thead>
            <tr><th>Référence</th><th>Date</th><th>Type</th><th>Catégorie</th><th>Description</th><th>Montant</th></tr>
          </thead>
          <tbody>
            {filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => (
              <tr key={t.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.ref}</td>
                <td>{t.date}</td>
                <td><span className={`badge ${t.type === 'recette' ? 'badge-success' : 'badge-danger'}`}>{t.type === 'recette' ? '📈 Recette' : '📉 Dépense'}</span></td>
                <td>{t.categorie}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.description}</td>
                <td style={{ fontWeight: 700, color: t.type === 'recette' ? 'var(--success)' : 'var(--danger)' }}>{t.type === 'depense' ? '–' : '+'}{fmt(t.montant)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 20 }}>Nouvelle transaction</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20 }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, categorie: '' })}>
                    <option value="recette">📈 Recette</option>
                    <option value="depense">📉 Dépense</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie</label>
                  <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
                    {catOptions.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Montant (FCFA) *</label>
                  <input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} placeholder="150000" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Description de la transaction..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit}>✅ Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
