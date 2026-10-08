import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import { exportToCsv } from '../../utils/exportCsv';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  Trash2,
  Download,
  AlertCircle,
  X
} from 'lucide-react';

const PAGE_SIZE = 10;

export default function BulletinPage() {
  const { eleves, bulletins, addBulletin, deleteBulletin, CLASSES, MATIERES, ANNEES, TRIMESTRES } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [filterClasse, setFilterClasse] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ eleveId: '', annee: '2024-2025', trimestre: '1er Trimestre', notes: [] });

  const elevesDisponibles = eleves.filter(e => !filterClasse || e.classe === filterClasse);
  const filtered = bulletins.filter(b => {
    const eleve = eleves.find(e => e.id === b.eleveId);
    return (
      (!filterClasse || (eleve && eleve.classe === filterClasse) || b.eleveClasse === filterClasse) &&
      (!search || (b.eleveNom && b.eleveNom.toLowerCase().includes(search.toLowerCase())))
    );
  });

  const paginatedBulletins = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSelectEleve = (eleveId) => {
    setForm(prev => ({
      ...prev,
      eleveId,
      notes: MATIERES.map(m => ({ matiere: m, note: '', noteMax: 20, coeff: 1, appreciation: '' }))
    }));
  };

  const handleNoteChange = (index, field, val) => {
    if (field === 'note' && val !== '') {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0 || num > 20) {
        toast.warning('La note doit être comprise entre 0 et 20.');
        return;
      }
    }
    setForm(prev => {
      const notes = [...prev.notes];
      notes[index] = { ...notes[index], [field]: val };
      return { ...prev, notes };
    });
  };

  const moyenneGenerale = () => {
    const notes = form.notes.filter(n => n.note !== '' && !isNaN(parseFloat(n.note)));
    if (!notes.length) return null;
    const total = notes.reduce((s, n) => s + parseFloat(n.note) * parseFloat(n.coeff || 1), 0);
    const coeffTotal = notes.reduce((s, n) => s + parseFloat(n.coeff || 1), 0);
    return coeffTotal > 0 ? (total / coeffTotal).toFixed(2) : null;
  };

  const mention = (moy) => {
    const m = parseFloat(moy);
    if (m >= 16) return { label: 'Très Bien', cls: 'badge-success' };
    if (m >= 14) return { label: 'Bien', cls: 'badge-info' };
    if (m >= 12) return { label: 'Assez Bien', cls: 'badge-gold' };
    if (m >= 10) return { label: 'Passable', cls: 'badge-warning' };
    return { label: 'Insuffisant', cls: 'badge-danger' };
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      return toast.warning('Aucun bulletin à exporter.');
    }
    const filename = `gsek_bulletins_${new Date().toISOString().split('T')[0]}`;
    exportToCsv(filename, filtered, [
      { key: 'eleveNom', label: 'Élève' },
      { key: 'eleveClasse', label: 'Classe' },
      { key: 'annee', label: 'Année scolaire' },
      { key: 'trimestre', label: 'Période' },
      { key: 'moyenneGenerale', label: 'Moyenne / 20' },
      { key: 'mention', label: 'Mention' },
      { key: 'dateCreation', label: 'Date d\'édition' },
    ]);
    toast.success(`${filtered.length} bulletin(s) exporté(s) en CSV !`);
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

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteBulletin(deleteTarget.id);
      toast.info(`Le bulletin de ${deleteTarget.eleveNom} a été supprimé.`);
      setDeleteTarget(null);
      if (paginatedBulletins.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
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
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={handleExportCsv} title="Exporter les bulletins en CSV">
            <Download size={16} /> Exporter CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={17} /> Nouveau bulletin
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={17} color="#94a3b8" />
            <input
              placeholder="Rechercher par élève..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="#64748b" />
            <select
              style={{ width: 'auto', minWidth: 160 }}
              value={filterClasse}
              onChange={e => { setFilterClasse(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Toutes les classes</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
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
                <tr>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Année</th>
                  <th>Trimestre</th>
                  <th>Moyenne</th>
                  <th>Mention</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBulletins.map(b => {
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
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => navigate(`/bulletin/${b.id}`)} title="Imprimer le bulletin officiel">
                            <Printer size={14} /> Imprimer
                          </button>
                          <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setDeleteTarget(b)} title="Supprimer ce bulletin">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer un bulletin"
        message={deleteTarget ? `Confirmez-vous la suppression du bulletin de ${deleteTarget.eleveNom} pour le ${deleteTarget.trimestre} (${deleteTarget.annee}) ?` : ''}
        confirmText="Oui, supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 20 }}>Générer un bulletin de notes</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Élève *</label>
                  <select value={form.eleveId} onChange={e => handleSelectEleve(e.target.value)}>
                    <option value="">Sélectionner un élève...</option>
                    {elevesDisponibles.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom} — {e.classe}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Année scolaire</label>
                  <select value={form.annee} onChange={e => setForm({ ...form, annee: e.target.value })}>
                    {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Trimestre</label>
                  <select value={form.trimestre} onChange={e => setForm({ ...form, trimestre: e.target.value })}>
                    {TRIMESTRES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {form.eleveId && form.notes.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0 8px' }}>
                    <h3 style={{ fontSize: 16 }}>Saisie des notes par matière</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      <AlertCircle size={14} /> Notes sur 20 obligatoires
                    </div>
                  </div>
                  <div className="table-responsive" style={{ maxHeight: 320, overflowY: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Matière</th>
                          <th style={{ width: 100 }}>Note / 20</th>
                          <th style={{ width: 90 }}>Coeff</th>
                          <th>Appréciation de l'enseignant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.notes.map((n, idx) => (
                          <tr key={n.matiere}>
                            <td style={{ fontWeight: 600 }}>{n.matiere}</td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                placeholder="—"
                                style={{ width: '100%', padding: '6px 8px', textAlign: 'center' }}
                                value={n.note}
                                onChange={e => handleNoteChange(idx, 'note', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                style={{ width: '100%', padding: '6px 8px', textAlign: 'center' }}
                                value={n.coeff}
                                onChange={e => handleNoteChange(idx, 'coeff', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                placeholder="Très bon travail, poursuivre..."
                                style={{ width: '100%', padding: '6px 10px' }}
                                value={n.appreciation}
                                onChange={e => handleNoteChange(idx, 'appreciation', e.target.value)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {moyenneGenerale() && (
                    <div style={{ marginTop: 16, padding: '12px 18px', background: '#eef2f9', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>Moyenne générale calculée : </strong>
                        <span style={{ fontSize: 20, color: 'var(--primary)', fontWeight: 700 }}>{moyenneGenerale()} / 20</span>
                      </div>
                      <span className={`badge ${mention(moyenneGenerale()).cls}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                        {mention(moyenneGenerale()).label}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                <Plus size={16} /> Générer le bulletin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
