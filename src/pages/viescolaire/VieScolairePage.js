import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import { exportToCsv } from '../../utils/exportCsv';
import {
  CalendarCheck,
  Clock,
  UserX,
  AlertCircle,
  CheckCircle2,
  Filter,
  Plus,
  Trash2,
  Download,
  Calendar,
  Search,
  X
} from 'lucide-react';

const PAGE_SIZE = 10;

export default function VieScolairePage() {
  const { eleves, absences, addAbsence, deleteAbsence, CLASSES } = useApp();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('pointage'); // 'pointage' | 'registre'
  const [datePointage, setDatePointage] = useState(new Date().toISOString().split('T')[0]);
  const [classePointage, setClassePointage] = useState(CLASSES[0] || '6ème A');

  // Filtres du registre
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Modale de saisie d'absence manuelle
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    eleveId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'injustifiee',
    dureeHeures: 2,
    motif: ''
  });

  // Élèves pour la feuille d'appel
  const elevesClasse = eleves.filter(e => e.classe === classePointage && e.statut === 'actif');

  // Absences enregistrées pour la classe et la date sélectionnée
  const absencesDuJour = absences.filter(a => a.date === datePointage && a.classe === classePointage);

  // Filtrage du registre complet
  const filteredRegistre = absences.filter(a => {
    const matchSearch = (a.eleveNom + ' ' + (a.eleveMatricule || '') + ' ' + (a.motif || '')).toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || a.type === filterType;
    return matchSearch && matchType;
  });

  const paginatedRegistre = filteredRegistre.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Statistiques globales
  const totalInjustifiees = absences.filter(a => a.type === 'injustifiee').reduce((s, a) => s + (Number(a.dureeHeures) || 0), 0);
  const totalJustifiees = absences.filter(a => a.type === 'justifiee').reduce((s, a) => s + (Number(a.dureeHeures) || 0), 0);
  const totalRetards = absences.filter(a => a.type === 'retard').length;

  const handleQuickMark = (eleve, type) => {
    // Vérifier si déjà marqué ce jour
    const existant = absences.find(a => a.eleveId === eleve.id && a.date === datePointage && a.type === type);
    if (existant) {
      return toast.info(`${eleve.nom} ${eleve.prenom} a déjà un enregistrement pour ce motif.`);
    }

    const defaultDuree = type === 'retard' ? 0.25 : 4;
    const defaultMotif = type === 'justifiee' ? 'Certificat médical / Motif familial' : type === 'retard' ? 'Retard en début de cours' : 'Non justifiée';

    addAbsence({
      eleveId: eleve.id,
      eleveMatricule: eleve.matricule,
      eleveNom: `${eleve.nom} ${eleve.prenom}`,
      classe: eleve.classe,
      date: datePointage,
      type,
      dureeHeures: defaultDuree,
      motif: defaultMotif
    });

    toast.success(`Enregistré : ${eleve.nom} ${eleve.prenom} (${type === 'retard' ? 'Retard' : 'Absent'})`);
  };

  const handleExportCsv = () => {
    if (filteredRegistre.length === 0) {
      return toast.warning('Aucune absence à exporter.');
    }
    exportToCsv(`gsek_absences_${new Date().toISOString().split('T')[0]}`, filteredRegistre, [
      { key: 'date', label: 'Date' },
      { key: 'eleveNom', label: 'Élève' },
      { key: 'classe', label: 'Classe' },
      { key: 'eleveMatricule', label: 'Matricule' },
      { key: 'type', label: 'Type', formatter: v => v === 'justifiee' ? 'Absent Justifié' : v === 'injustifiee' ? 'Absent Injustifié' : 'Retard' },
      { key: 'dureeHeures', label: 'Durée (heures)' },
      { key: 'motif', label: 'Motif' },
    ]);
    toast.success(`${filteredRegistre.length} absence(s) exportée(s) en CSV !`);
  };

  const handleSubmitModal = () => {
    if (!form.eleveId) {
      return toast.error('Veuillez sélectionner un élève.');
    }
    const eleve = eleves.find(e => e.id === form.eleveId);
    addAbsence({
      ...form,
      eleveMatricule: eleve.matricule,
      eleveNom: `${eleve.nom} ${eleve.prenom}`,
      classe: eleve.classe,
      dureeHeures: parseFloat(form.dureeHeures) || 1
    });
    toast.success(`Absence enregistrée pour ${eleve.nom} ${eleve.prenom} !`);
    setShowModal(false);
    setForm({
      eleveId: '',
      date: new Date().toISOString().split('T')[0],
      type: 'injustifiee',
      dureeHeures: 2,
      motif: ''
    });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteAbsence(deleteTarget.id);
      toast.info(`L'enregistrement d'absence pour ${deleteTarget.eleveNom} a été supprimé.`);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarCheck size={28} /> Vie Scolaire & Assiduité
          </h1>
          <p className="page-subtitle">Gestion des appels quotidiens, absences et retards</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={handleExportCsv} title="Exporter le registre des absences">
            <Download size={16} /> Exporter CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={17} /> Saisir absence
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon red"><UserX size={24} /></div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Absences Injustifiées</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--danger)' }}>{totalInjustifiees} h</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><CalendarCheck size={24} /></div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Absences Justifiées</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{totalJustifiees} h</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><Clock size={24} /></div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Total Retards</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#c8960c' }}>{totalRetards}</div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <button
          className={`btn ${activeTab === 'pointage' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pointage')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <CalendarCheck size={16} /> Feuille d'appel & Pointage du jour
        </button>
        <button
          className={`btn ${activeTab === 'registre' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('registre')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Clock size={16} /> Registre & Historique ({absences.length})
        </button>
      </div>

      {activeTab === 'pointage' ? (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} color="#64748b" />
                <label style={{ fontWeight: 600, fontSize: 14 }}>Date d'appel :</label>
                <input
                  type="date"
                  value={datePointage}
                  onChange={e => setDatePointage(e.target.value)}
                  style={{ width: 'auto' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Filter size={16} color="#64748b" />
                <label style={{ fontWeight: 600, fontSize: 14 }}>Classe :</label>
                <select
                  value={classePointage}
                  onChange={e => setClassePointage(e.target.value)}
                  style={{ width: 'auto', minWidth: 150 }}
                >
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
                {absencesDuJour.length} signalement(s) pour cette journée
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Appel des élèves — {classePointage}</h3>
            {elevesClasse.length === 0 ? (
              <div className="empty-state">
                <p>Aucun élève actif dans la classe {classePointage}.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Matricule</th>
                      <th>Élève</th>
                      <th>Statut aujourd'hui</th>
                      <th style={{ textAlign: 'right' }}>Actions d'appel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elevesClasse.map(eleve => {
                      const incident = absencesDuJour.find(a => a.eleveId === eleve.id);

                      return (
                        <tr key={eleve.id}>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#eef2f9', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                              {eleve.matricule}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{eleve.nom} {eleve.prenom}</td>
                          <td>
                            {!incident ? (
                              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={13} /> Présent(e)
                              </span>
                            ) : incident.type === 'justifiee' ? (
                              <span className="badge badge-info">Absent Justifié ({incident.dureeHeures}h)</span>
                            ) : incident.type === 'retard' ? (
                              <span className="badge badge-gold">Retard ({incident.dureeHeures}h)</span>
                            ) : (
                              <span className="badge badge-danger">Absent Injustifié ({incident.dureeHeures}h)</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-outline"
                                style={{ padding: '5px 10px', fontSize: 12 }}
                                onClick={() => handleQuickMark(eleve, 'justifiee')}
                                title="Marquer absent avec motif justifié"
                              >
                                Justifié
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ padding: '5px 10px', fontSize: 12 }}
                                onClick={() => handleQuickMark(eleve, 'injustifiee')}
                                title="Marquer absent non justifié"
                              >
                                Injustifié
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '5px 10px', fontSize: 12 }}
                                onClick={() => handleQuickMark(eleve, 'retard')}
                                title="Marquer en retard"
                              >
                                Retard
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ flex: 1 }}>
              <Search size={17} color="#94a3b8" />
              <input
                placeholder="Rechercher un élève, matricule ou motif..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={16} color="#64748b" />
              <select
                style={{ width: 'auto', minWidth: 180 }}
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Tous les types</option>
                <option value="injustifiee">Absences injustifiées</option>
                <option value="justifiee">Absences justifiées</option>
                <option value="retard">Retards</option>
              </select>
            </div>
          </div>

          {filteredRegistre.length === 0 ? (
            <div className="empty-state">
              <div className="icon"><CalendarCheck size={44} /></div>
              <h3>Aucune absence enregistrée</h3>
              <p>Le registre est propre pour ces critères.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Élève</th>
                    <th>Classe</th>
                    <th>Type</th>
                    <th>Durée</th>
                    <th>Motif</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRegistre.map(a => (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td style={{ fontWeight: 600 }}>{a.eleveNom}</td>
                      <td>{a.classe}</td>
                      <td>
                        <span className={`badge ${a.type === 'justifiee' ? 'badge-info' : a.type === 'retard' ? 'badge-gold' : 'badge-danger'}`}>
                          {a.type === 'justifiee' ? 'Justifiée' : a.type === 'retard' ? 'Retard' : 'Injustifiée'}
                        </span>
                      </td>
                      <td>{a.dureeHeures} h</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{a.motif || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '6px 10px', fontSize: 12 }}
                            onClick={() => setDeleteTarget(a)}
                            title="Supprimer cet enregistrement"
                          >
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
                totalItems={filteredRegistre.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer l'absence"
        message={deleteTarget ? `Confirmez-vous la suppression de l'absence pour ${deleteTarget.eleveNom} du ${deleteTarget.date} ?` : ''}
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
              <h2 style={{ fontSize: 20 }}>Enregistrer une absence / retard</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Élève *</label>
                <select value={form.eleveId} onChange={e => setForm({ ...form, eleveId: e.target.value })}>
                  <option value="">Sélectionner un élève...</option>
                  {eleves.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom} — {e.classe}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Type d'incident</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="injustifiee">Absence Injustifiée</option>
                    <option value="justifiee">Absence Justifiée</option>
                    <option value="retard">Retard</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Durée (heures)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={form.dureeHeures}
                  onChange={e => setForm({ ...form, dureeHeures: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Motif / Justificatif</label>
                <textarea
                  rows={2}
                  value={form.motif}
                  onChange={e => setForm({ ...form, motif: e.target.value })}
                  placeholder="Ex: Certificat médical, absence de transport..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmitModal}>
                <Plus size={16} /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
