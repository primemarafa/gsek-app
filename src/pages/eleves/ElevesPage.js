import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function ElevesPage() {
  const { eleves, addEleve, deleteEleve, CLASSES } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nom: '', prenom: '', dateNaissance: '', sexe: 'M', classe: '6ème A', parentNom: '', parentTel: '', adresse: '', statut: 'actif' });

  const filtered = eleves.filter(e =>
    (e.nom + ' ' + e.prenom + ' ' + e.matricule).toLowerCase().includes(search.toLowerCase()) &&
    (filterClasse ? e.classe === filterClasse : true)
  );

  const handleSubmit = () => {
    if (!form.nom || !form.prenom) return alert('Nom et prénom requis');
    addEleve(form);
    setShowModal(false);
    setForm({ nom: '', prenom: '', dateNaissance: '', sexe: 'M', classe: '6ème A', parentNom: '', parentTel: '', adresse: '', statut: 'actif' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎒 Gestion des Élèves</h1>
          <p className="page-subtitle">{eleves.length} élève{eleves.length > 1 ? 's' : ''} enregistré{eleves.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Inscrire un élève</button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <span>🔍</span>
            <input placeholder="Rechercher par nom, prénom ou matricule..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={{ width: 'auto', minWidth: 160 }} value={filterClasse} onChange={e => setFilterClasse(e.target.value)}>
            <option value="">Toutes les classes</option>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎒</div>
            <h3>Aucun élève trouvé</h3>
            <p>Inscrivez un nouvel élève pour commencer.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom & Prénom</th>
                <th>Classe</th>
                <th>Sexe</th>
                <th>Date de naissance</th>
                <th>Parent / Tuteur</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td><span className="badge badge-info" style={{ fontFamily: 'monospace', fontSize: 12 }}>{e.matricule}</span></td>
                  <td style={{ fontWeight: 600 }}>{e.nom} {e.prenom}</td>
                  <td>{e.classe}</td>
                  <td>{e.sexe === 'M' ? '♂ Garçon' : '♀ Fille'}</td>
                  <td>{e.dateNaissance ? new Date(e.dateNaissance).toLocaleDateString('fr-SN') : '—'}</td>
                  <td style={{ fontSize: 13 }}>{e.parentNom}<br /><span style={{ color: 'var(--text-muted)' }}>{e.parentTel}</span></td>
                  <td><span className={`badge ${e.statut === 'actif' ? 'badge-success' : 'badge-warning'}`}>{e.statut}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => navigate(`/eleves/${e.id}`)}>Voir</button>
                      <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => { if (window.confirm('Supprimer cet élève ?')) deleteEleve(e.id); }}>🗑</button>
                    </div>
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
              <h2 style={{ fontSize: 20 }}>Inscrire un nouvel élève</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Konaté" />
                </div>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Amadou" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date de naissance</label>
                  <input type="date" value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Sexe</label>
                  <select value={form.sexe} onChange={e => setForm({ ...form, sexe: e.target.value })}>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Classe</label>
                  <select value={form.classe} onChange={e => setForm({ ...form, classe: e.target.value })}>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom du parent / tuteur</label>
                  <input value={form.parentNom} onChange={e => setForm({ ...form, parentNom: e.target.value })} placeholder="Konaté Ibrahima" />
                </div>
                <div className="form-group">
                  <label>Téléphone parent</label>
                  <input value={form.parentTel} onChange={e => setForm({ ...form, parentTel: e.target.value })} placeholder="+221 77 000 00 00" />
                </div>
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} placeholder="Dakar, Médina" />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>⚡ Un matricule unique sera généré automatiquement</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit}>✅ Inscrire l'élève</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
