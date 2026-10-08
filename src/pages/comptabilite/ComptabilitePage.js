import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import { exportToCsv } from '../../utils/exportCsv';
import { numberToWordsFR } from '../../utils/numberToWords';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  Plus,
  Filter,
  PieChart as PieIcon,
  Download,
  Trash2,
  Search,
  Printer,
  CheckCircle2,
  Coins,
  Smartphone,
  Receipt,
  Calendar,
  X
} from 'lucide-react';

const fmt = n => new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';
const PAGE_SIZE = 10;

const COLORS_REC = ['#1a3a6b', '#2451a3', '#4a74c9', '#7ea6e0'];
const COLORS_DEP = ['#c8960c', '#e8b020', '#d85a30', '#993c1d'];

export default function ComptabilitePage() {
  const { transactions, paiements, addTransaction, deleteTransaction, parametres, currentUser } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const printCaisseRef = useRef();
  const handlePrintCaisse = useReactToPrint({ content: () => printCaisseRef.current });

  const [activeTab, setActiveTab] = useState('journal'); // 'journal' | 'caisse'
  const [caisseDate, setCaisseDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'recette',
    categorie: 'Inscriptions',
    montant: '',
    description: ''
  });

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = sortedTransactions.filter(t =>
    (!filterType || t.type === filterType) &&
    (!search || (t.description + ' ' + t.ref + ' ' + t.categorie).toLowerCase().includes(search.toLowerCase()))
  );

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalRecettes = transactions.filter(t => t.type === 'recette').reduce((s, t) => s + t.montant, 0);
  const totalDepenses = transactions.filter(t => t.type === 'depense').reduce((s, t) => s + t.montant, 0);
  const solde = totalRecettes - totalDepenses;

  const recettesCats = {};
  const depensesCats = {};
  transactions.filter(t => t.type === 'recette').forEach(t => { recettesCats[t.categorie] = (recettesCats[t.categorie] || 0) + t.montant; });
  transactions.filter(t => t.type === 'depense').forEach(t => { depensesCats[t.categorie] = (depensesCats[t.categorie] || 0) + t.montant; });

  const pieRecettes = Object.entries(recettesCats).map(([name, value]) => ({ name, value }));
  const pieDepenses = Object.entries(depensesCats).map(([name, value]) => ({ name, value }));

  // Données de la Clôture Journalière de Caisse
  const paiementsCaisse = (paiements || []).filter(p => (p.date || p.datePaiement) === caisseDate);
  const totalCaisse = paiementsCaisse.reduce((s, p) => s + (p.montant || 0), 0);
  const especesCaisse = paiementsCaisse.filter(p => (p.modePaiement || '').toLowerCase().includes('espece')).reduce((s, p) => s + (p.montant || 0), 0);
  const waveCaisse = paiementsCaisse.filter(p => (p.modePaiement || '').toLowerCase().includes('wave')).reduce((s, p) => s + (p.montant || 0), 0);
  const omCaisse = paiementsCaisse.filter(p => (p.modePaiement || '').toLowerCase().includes('orange')).reduce((s, p) => s + (p.montant || 0), 0);
  const autresCaisse = totalCaisse - especesCaisse - waveCaisse - omCaisse;

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      return toast.warning('Aucune transaction à exporter.');
    }
    const filename = `gsek_comptabilite_${new Date().toISOString().split('T')[0]}`;
    exportToCsv(filename, filtered, [
      { key: 'ref', label: 'Référence' },
      { key: 'date', label: 'Date' },
      { key: 'type', label: 'Type' },
      { key: 'categorie', label: 'Catégorie' },
      { key: 'description', label: 'Description' },
      { key: 'montant', label: 'Montant (FCFA)' },
    ]);
    toast.success(`${filtered.length} transaction(s) exportée(s) en CSV !`);
  };

  const handleSubmit = () => {
    const montantNum = parseFloat(form.montant);
    if (isNaN(montantNum) || montantNum <= 0) {
      return toast.error('Veuillez indiquer un montant valide supérieur à 0.');
    }
    const t = addTransaction({ ...form, montant: montantNum });
    toast.success(`Transaction ${t.ref} (${form.type}) enregistrée avec succès !`);
    setShowModal(false);
    setForm({
      date: new Date().toISOString().split('T')[0],
      type: 'recette',
      categorie: 'Inscriptions',
      montant: '',
      description: ''
    });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteTransaction(deleteTarget.id);
      toast.info(`Transaction ${deleteTarget.ref} supprimée.`);
      setDeleteTarget(null);
      if (paginated.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const catOptions = form.type === 'recette'
    ? ['Inscriptions', 'Mensualités', 'Dons', 'Subventions', 'Autres recettes']
    : ['Salaires', 'Fournitures', 'Eau & Électricité', 'Entretien', 'Communication', 'Transport', 'Autres dépenses'];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wallet size={28} /> Comptabilité & Flux Financiers
          </h1>
          <p className="page-subtitle">{transactions.length} transactions enregistrées</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={handleExportCsv} title="Exporter le journal comptable en CSV">
            <Download size={16} /> Exporter CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={17} /> Nouvelle transaction
          </button>
        </div>
      </div>

      {/* Sélecteur d'onglets */}
      <div className="tabs-container no-print" style={{ marginBottom: 20 }}>
        <button
          className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveTab('journal')}
        >
          Journal des Flux & Budgets
        </button>
        <button
          className={`tab-btn ${activeTab === 'caisse' ? 'active' : ''}`}
          onClick={() => setActiveTab('caisse')}
        >
          Clôture Journalière de Caisse ({fmt(totalCaisse)})
        </button>
      </div>

      {activeTab === 'journal' ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp size={24} /></div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Total recettes</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>{fmt(totalRecettes)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><TrendingDown size={24} /></div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Total dépenses</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>{fmt(totalDepenses)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Scale size={24} /></div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Solde net</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: solde >= 0 ? 'var(--success)' : 'var(--danger)' }}>{fmt(solde)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieIcon size={18} /> Recettes par catégorie
          </h3>
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
          <h3 style={{ marginBottom: 16, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieIcon size={18} /> Dépenses par catégorie
          </h3>
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
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={17} color="#94a3b8" />
            <input
              placeholder="Rechercher par référence, description ou catégorie..."
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
              <option value="">Toutes les transactions</option>
              <option value="recette">Recettes uniquement</option>
              <option value="depense">Dépenses uniquement</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><Wallet size={44} /></div>
            <h3>Aucune transaction trouvée</h3>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Catégorie</th>
                  <th>Description</th>
                  <th>Montant</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{t.ref}</td>
                    <td>{t.date}</td>
                    <td><span className={`badge ${t.type === 'recette' ? 'badge-success' : 'badge-danger'}`}>{t.type === 'recette' ? 'Recette' : 'Dépense'}</span></td>
                    <td>{t.categorie}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.description}</td>
                    <td style={{ fontWeight: 700, color: t.type === 'recette' ? 'var(--success)' : 'var(--danger)' }}>
                      {t.type === 'depense' ? '–' : '+'}{fmt(t.montant)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          onClick={() => setDeleteTarget(t)}
                          title="Supprimer la transaction"
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
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  ) : (
    /* ======================================================== */
    /* ONGLET : CLÔTURE JOURNALIÈRE DE CAISSE                   */
    /* ======================================================== */
    <div>
      <div className="card no-print" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={18} color="var(--primary)" />
            <label style={{ fontWeight: 700, fontSize: 14 }}>Date de la session de caisse :</label>
            <input
              type="date"
              value={caisseDate}
              onChange={e => setCaisseDate(e.target.value)}
              style={{ width: 'auto', fontWeight: 600 }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handlePrintCaisse}
            disabled={paiementsCaisse.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Printer size={16} /> Imprimer l'arrêté de caisse ({paiementsCaisse.length})
          </button>
        </div>
      </div>

      {/* Cartes récapitulatives par mode d'encaissement */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon green"><Receipt size={24} /></div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>TOTAL ENCAISSÉ</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{fmt(totalCaisse)}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{paiementsCaisse.length} opération(s)</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon gold"><Coins size={24} /></div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ESPÈCES EN CAISSE</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#b45309' }}>{fmt(especesCaisse)}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Billets & pièces physiques</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="stat-icon blue"><Smartphone size={24} /></div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>WAVE & ORANGE MONEY</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0369a1' }}>{fmt(waveCaisse + omCaisse)}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Wave: {fmt(waveCaisse)} · OM: {fmt(omCaisse)}</div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><CheckCircle2 size={24} /></div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>CHÈQUES & VIREMENTS</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#6d28d9' }}>{fmt(autresCaisse)}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Virements & traites bancaires</div>
          </div>
        </div>
      </div>

      {/* Bordereau imprimable de clôture de caisse */}
      <div ref={printCaisseRef} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 18, margin: '0 0 4px 0' }}>Bordereau Officiel de Clôture de Caisse</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Date d'arrêté : <strong>{caisseDate}</strong> · Établissement : {parametres?.nom || "GSEK Sidy Konaté"}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-success" style={{ fontSize: 13, padding: '6px 12px' }}>
              Total Arrêté : {fmt(totalCaisse)}
            </span>
          </div>
        </div>

        {paiementsCaisse.length === 0 ? (
          <div className="empty-state">
            <p>Aucun encaissement enregistré pour la date du {caisseDate}.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Réf. Reçu</th>
                  <th>Élève & Matricule</th>
                  <th>Classe</th>
                  <th>Motif</th>
                  <th>Mode</th>
                  <th style={{ textAlign: 'right' }}>Montant</th>
                  <th className="no-print" style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paiementsCaisse.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                        {p.ref}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.eleveNom}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{p.eleveMatricule}</div>
                    </td>
                    <td>{p.classe || p.eleveClasse}</td>
                    <td>{p.type === 'inscription' ? "Inscription" : `Mensualité (${p.mois || '—'})`}</td>
                    <td>
                      <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                        {p.modePaiement}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      {fmt(p.montant)}
                    </td>
                    <td className="no-print" style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => navigate(`/paiement/${p.id}`)}
                      >
                        Reçu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                  <td colSpan={5}>TOTAL GÉNÉRAL ENCAISSÉ :</td>
                  <td style={{ textAlign: 'right', fontSize: 16, color: '#10b981' }}>{fmt(totalCaisse)}</td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>

            {/* Arrêté en toutes lettres et visas */}
            <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, color: '#334155', marginBottom: 14 }}>
                Arrêté la présente caisse journalière à la somme totale de :{' '}
                <strong>« {numberToWordsFR(totalCaisse)} »</strong>, certifié exact et conforme aux écritures.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 24, paddingTop: 10, borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>L'Agent Caissier / Comptable</div>
                  <div style={{ height: 60 }}></div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Nom & Signature'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Le Directeur Général (Visa)</div>
                  <div style={{ height: 60 }}></div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Signature & Cachet Officiel</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer la transaction"
        message={deleteTarget ? `Confirmez-vous la suppression de la transaction ${deleteTarget.ref} (${deleteTarget.description || deleteTarget.categorie}) d'un montant de ${fmt(deleteTarget.montant)} ?` : ''}
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
              <h2 style={{ fontSize: 20 }}>Nouvelle transaction</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, categorie: e.target.value === 'recette' ? 'Inscriptions' : 'Salaires' })}>
                    <option value="recette">Recette</option>
                    <option value="depense">Dépense</option>
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
                  <input type="number" min="0" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} placeholder="150000" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Description de la transaction..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                <Plus size={16} /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
