import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  X
} from 'lucide-react';

export default function BulletinPage() {
  const { eleves, bulletins, addBulletin, CLASSES, MATIERES, ANNEES, TRIMESTRES } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [filterClasse, setFilterClasse] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ eleveId: '', annee: '2024-2025', trimestre: '1er Trimestre', notes: [] });

  const elevesDisponibles = eleves.filter(e => !filterClasse || e.classe === filterClasse);
  const filtered = bulletins.filter(b => {
    const eleve = eleves.find(e => e.id === b.eleveId);
    return (
      (!filterClasse || (eleve && eleve.classe === filterClasse)) &&
      (!search || (eleve && (eleve.nom + ' ' + eleve.prenom).toLowerCase().includes(search.toLowerCase())))
    );
  });

  const handleSelectEleve = (eleveId) => {
    setForm(prev => ({
      ...prev, eleveId,
      notes: MATIERES.map(m => ({ matiere: m, note: '', noteMax: 20, coeff: 1, appreciation: '' }))
    }));
  };

  const handleNoteChange = (index, field, val) => {
    setForm(prev => {
      const notes = [...prev.notes];
      notes[index] = { ...notes[index], [field]: val };
      return { ...prev, notes };
    });
  };

  const moyenneGenerale = () => {
    const notes = form.notes.filter(n => n.note !== '');
    if (!notes.length) return null;
    const total = notes.reduce((s, n) => s + parseFloat(n.note) * parseFloat(n.coeff || 1), 0);
    const coeffTotal = notes.reduce((s, n) => s + parseFloat(n.coeff || 1), 0);
    return (total / coeffTotal).toFixed(2);
  };

  const mention = (moy) => {
    const m = parseFloat(moy);
    if (m >= 16) return { label: 'Très Bien', cls: 'badge-success' };
    if (m >= 14) return { label: 'Bien', cls: 'badge-info' };
    if (m >= 12) return { label: 'Assez Bien', cls: 'badge-gold' };
    if (m >= 10) return { label: 'Passable', cls: 'badge-warning' };
    return { label: 'Insuffisant', cls: 'badge-danger' };
  };

  const handleSubmit = () => {
    if (!form.eleveId) {
      return toast.error('Veuillez sélectionner un élève pour le bulletin.');
    }
    const eleve = eleves.find(e => e.id === form.eleveId);
    const moy = moyenneGenerale();
    addBulletin({
      ...form,
      eleveNom: `${eleve.nom} ${eleve.prenom}`,
      eleveClasse: eleve.classe,
      moyenneGenerale: moy,
      mention: moy ? mention(moy).label : ''
    });
    toast.success(`Bulletin généré pour ${eleve.nom} ${eleve.prenom} (Moyenne : ${moy || '—'}/20) !`);
    setShowModal(false);
    setForm({ eleveId: '', annee: '2024-2025', trimestre: '1er Trimestre', notes: [] });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={28} /> Bulletins de Notes
          </h1>
          <p className="page-subtitle">{bulletins.length} bulletin{bulletins.length > 1 ? 's' : ''} généré{bulletins.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Nouveau bulletin
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={17} color="#94a3b8" />
            <input placeholder="Rechercher un élève..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="#64748b" />
            <select style={{ width: 'auto', minWidth: 160 }} value={filterClasse} onChange={e => setFilterClasse(e.target.value)}>
              <option value="">Toutes les classes</option>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><FileText size={44} /></div>
            <h3>Aucun bulletin</h3>
            <p>Créez le premier bulletin en cliquant sur "Nouveau bulletin"</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr><th>Élève</th><th>Classe</th><th>Année</th><th>Trimestre</th><th>Moyenne</th><th>Mention</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const m = b.moyenneGenerale ? mention(b.moyenneGenerale) : null;
                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.eleveNom}</td>
                      <td>{b.eleveClasse}</td>
                      <td>{b.annee}</td>
                      <td>{b.trimestre}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16 }}>{b.moyenneGenerale || '—'}/20</td>
                      <td>{m ? <span className={`badge ${m.cls}`}>{m.label}</span> : '—'}</td>
                      <td>
                        <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => navigate(`/bulletin/${b.id}`)}>
                          <Printer size={14} /> Imprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 20 }}>Nouveau bulletin de notes</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Élève *</label>
                  <select value={form.eleveId} onChange={e => handleSelectEleve(e.target.value)}>
                    <option value="">Sélectionner un élève</option>
                    {eleves.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom} — {e.classe}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Année scolaire</label>
                  <select value={form.annee} onChange={e => setForm({ ...form, annee: e.target.value })}>
                    {ANNEES.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Trimestre</label>
                <select value={form.trimestre} onChange={e => setForm({ ...form, trimestre: e.target.value })}>
                  {TRIMESTRES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {form.notes.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <label style={{ marginBottom: 0 }}>Saisie des notes</label>
                    {moyenneGenerale() && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Moyenne :</span>
                        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{moyenneGenerale()}/20</span>
                      </div>
                    )}
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <table>
                      <thead>
                        <tr><th>Matière</th><th>Note /20</th><th>Coeff.</th><th>Appréciation</th></tr>
                      </thead>
                      <tbody>
                        {form.notes.map((n, i) => (
                          <tr key={n.matiere}>
                            <td style={{ fontWeight: 500 }}>{n.matiere}</td>
                            <td><input type="number" min="0" max="20" step="0.5" value={n.note} onChange={e => handleNoteChange(i, 'note', e.target.value)} style={{ width: 70, textAlign: 'center' }} placeholder="—" /></td>
                            <td><input type="number" min="1" max="5" value={n.coeff} onChange={e => handleNoteChange(i, 'coeff', e.target.value)} style={{ width: 60, textAlign: 'center' }} /></td>
                            <td><input value={n.appreciation} onChange={e => handleNoteChange(i, 'appreciation', e.target.value)} placeholder="Bon travail..." style={{ fontSize: 13 }} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit}>✅ Enregistrer le bulletin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
