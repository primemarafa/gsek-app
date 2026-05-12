import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const fmt = n => new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';

export default function PaiementPage() {
  const { paiements, eleves, addPaiement } = useApp();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ eleveId: '', type: 'mensualite', montant: '', mois: '', modePaiement: 'especes', remarques: '' });

  const filtered = paiements.filter(p =>
    (p.eleveNom + ' ' + p.ref).toLowerCase().includes(search.toLowerCase())
  );

  const totalRecettes = paiements.reduce((s, p) => s + (p.montant || 0), 0);

  const handleSubmit = () => {
    if (!form.eleveId || !form.montant) return alert('Élève et montant requis');
    const eleve = eleves.find(e => e.id === form.eleveId);
    addPaiement({
      ...form,
      montant: parseFloat(form.montant),
      eleveId: eleve.id,
      eleveNom: `${eleve.nom} ${eleve.prenom}`,
      eleveClasse: eleve.classe,
      eleveMatricule: eleve.matricule,
    });
    setShowModal(false);
    setForm({ eleveId: '', type: 'mensualite', montant: '', mois: '', modePaiement: 'especes', remarques: '' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">🧾 Reçus de Paiement</h1>
          <p className="page-subtitle">Total encaissé : <strong>{fmt(totalRecettes)}</strong></p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Nouveau reçu</button>
      </div>

      <div className="card">
        <div className="search-bar" style={{ marginBottom: 20 }}>
          <span>🔍</span>
          <input placeholder="Rechercher par élève ou référence..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🧾</div>
            <h3>Aucun reçu enregistré</h3>
            <p>Créez le premier reçu de paiement.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Référence</th><th>Élève</th><th>Classe</th><th>Type</th><th>Mois</th><th>Montant</th><th>Mode</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#eef2f9', padding: '3px 8px', borderRadius: 4 }}>{p.ref}</span></td>
                  <td style={{ fontWeight: 600 }}>{p.eleveNom}</td>
                  <td>{p.eleveClasse}</td>
                  <td><span className={`badge ${p.type === 'inscription' ? 'badge-info' : 'badge-gold'}`}>{p.type === 'inscription' ? 'Inscription' : 'Mensualité'}</span></td>
                  <td>{p.mois || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>{fmt(p.montant)}</td>
                  <td>{p.modePaiement}</td>
                  <td>{p.datePaiement}</td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => navigate(`/paiement/${p.id}`)}>🖨 Reçu</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 20 }}>Enregistrer un paiement</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20 }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Élève *</label>
                <select value={form.eleveId} onChange={e => setForm({ ...form, eleveId: e.target.value })}>
                  <option value="">Sélectionner un élève</option>
                  {eleves.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom} — {e.classe}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type de paiement</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="inscription">Frais d'inscription</option>
                    <option value="mensualite">Mensualité</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Mois (si mensualité)</label>
                  <select value={form.mois} onChange={e => setForm({ ...form, mois: e.target.value })}>
                    <option value="">—</option>
                    {['Septembre','Octobre','Novembre','Décembre','Janvier','Février','Mars','Avril','Mai','Juin'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Montant (FCFA) *</label>
                  <input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} placeholder="50000" />
                </div>
                <div className="form-group">
                  <label>Mode de paiement</label>
                  <select value={form.modePaiement} onChange={e => setForm({ ...form, modePaiement: e.target.value })}>
                    <option value="especes">Espèces</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="cheque">Chèque</option>
                    <option value="virement">Virement bancaire</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Remarques</label>
                <textarea value={form.remarques} onChange={e => setForm({ ...form, remarques: e.target.value })} rows={2} placeholder="Optionnel..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit}>✅ Enregistrer et générer le reçu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
