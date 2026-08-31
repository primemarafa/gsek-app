import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Users,
  UserCheck,
  GraduationCap,
  Coins,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  X
} from 'lucide-react';

const fmt = n => new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';

export default function PersonnelPage() {
  const { personnel, addPersonnel, updatePersonnel, deletePersonnel } = useApp();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ nom: '', prenom: '', role: 'Enseignant', matiere: '', salaire: '', dateEmbauche: '', tel: '', email: '', statut: 'actif', contrat: 'CDI' });

  const filtered = personnel.filter(p => (p.nom + ' ' + p.prenom + ' ' + p.role).toLowerCase().includes(search.toLowerCase()));
  const masseSalariale = personnel.filter(p => p.statut === 'actif').reduce((s, p) => s + (p.salaire || 0), 0);

  const openCreate = () => {
    setEditing(null);
    setForm({ nom: '', prenom: '', role: 'Enseignant', matiere: '', salaire: '', dateEmbauche: '', tel: '', email: '', statut: 'actif', contrat: 'CDI' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({ ...p });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.nom || !form.prenom) {
      return toast.error('Le nom et le prénom sont obligatoires.');
    }
    if (editing) {
      updatePersonnel(editing, { ...form, salaire: parseFloat(form.salaire) || 0 });
      toast.success(`Informations de ${form.nom} ${form.prenom} mises à jour.`);
    } else {
      const p = addPersonnel({ ...form, salaire: parseFloat(form.salaire) || 0 });
      toast.success(`Membre du personnel ${p.nom} ${p.prenom} (${p.matricule}) ajouté.`);
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deletePersonnel(deleteTarget.id);
      toast.info(`Membre ${deleteTarget.nom} ${deleteTarget.prenom} supprimé.`);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={28} /> Gestion du Personnel
          </h1>
          <p className="page-subtitle">{personnel.length} membre{personnel.length > 1 ? 's' : ''} · Masse salariale : {fmt(masseSalariale)}/mois</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <UserPlus size={17} /> Ajouter un membre
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon={<Users size={24} />} label="Total personnel" value={personnel.length} color="blue" />
        <StatCard icon={<UserCheck size={24} />} label="Actifs" value={personnel.filter(p => p.statut === 'actif').length} color="green" />
        <StatCard icon={<GraduationCap size={24} />} label="Enseignants" value={personnel.filter(p => p.role === 'Enseignant' || p.role === 'Enseignante').length} color="gold" />
        <StatCard icon={<Coins size={24} />} label="Masse salariale" value={fmt(masseSalariale)} color="red" small />
      </div>

      <div className="card">
        <div className="search-bar" style={{ marginBottom: 20 }}>
          <Search size={17} color="#94a3b8" />
          <input placeholder="Rechercher par nom, rôle..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><Users size={44} /></div>
            <h3>Aucun membre</h3>
            <p>Ajoutez un membre du personnel pour commencer.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr><th>Matricule</th><th>Nom & Prénom</th><th>Rôle</th><th>Matière</th><th>Salaire</th><th>Contrat</th><th>Statut</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#eef2f9', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>{p.matricule}</span></td>
                    <td><div style={{ fontWeight: 600 }}>{p.nom} {p.prenom}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.email}</div></td>
                    <td>{p.role}</td>
                    <td>{p.matiere || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{p.salaire ? fmt(p.salaire) : '—'}</td>
                    <td><span className="badge badge-info">{p.contrat}</span></td>
                    <td><span className={`badge ${p.statut === 'actif' ? 'badge-success' : 'badge-warning'}`}>{p.statut}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => openEdit(p)} title="Modifier">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setDeleteTarget(p)} title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer un membre"
        message={deleteTarget ? `Êtes-vous sûr de vouloir supprimer ${deleteTarget.nom} ${deleteTarget.prenom} (${deleteTarget.role}) ?` : ''}
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
              <h2 style={{ fontSize: 20 }}>{editing ? 'Modifier le membre' : 'Ajouter un membre du personnel'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20 }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Nom *</label><input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
                <div className="form-group"><label>Prénom *</label><input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Rôle</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {['Directeur', 'Directrice', 'Enseignant', 'Enseignante', 'Comptable', 'Secrétaire', 'Surveillant', 'Agent d\'entretien', 'Autre'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Matière (si enseignant)</label><input value={form.matiere} onChange={e => setForm({ ...form, matiere: e.target.value })} placeholder="Mathématiques..." /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Salaire mensuel (FCFA)</label><input type="number" value={form.salaire} onChange={e => setForm({ ...form, salaire: e.target.value })} /></div>
                <div className="form-group">
                  <label>Type de contrat</label>
                  <select value={form.contrat} onChange={e => setForm({ ...form, contrat: e.target.value })}>
                    <option>CDI</option><option>CDD</option><option>Vacataire</option><option>Bénévole</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Téléphone</label><input value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })} /></div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Date d'embauche</label><input type="date" value={form.dateEmbauche} onChange={e => setForm({ ...form, dateEmbauche: e.target.value })} /></div>
                <div className="form-group">
                  <label>Statut</label>
                  <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                    <option value="actif">Actif</option><option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit}>✅ {editing ? 'Modifier' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, small }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: small ? 16 : 26, fontWeight: 700, color: 'var(--primary)' }}>{value}</div>
      </div>
    </div>
  );
}
