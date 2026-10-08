import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import { exportToCsv } from '../../utils/exportCsv';
import {
  GraduationCap,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Download,
  CreditCard,
  Save,
  X
} from 'lucide-react';

const PAGE_SIZE = 10;

const initialFormState = {
  nom: '',
  prenom: '',
  dateNaissance: '',
  sexe: 'M',
  classe: '6ème A',
  parentNom: '',
  parentTel: '',
  adresse: '',
  statut: 'actif'
};

export default function ElevesPage() {
  const { eleves, addEleve, updateEleve, deleteEleve, CLASSES } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingEleve, setEditingEleve] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(initialFormState);

  const filtered = eleves.filter(e =>
    (e.nom + ' ' + e.prenom + ' ' + (e.matricule || '')).toLowerCase().includes(search.toLowerCase()) &&
    (filterClasse ? e.classe === filterClasse : true)
  );

  const paginatedEleves = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCreateModal = () => {
    setEditingEleve(null);
    setForm(initialFormState);
    setShowModal(true);
  };

  const openEditModal = (eleve) => {
    setEditingEleve(eleve);
    setForm({
      nom: eleve.nom || '',
      prenom: eleve.prenom || '',
      dateNaissance: eleve.dateNaissance || '',
      sexe: eleve.sexe || 'M',
      classe: eleve.classe || CLASSES[0] || '6ème A',
      parentNom: eleve.parentNom || '',
      parentTel: eleve.parentTel || '',
      adresse: eleve.adresse || '',
      statut: eleve.statut || 'actif'
    });
    setShowModal(true);
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      return toast.warning('Aucun élève à exporter pour ces filtres.');
    }

    const filename = `gsek_eleves_${filterClasse ? filterClasse.replace(/\s+/g, '_') : 'tous'}_${new Date().toISOString().split('T')[0]}`;
    exportToCsv(filename, filtered, [
      { key: 'matricule', label: 'Matricule' },
      { key: 'nom', label: 'Nom' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'classe', label: 'Classe' },
      { key: 'sexe', label: 'Sexe', formatter: v => v === 'M' ? 'Garçon' : 'Fille' },
      { key: 'dateNaissance', label: 'Date de Naissance' },
      { key: 'parentNom', label: 'Parent / Tuteur' },
      { key: 'parentTel', label: 'Téléphone Parent' },
      { key: 'adresse', label: 'Adresse' },
      { key: 'statut', label: 'Statut' },
    ]);
    toast.success(`${filtered.length} élève(s) exporté(s) en CSV avec succès !`);
  };

  const handleSubmit = () => {
    if (!form.nom.trim() || !form.prenom.trim()) {
      return toast.error('Le nom et le prénom sont obligatoires.');
    }

    if (editingEleve) {
      updateEleve(editingEleve.id, form);
      toast.success(`Les informations de ${form.nom} ${form.prenom} ont été mises à jour !`);
    } else {
      const newEleve = addEleve(form);
      toast.success(`Élève ${newEleve.nom} ${newEleve.prenom} inscrit avec le matricule ${newEleve.matricule} !`);
    }

    setShowModal(false);
    setEditingEleve(null);
    setForm(initialFormState);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteEleve(deleteTarget.id);
      toast.info(`L'élève ${deleteTarget.nom} ${deleteTarget.prenom} a été supprimé.`);
      setDeleteTarget(null);
      if (paginatedEleves.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <GraduationCap size={28} /> Gestion des Élèves
          </h1>
          <p className="page-subtitle">{eleves.length} élève{eleves.length > 1 ? 's' : ''} enregistré{eleves.length > 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={handleExportCsv} title="Exporter la liste en fichier Excel / CSV">
            <Download size={16} /> Exporter CSV
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/badges')} title="Imprimer les cartes d'identité scolaires avec QR Code">
            <CreditCard size={16} /> Cartes & Badges
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <UserPlus size={17} /> Inscrire un élève
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={17} color="#94a3b8" />
            <input
              placeholder="Rechercher par nom, prénom ou matricule..."
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
            <div className="icon"><GraduationCap size={44} /></div>
            <h3>Aucun élève trouvé</h3>
            <p>Inscrivez un nouvel élève ou modifiez vos critères de recherche.</p>
          </div>
        ) : (
          <div className="table-responsive">
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
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEleves.map(e => (
                  <tr key={e.id}>
                    <td><span className="badge badge-info" style={{ fontFamily: 'monospace', fontSize: 12 }}>{e.matricule}</span></td>
                    <td style={{ fontWeight: 600 }}>{e.nom} {e.prenom}</td>
                    <td>{e.classe}</td>
                    <td>{e.sexe === 'M' ? 'Garçon' : 'Fille'}</td>
                    <td>{e.dateNaissance ? new Date(e.dateNaissance).toLocaleDateString('fr-SN') : '—'}</td>
                    <td style={{ fontSize: 13 }}>{e.parentNom}<br /><span style={{ color: 'var(--text-muted)' }}>{e.parentTel}</span></td>
                    <td>
                      <span className={`badge ${e.statut === 'actif' ? 'badge-success' : 'badge-warning'}`}>
                        {e.statut === 'actif' && <span className="status-dot active" />}
                        {e.statut}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => navigate(`/eleves/${e.id}`)} title="Voir la fiche">
                          <Eye size={14} /> Fiche
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => openEditModal(e)} title="Modifier les informations">
                          <Edit3 size={14} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setDeleteTarget(e)} title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
        title="Supprimer un élève"
        message={deleteTarget ? `Êtes-vous sûr de vouloir supprimer définitivement l'élève ${deleteTarget.nom} ${deleteTarget.prenom} (Matricule: ${deleteTarget.matricule}) ?` : ''}
        confirmText="Oui, supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 20 }}>
                {editingEleve ? `Modifier l'élève (${editingEleve.matricule})` : 'Inscrire un nouvel élève'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
                <X size={20} />
              </button>
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
              {!editingEleve && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-accent)', display: 'inline-block' }} />
                  Un matricule unique sera généré automatiquement
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingEleve ? (
                  <><Save size={16} /> Enregistrer les modifications</>
                ) : (
                  <><UserPlus size={16} /> Inscrire l'élève</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
