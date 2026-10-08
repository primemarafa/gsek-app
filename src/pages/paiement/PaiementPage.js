import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import { exportToCsv } from '../../utils/exportCsv';
import {
  Receipt,
  Plus,
  Search,
  Printer,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Filter,
  CreditCard,
  Calendar,
  X
} from 'lucide-react';

const fmt = n => new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';
const PAGE_SIZE = 10;
const MOIS_LIST = ['Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'];

export default function PaiementPage() {
  const { paiements, eleves, addPaiement, deletePaiement, parametres, CLASSES } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('reçus'); // 'reçus' | 'impayes'
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filtres pour le suivi des impayés
  const [classeSuivi, setClasseSuivi] = useState(CLASSES[0] || '6ème A');
  const [moisSuivi, setMoisSuivi] = useState('Octobre');

  const [form, setForm] = useState({
    eleveId: '',
    type: 'mensualite',
    montant: '',
    mois: '',
    modePaiement: 'especes',
    remarques: ''
  });

  const filteredPaiements = paiements.filter(p =>
    ((p.eleveNom || '') + ' ' + (p.ref || '') + ' ' + (p.eleveClasse || '')).toLowerCase().includes(search.toLowerCase())
  );

  const paginatedPaiements = filteredPaiements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalRecettes = paiements.reduce((s, p) => s + (p.montant || 0), 0);

  // Logique du suivi des impayés pour la classe et le mois sélectionnés
  const elevesClasse = eleves.filter(e => e.classe === classeSuivi && e.statut === 'actif');
  const suiviParEleve = elevesClasse.map(eleve => {
    // Vérifier si un paiement de type mensualité existe pour cet élève et ce mois
    const paiementTrouve = paiements.find(p =>
      p.eleveId === eleve.id &&
      p.type === 'mensualite' &&
      p.mois === moisSuivi
    );
    return {
      eleve,
      estPaye: !!paiementTrouve,
      paiement: paiementTrouve
    };
  });

  const nbPayes = suiviParEleve.filter(s => s.estPaye).length;
  const nbImpayes = suiviParEleve.filter(s => !s.estPaye).length;
  const fraisMensuel = parametres?.fraisMensualite || 35000;
  const montantDu = nbImpayes * fraisMensuel;

  const openNewPayment = (defaultEleveId = '', defaultMois = '') => {
    setForm({
      eleveId: defaultEleveId,
      type: defaultMois ? 'mensualite' : 'mensualite',
      montant: parametres?.fraisMensualite || '',
      mois: defaultMois || '',
      modePaiement: 'especes',
      remarques: ''
    });
    setShowModal(true);
  };

  const handleTypeChange = (type) => {
    const defaultMontant = type === 'inscription'
      ? (parametres?.fraisInscription || '')
      : (parametres?.fraisMensualite || '');
    setForm(prev => ({ ...prev, type, montant: defaultMontant, mois: type === 'inscription' ? '' : prev.mois }));
  };

  const handleExportCsv = () => {
    if (activeTab === 'reçus') {
      if (filteredPaiements.length === 0) {
        return toast.warning('Aucun reçu à exporter.');
      }
      exportToCsv(`gsek_recus_${new Date().toISOString().split('T')[0]}`, filteredPaiements, [
        { key: 'ref', label: 'Référence' },
        { key: 'eleveNom', label: 'Élève' },
        { key: 'eleveClasse', label: 'Classe' },
        { key: 'eleveMatricule', label: 'Matricule' },
        { key: 'type', label: 'Type' },
        { key: 'mois', label: 'Mois' },
        { key: 'montant', label: 'Montant (FCFA)' },
        { key: 'modePaiement', label: 'Mode' },
        { key: 'datePaiement', label: 'Date' },
      ]);
      toast.success(`${filteredPaiements.length} reçu(s) exporté(s) en CSV !`);
    } else {
      if (suiviParEleve.length === 0) {
        return toast.warning('Aucun élève dans cette classe.');
      }
      const dataToExport = suiviParEleve.map(s => ({
        matricule: s.eleve.matricule,
        nom: `${s.eleve.nom} ${s.eleve.prenom}`,
        classe: classeSuivi,
        mois: moisSuivi,
        statutPaiement: s.estPaye ? 'Réglé' : 'Impayé',
        reference: s.paiement ? s.paiement.ref : '—',
        parentTel: s.eleve.parentTel || '—'
      }));
      exportToCsv(`gsek_suivi_impayes_${classeSuivi.replace(/\s+/g, '_')}_${moisSuivi}`, dataToExport, [
        { key: 'matricule', label: 'Matricule' },
        { key: 'nom', label: 'Nom & Prénom' },
        { key: 'classe', label: 'Classe' },
        { key: 'mois', label: 'Mois' },
        { key: 'statutPaiement', label: 'Statut' },
        { key: 'reference', label: 'Référence reçu' },
        { key: 'parentTel', label: 'Contact Parent' }
      ]);
      toast.success('État des mensualités de la classe exporté en CSV !');
    }
  };

  const handleSubmit = () => {
    if (!form.eleveId) {
      return toast.error('Veuillez sélectionner un élève.');
    }
    const montantNum = parseFloat(form.montant);
    if (isNaN(montantNum) || montantNum <= 0) {
      return toast.error('Veuillez indiquer un montant valide supérieur à 0.');
    }
    if (form.type === 'mensualite' && !form.mois) {
      return toast.error('Veuillez sélectionner le mois concerné par la mensualité.');
    }

    const eleve = eleves.find(e => e.id === form.eleveId);
    const newP = addPaiement({
      ...form,
      montant: montantNum,
      eleveId: eleve.id,
      eleveNom: `${eleve.nom} ${eleve.prenom}`,
      eleveClasse: eleve.classe,
      eleveMatricule: eleve.matricule,
    });
    toast.success(`Paiement enregistré ! Reçu N° ${newP.ref} généré.`);
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deletePaiement(deleteTarget.id);
      toast.info(`Le reçu N° ${deleteTarget.ref} a été annulé et supprimé.`);
      setDeleteTarget(null);
      if (paginatedPaiements.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Receipt size={28} /> Reçus & Gestion des Paiements
          </h1>
          <p className="page-subtitle">Total encaissé : <strong>{fmt(totalRecettes)}</strong> · {paiements.length} paiements enregistrés</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={handleExportCsv} title="Exporter les données en CSV">
            <Download size={16} /> Exporter CSV
          </button>
          <button className="btn btn-primary" onClick={() => openNewPayment()}>
            <Plus size={17} /> Nouveau reçu
          </button>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <button
          className={`btn ${activeTab === 'reçus' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('reçus')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Receipt size={16} /> Journal des reçus ({paiements.length})
        </button>
        <button
          className={`btn ${activeTab === 'impayes' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('impayes')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <AlertTriangle size={16} /> Suivi des mensualités & Impayés
        </button>
      </div>

      {activeTab === 'reçus' ? (
        <div className="card">
          <div className="search-bar" style={{ marginBottom: 20 }}>
            <Search size={17} color="#94a3b8" />
            <input
              placeholder="Rechercher par élève, classe ou référence..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {filteredPaiements.length === 0 ? (
            <div className="empty-state">
              <div className="icon"><Receipt size={44} /></div>
              <h3>Aucun reçu enregistré</h3>
              <p>Créez le premier reçu de paiement.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Élève</th>
                    <th>Classe</th>
                    <th>Type</th>
                    <th>Mois</th>
                    <th>Montant</th>
                    <th>Mode</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPaiements.map(p => (
                    <tr key={p.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#eef2f9', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                          {p.ref}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.eleveNom}</td>
                      <td>{p.eleveClasse}</td>
                      <td>
                        <span className={`badge ${p.type === 'inscription' ? 'badge-info' : 'badge-gold'}`}>
                          {p.type === 'inscription' ? 'Inscription' : 'Mensualité'}
                        </span>
                      </td>
                      <td>{p.mois || '—'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>{fmt(p.montant)}</td>
                      <td>{p.modePaiement}</td>
                      <td>{p.datePaiement}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => navigate(`/paiement/${p.id}`)} title="Imprimer le reçu">
                            <Printer size={14} /> Reçu
                          </button>
                          <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setDeleteTarget(p)} title="Annuler le reçu">
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
                totalItems={filteredPaiements.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Suivi des mensualités et impayés */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Filter size={16} color="#64748b" />
                <label style={{ fontWeight: 600, fontSize: 14 }}>Classe :</label>
                <select value={classeSuivi} onChange={e => setClasseSuivi(e.target.value)} style={{ width: 'auto', minWidth: 150 }}>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} color="#64748b" />
                <label style={{ fontWeight: 600, fontSize: 14 }}>Mois scolaire :</label>
                <select value={moisSuivi} onChange={e => setMoisSuivi(e.target.value)} style={{ width: 'auto', minWidth: 150 }}>
                  {MOIS_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Statistiques d'impayés de la classe */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div className="stat-card">
              <div className="stat-icon blue"><CreditCard size={24} /></div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Effectif classe</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{elevesClasse.length}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><CheckCircle2 size={24} /></div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>À jour ({moisSuivi})</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{nbPayes}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red"><AlertTriangle size={24} /></div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Impayés ({moisSuivi})</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--danger)' }}>{nbImpayes}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon gold"><Receipt size={24} /></div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Reste à recouvrer</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{fmt(montantDu)}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>État des paiements pour {classeSuivi} — {moisSuivi}</h3>
            {suiviParEleve.length === 0 ? (
              <div className="empty-state">
                <h3>Aucun élève actif dans la classe {classeSuivi}</h3>
              </div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Matricule</th>
                      <th>Élève</th>
                      <th>Contact Parent</th>
                      <th>Statut du mois</th>
                      <th>Référence reçu</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suiviParEleve.map(({ eleve, estPaye, paiement }) => (
                      <tr key={eleve.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#eef2f9', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                            {eleve.matricule}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{eleve.nom} {eleve.prenom}</td>
                        <td>
                          <div>{eleve.parentNom || '—'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{eleve.parentTel || '—'}</div>
                        </td>
                        <td>
                          {estPaye ? (
                            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={12} /> Réglé
                            </span>
                          ) : (
                            <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <AlertTriangle size={12} /> Impayé
                            </span>
                          )}
                        </td>
                        <td>
                          {paiement ? (
                            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{paiement.ref} ({paiement.datePaiement})</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {estPaye ? (
                              <button
                                className="btn btn-outline"
                                style={{ padding: '5px 12px', fontSize: 12 }}
                                onClick={() => navigate(`/paiement/${paiement.id}`)}
                              >
                                <Printer size={13} /> Reçu
                              </button>
                            ) : (
                              <button
                                className="btn btn-primary"
                                style={{ padding: '5px 12px', fontSize: 12 }}
                                onClick={() => openNewPayment(eleve.id, moisSuivi)}
                              >
                                <CreditCard size={13} /> Encaisser
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Annuler le reçu"
        message={deleteTarget ? `Confirmez-vous l'annulation et la suppression définitive du reçu ${deleteTarget.ref} (${deleteTarget.eleveNom} - ${fmt(deleteTarget.montant)}) ?` : ''}
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
              <h2 style={{ fontSize: 20 }}>Enregistrer un paiement</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
                <X size={20} />
              </button>
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
                  <select value={form.type} onChange={e => handleTypeChange(e.target.value)}>
                    <option value="mensualite">Mensualité</option>
                    <option value="inscription">Frais d'inscription</option>
                  </select>
                </div>
                {form.type === 'mensualite' && (
                  <div className="form-group">
                    <label>Mois concerné *</label>
                    <select value={form.mois} onChange={e => setForm({ ...form, mois: e.target.value })}>
                      <option value="">Sélectionner le mois</option>
                      {MOIS_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Montant (FCFA) *</label>
                  <input type="number" min="0" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} placeholder="35000" />
                </div>
                <div className="form-group">
                  <label>Mode de paiement</label>
                  <select value={form.modePaiement} onChange={e => setForm({ ...form, modePaiement: e.target.value })}>
                    <option value="especes">Espèces</option>
                    <option value="wave">Wave</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="cheque">Chèque</option>
                    <option value="virement">Virement bancaire</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Remarques</label>
                <textarea value={form.remarques} onChange={e => setForm({ ...form, remarques: e.target.value })} rows={2} placeholder="Ex: Paiement partiel, mention tuteur..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                <Receipt size={16} /> Enregistrer et générer le reçu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
