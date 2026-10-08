import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Settings,
  Save,
  School,
  Calendar,
  Coins,
  Database,
  Download,
  Upload,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export default function ParametresPage() {
  const {
    parametres,
    updateParametres,
    exportData,
    importData,
    eleves,
    personnel,
    paiements,
    bulletins,
    transactions,
    absences,
    clotureEtPassageClasse,
    CLASSES,
    ANNEES
  } = useApp();

  const toast = useToast();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'cloture'
  const [ecole, setEcole] = useState(parametres);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState(null);
  const fileInputRef = useRef(null);

  // États pour la clôture et passage de classe
  const [classeSource, setClasseSource] = useState(CLASSES[5] || '6ème A');
  const [classeCible, setClasseCible] = useState(CLASSES[7] || '5ème A');
  const [nouvelleAnnee, setNouvelleAnnee] = useState('2025-2026');
  const [updateAnneeGlobal, setUpdateAnneeGlobal] = useState(false);
  const [decisions, setDecisions] = useState({});
  const [confirmPromotionOpen, setConfirmPromotionOpen] = useState(false);

  useEffect(() => {
    if (parametres) {
      setEcole(parametres);
    }
  }, [parametres]);

  const elevesSource = eleves.filter(e => e.classe === classeSource && e.statut === 'actif');

  // Initialisation des décisions automatiques quand on change de classe source
  useEffect(() => {
    const initDec = {};
    elevesSource.forEach(e => {
      // Calculer la moyenne du dernier bulletin si dispo
      const bList = bulletins.filter(b => b.eleveId === e.id);
      const lastB = bList[bList.length - 1];
      const moy = lastB ? parseFloat(lastB.moyenneGenerale) : null;
      // Proposer passage si moyenne >= 10, sinon redoublement
      initDec[e.id] = (moy !== null && moy < 10) ? 'redoublement' : 'passage';
    });
    setDecisions(initDec);
  }, [classeSource, eleves]);

  const handleSave = () => {
    updateParametres(ecole);
    toast.success('Paramètres enregistrés avec succès !');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setPendingImportData(json);
      } catch (err) {
        toast.error('Le fichier sélectionné est corrompu ou au mauvais format JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    if (pendingImportData) {
      const res = importData(pendingImportData);
      if (res.success) {
        toast.success('Données scolaires restaurées avec succès !');
      } else {
        toast.error(`Erreur de restauration : ${res.error}`);
      }
      setPendingImportData(null);
    }
  };

  const handleResetAll = () => {
    localStorage.clear();
    toast.info('Toutes les données ont été réinitialisées.');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleApplyPromotion = () => {
    const promotions = elevesSource.map(e => ({
      eleveId: e.id,
      action: decisions[e.id] || 'passage',
      targetClasse: decisions[e.id] === 'passage' ? classeCible : e.classe
    }));

    const res = clotureEtPassageClasse({
      promotions,
      nouvelleAnneeScolaire: updateAnneeGlobal ? nouvelleAnnee : null
    });

    if (res.success) {
      toast.success(`Promotion appliquée avec succès pour ${res.count} élève(s) de ${classeSource} !`);
      setConfirmPromotionOpen(false);
    } else {
      toast.error('Une erreur est survenue lors du passage de classe.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={28} /> Paramètres de l'Établissement
          </h1>
          <p className="page-subtitle">Configuration générale, sauvegarde et transition annuelle</p>
        </div>
        {activeTab === 'general' && (
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={16} /> Sauvegarder
          </button>
        )}
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <button
          className={`btn ${activeTab === 'general' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('general')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <School size={16} /> Configuration & Sauvegarde
        </button>
        <button
          className={`btn ${activeTab === 'cloture' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('cloture')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <GraduationCap size={16} /> Clôture & Passage de Classe (Promotion)
        </button>
      </div>

      {activeTab === 'general' ? (
        <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          <div className="card">
            <h3 style={{ marginBottom: 20, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
              <School size={19} color="var(--primary)" /> Informations de l'école
            </h3>
            <div className="form-group">
              <label>Nom de l'établissement</label>
              <input value={ecole.nom || ''} onChange={e => setEcole({ ...ecole, nom: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Devise / Slogan</label>
              <input value={ecole.devise || ''} onChange={e => setEcole({ ...ecole, devise: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Adresse</label>
              <input value={ecole.adresse || ''} onChange={e => setEcole({ ...ecole, adresse: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input value={ecole.telephone || ''} onChange={e => setEcole({ ...ecole, telephone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={ecole.email || ''} onChange={e => setEcole({ ...ecole, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Site web</label>
              <input value={ecole.siteWeb || ''} onChange={e => setEcole({ ...ecole, siteWeb: e.target.value })} />
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 20, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={19} color="var(--primary)" /> Année scolaire & Tarification
              </h3>
              <div className="form-group">
                <label>Année scolaire en cours</label>
                <select value={ecole.anneeScolaire || '2024-2025'} onChange={e => setEcole({ ...ecole, anneeScolaire: e.target.value })}>
                  {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Frais d'inscription par défaut (FCFA)</label>
                <input
                  type="number"
                  value={ecole.fraisInscription || ''}
                  onChange={e => setEcole({ ...ecole, fraisInscription: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Mensualité par défaut (FCFA)</label>
                <input
                  type="number"
                  value={ecole.fraisMensualite || ''}
                  onChange={e => setEcole({ ...ecole, fraisMensualite: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Database size={19} color="var(--primary)" /> Sauvegarde & Restauration
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                Téléchargez une copie complète des données (élèves, bulletins, transactions, présences) au format JSON sécurisé.
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <button className="btn btn-secondary" onClick={exportData} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Download size={16} /> Exporter sauvegarde JSON
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Upload size={16} /> Restaurer un fichier
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".json"
                  onChange={handleFileChange}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 10 }}>
                <h4 style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} /> Zone de danger
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Cette action efface définitivement toutes les données scolaires enregistrées sur ce navigateur.
                </p>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                  onClick={() => setConfirmResetOpen(true)}
                >
                  <Trash2 size={14} /> Réinitialiser toutes les données
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Onglet Clôture & Passage de classe */
        <div className="card">
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={22} color="var(--primary)" /> Assistant de passage de classe (Promotion)
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Permet de faire passer en bloc les élèves admis dans la classe supérieure pour la rentrée scolaire sans ressaisie manuelle.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, background: '#f8fafc', padding: 20, borderRadius: 8, marginBottom: 24, border: '1px solid var(--border)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>1. Classe d'origine (Année en cours)</label>
              <select value={classeSource} onChange={e => setClasseSource(e.target.value)}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>2. Classe de destination (Pour les admis)</label>
              <select value={classeCible} onChange={e => setClasseCible(e.target.value)}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>3. Nouvelle année scolaire</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select value={nouvelleAnnee} onChange={e => setNouvelleAnnee(e.target.value)} style={{ flex: 1 }}>
                  {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, cursor: 'pointer', fontWeight: 'normal' }}>
                <input
                  type="checkbox"
                  checked={updateAnneeGlobal}
                  onChange={e => setUpdateAnneeGlobal(e.target.checked)}
                />
                Mettre à jour l'année active de l'école
              </label>
            </div>
          </div>

          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: 15 }}>
              Effectif de {classeSource} : <strong>{elevesSource.length}</strong> élève(s)
            </h4>
            <button
              className="btn btn-primary"
              disabled={elevesSource.length === 0}
              onClick={() => setConfirmPromotionOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <CheckCircle2 size={16} /> Appliquer les décisions ({elevesSource.length})
            </button>
          </div>

          {elevesSource.length === 0 ? (
            <div className="empty-state">
              <p>Aucun élève actif trouvé dans la classe {classeSource}.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Matricule</th>
                    <th>Nom & Prénom</th>
                    <th>Dernière moyenne</th>
                    <th>Décision proposée</th>
                    <th>Classe résultante</th>
                  </tr>
                </thead>
                <tbody>
                  {elevesSource.map(eleve => {
                    const bList = bulletins.filter(b => b.eleveId === eleve.id);
                    const lastB = bList[bList.length - 1];
                    const moy = lastB ? lastB.moyenneGenerale : null;
                    const dec = decisions[eleve.id] || 'passage';

                    return (
                      <tr key={eleve.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#eef2f9', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                            {eleve.matricule}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{eleve.nom} {eleve.prenom}</td>
                        <td>
                          {moy ? (
                            <strong style={{ color: parseFloat(moy) >= 10 ? 'var(--success)' : 'var(--danger)' }}>
                              {moy} / 20
                            </strong>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Non évalué</span>
                          )}
                        </td>
                        <td>
                          <select
                            value={dec}
                            onChange={e => setDecisions({ ...decisions, [eleve.id]: e.target.value })}
                            style={{ width: 'auto', minWidth: 200 }}
                          >
                            <option value="passage">Admis(e) → Passage</option>
                            <option value="redoublement">Redoublement</option>
                            <option value="quitter">Quitte l'école (Inactif)</option>
                          </select>
                        </td>
                        <td>
                          {dec === 'passage' ? (
                            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <ArrowRight size={12} /> {classeCible}
                            </span>
                          ) : dec === 'redoublement' ? (
                            <span className="badge badge-warning">
                              Reste en {classeSource}
                            </span>
                          ) : (
                            <span className="badge badge-danger">
                              Archivé / Sorti
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation de restauration */}
      <ConfirmModal
        isOpen={!!pendingImportData}
        title="Restaurer les données scolaires"
        message="Attention : cette opération remplacera les données actuelles par le contenu du fichier sélectionné. Êtes-vous sûr ?"
        confirmText="Oui, restaurer"
        cancelText="Annuler"
        variant="warning"
        onConfirm={confirmImport}
        onCancel={() => setPendingImportData(null)}
      />

      {/* Confirmation de passage de classe */}
      <ConfirmModal
        isOpen={confirmPromotionOpen}
        title="Confirmer la promotion des élèves"
        message={`Voulez-vous appliquer le passage de classe pour les ${elevesSource.length} élèves de ${classeSource} vers ${classeCible} ?`}
        confirmText="Oui, appliquer"
        cancelText="Annuler"
        variant="primary"
        onConfirm={handleApplyPromotion}
        onCancel={() => setConfirmPromotionOpen(false)}
      />

      {/* Confirmation de réinitialisation complète */}
      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Réinitialiser toutes les données"
        message="Êtes-vous absolument sûr ? Toutes les inscriptions, notes, reçus et transactions seront définitivement supprimés."
        confirmText="Tout réinitialiser"
        cancelText="Annuler"
        variant="danger"
        onConfirm={handleResetAll}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}
