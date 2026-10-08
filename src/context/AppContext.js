import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../services/api';

const AppContext = createContext();

export const ROLES = {
  directeur: {
    id: 'directeur',
    label: 'Directeur Général',
    badge: 'badge-gold',
    description: 'Accès complet à tous les modules administratifs et financiers',
    allowedRoutes: ['/dashboard', '/eleves', '/badges', '/bulletin', '/viescolaire', '/personnel', '/comptabilite', '/paiement', '/parametres']
  },
  comptable: {
    id: 'comptable',
    label: 'Comptable',
    badge: 'badge-success',
    description: 'Gestion des paiements, recettes, dépenses et masse salariale',
    allowedRoutes: ['/dashboard', '/paiement', '/comptabilite', '/personnel']
  },
  secretaire: {
    id: 'secretaire',
    label: 'Secrétariat',
    badge: 'badge-info',
    description: 'Gestion des élèves, badges avec QR, bulletins et reçus',
    allowedRoutes: ['/dashboard', '/eleves', '/badges', '/bulletin', '/viescolaire', '/paiement']
  },
  enseignant: {
    id: 'enseignant',
    label: 'Enseignant',
    badge: 'badge-warning',
    description: 'Saisie des notes, consultation des élèves et assiduité',
    allowedRoutes: ['/dashboard', '/bulletin', '/viescolaire', '/eleves']
  }
};

export const DEFAULT_USERS = [
  {
    id: 'u-dir',
    nom: 'Sarr',
    prenom: 'Abdoulaye',
    email: 'direction@gsek.sn',
    password: 'admin',
    role: 'directeur',
    titre: 'Directeur Général',
    matricule: 'PERS-001'
  },
  {
    id: 'u-cpt',
    nom: 'Diop',
    prenom: 'Mamadou',
    email: 'comptable@gsek.sn',
    password: 'admin',
    role: 'comptable',
    titre: 'Responsable Comptabilité',
    matricule: 'PERS-004'
  },
  {
    id: 'u-sec',
    nom: 'Diallo',
    prenom: 'Aminata',
    email: 'secretaire@gsek.sn',
    password: 'admin',
    role: 'secretaire',
    titre: 'Secrétaire Administrative',
    matricule: 'PERS-005'
  },
  {
    id: 'u-ens',
    nom: 'Ba',
    prenom: 'Mariama',
    email: 'enseignant@gsek.sn',
    password: 'admin',
    role: 'enseignant',
    titre: 'Professeure de Mathématiques',
    matricule: 'PERS-002'
  }
];

const generateMatricule = (annee, index) => {
  const yr = annee || new Date().getFullYear();
  const num = String(index).padStart(4, '0');
  return `GSEK-${yr}-${num}`;
};

const initialEleves = [
  {
    id: 'e1', matricule: 'GSEK-2024-0001', nom: 'Konaté', prenom: 'Amadou',
    dateNaissance: '2012-03-15', sexe: 'M', classe: '6ème A', statut: 'actif',
    parentNom: 'Konaté Ibrahima', parentTel: '+221 77 123 45 67',
    adresse: 'Dakar, Médina', dateInscription: '2024-09-01', photo: null
  },
  {
    id: 'e2', matricule: 'GSEK-2024-0002', nom: 'Diallo', prenom: 'Fatoumata',
    dateNaissance: '2011-07-22', sexe: 'F', classe: '5ème B', statut: 'actif',
    parentNom: 'Diallo Mamadou', parentTel: '+221 76 234 56 78',
    adresse: 'Dakar, Plateau', dateInscription: '2024-09-01', photo: null
  },
  {
    id: 'e3', matricule: 'GSEK-2024-0003', nom: 'Sow', prenom: 'Ousmane',
    dateNaissance: '2010-11-05', sexe: 'M', classe: '4ème A', statut: 'actif',
    parentNom: 'Sow Awa', parentTel: '+221 78 345 67 89',
    adresse: 'Dakar, Grand-Yoff', dateInscription: '2024-09-01', photo: null
  }
];

const initialPersonnel = [
  {
    id: uuidv4(), matricule: 'PERS-001', nom: 'Sarr', prenom: 'Abdoulaye',
    role: 'Directeur', matiere: '', salaire: 450000, dateEmbauche: '2020-09-01',
    tel: '+221 77 111 22 33', email: 'a.sarr@gsek.sn', statut: 'actif', contrat: 'CDI'
  },
  {
    id: uuidv4(), matricule: 'PERS-002', nom: 'Ba', prenom: 'Mariama',
    role: 'Enseignante', matiere: 'Mathématiques', salaire: 280000, dateEmbauche: '2021-09-01',
    tel: '+221 76 222 33 44', email: 'm.ba@gsek.sn', statut: 'actif', contrat: 'CDD'
  },
  {
    id: uuidv4(), matricule: 'PERS-003', nom: 'Ndiaye', prenom: 'Pape',
    role: 'Enseignant', matiere: 'Français', salaire: 260000, dateEmbauche: '2022-01-15',
    tel: '+221 78 333 44 55', email: 'p.ndiaye@gsek.sn', statut: 'actif', contrat: 'CDI'
  }
];

const initialPaiements = [];
const initialBulletins = [];
const initialTransactions = [
  { id: uuidv4(), date: '2025-01-15', type: 'recette', categorie: 'Inscriptions', montant: 850000, description: 'Inscriptions janvier 2025', ref: 'TRX-001' },
  { id: uuidv4(), date: '2025-01-20', type: 'recette', categorie: 'Mensualités', montant: 1250000, description: 'Mensualités janvier 2025', ref: 'TRX-002' },
  { id: uuidv4(), date: '2025-01-31', type: 'depense', categorie: 'Salaires', montant: 990000, description: 'Salaires janvier 2025', ref: 'TRX-003' },
  { id: uuidv4(), date: '2025-02-05', type: 'depense', categorie: 'Fournitures', montant: 125000, description: 'Fournitures scolaires', ref: 'TRX-004' },
];

const initialAbsences = [
  {
    id: uuidv4(),
    eleveId: 'e1',
    eleveNom: 'Konaté Amadou',
    eleveMatricule: 'GSEK-2024-0001',
    classe: '6ème A',
    date: '2025-01-14',
    type: 'justifiee', // 'justifiee' | 'injustifiee' | 'retard'
    dureeHeures: 4,
    motif: 'Raison médicale (certificat remis au surveillant)'
  },
  {
    id: uuidv4(),
    eleveId: 'e2',
    eleveNom: 'Diallo Fatoumata',
    eleveMatricule: 'GSEK-2024-0002',
    classe: '5ème B',
    date: '2025-01-18',
    type: 'retard',
    dureeHeures: 0.5,
    motif: 'Embouteillages transport scolaire'
  }
];

const CLASSES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème A', '6ème B', '5ème A', '5ème B', '4ème A', '4ème B', '3ème A', '3ème B', '2nde L', '2nde S', '1ère L', '1ère S', 'Tle L', 'Tle S'];
const MATIERES = ['Mathématiques', 'Français', 'Sciences', 'Histoire-Géographie', 'Anglais', 'Physique-Chimie', 'SVT', 'Éducation Civique', 'Arabe', 'Informatique', 'EPS'];
const ANNEES = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
const TRIMESTRES = ['1er Trimestre', '2ème Trimestre', '3ème Trimestre'];

const defaultParametres = {
  nom: "Groupe Scolaire d'Excellence Sidy Konaté",
  adresse: 'Dakar, Sénégal',
  telephone: '+221 33 800 00 00',
  email: 'contact@gsek.sn',
  siteWeb: 'www.gsek.sn',
  devise: 'Excellence · Discipline · Réussite',
  anneeScolaire: '2024-2025',
  fraisInscription: 75000,
  fraisMensualite: 35000,
};

export const AppProvider = ({ children }) => {
  const [eleves, setEleves] = useState(() => {
    const saved = localStorage.getItem('gsek_eleves');
    return saved ? JSON.parse(saved) : initialEleves;
  });
  const [personnel, setPersonnel] = useState(() => {
    const saved = localStorage.getItem('gsek_personnel');
    return saved ? JSON.parse(saved) : initialPersonnel;
  });
  const [paiements, setPaiements] = useState(() => {
    const saved = localStorage.getItem('gsek_paiements');
    return saved ? JSON.parse(saved) : initialPaiements;
  });
  const [bulletins, setBulletins] = useState(() => {
    const saved = localStorage.getItem('gsek_bulletins');
    return saved ? JSON.parse(saved) : initialBulletins;
  });
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('gsek_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });
  const [absences, setAbsences] = useState(() => {
    const saved = localStorage.getItem('gsek_absences');
    return saved ? JSON.parse(saved) : initialAbsences;
  });
  const [parametres, setParametres] = useState(() => {
    const saved = localStorage.getItem('gsek_parametres');
    return saved ? JSON.parse(saved) : defaultParametres;
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('gsek_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_USERS[0];
  });

  const [serverConnected, setServerConnected] = useState(false);
  const currentRole = currentUser?.role || 'directeur';

  // Synchronisation automatique avec le serveur SQLite au démarrage
  useEffect(() => {
    let isMounted = true;
    const fetchServerData = async () => {
      try {
        const data = await api.getBootstrap();
        if (!isMounted) return;
        if (data.eleves && data.eleves.length) setEleves(data.eleves);
        if (data.personnel && data.personnel.length) setPersonnel(data.personnel);
        if (data.paiements) setPaiements(data.paiements);
        if (data.bulletins) setBulletins(data.bulletins);
        if (data.transactions) setTransactions(data.transactions);
        if (data.absences) setAbsences(data.absences);
        if (data.parametres && data.parametres.nom) {
          setParametres(prev => ({ ...prev, ...data.parametres }));
        }
        setServerConnected(true);
      } catch (e) {
        // Le backend n'est pas encore démarré : utilisation transparente du localStorage
        if (isMounted) setServerConnected(false);
      }
    };
    fetchServerData();
    return () => { isMounted = false; };
  }, []);

  const syncWithServer = async () => {
    try {
      const data = await api.getBootstrap();
      if (data.eleves) setEleves(data.eleves);
      if (data.personnel) setPersonnel(data.personnel);
      if (data.paiements) setPaiements(data.paiements);
      if (data.bulletins) setBulletins(data.bulletins);
      if (data.transactions) setTransactions(data.transactions);
      if (data.absences) setAbsences(data.absences);
      if (data.parametres && data.parametres.nom) setParametres(prev => ({ ...prev, ...data.parametres }));
      setServerConnected(true);
      return { success: true };
    } catch (err) {
      setServerConnected(false);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => { localStorage.setItem('gsek_eleves', JSON.stringify(eleves)); }, [eleves]);
  useEffect(() => { localStorage.setItem('gsek_personnel', JSON.stringify(personnel)); }, [personnel]);
  useEffect(() => { localStorage.setItem('gsek_paiements', JSON.stringify(paiements)); }, [paiements]);
  useEffect(() => { localStorage.setItem('gsek_bulletins', JSON.stringify(bulletins)); }, [bulletins]);
  useEffect(() => { localStorage.setItem('gsek_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('gsek_absences', JSON.stringify(absences)); }, [absences]);
  useEffect(() => { localStorage.setItem('gsek_parametres', JSON.stringify(parametres)); }, [parametres]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gsek_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('gsek_current_user');
    }
  }, [currentUser]);

  const login = (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const found = DEFAULT_USERS.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === password
    );
    if (found) {
      setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, error: 'Identifiants invalides (email ou mot de passe incorrect).' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const changeRole = (newRole) => {
    const matchingUser = DEFAULT_USERS.find(u => u.role === newRole);
    if (matchingUser) {
      setCurrentUser(matchingUser);
    } else if (ROLES[newRole]) {
      setCurrentUser(prev => ({ ...(prev || DEFAULT_USERS[0]), role: newRole }));
    }
  };

  const isRouteAllowed = (path) => {
    if (!currentUser) return false;
    const roleConfig = ROLES[currentUser.role] || ROLES.directeur;
    // Vérifier si le chemin commence par un des préfixes autorisés
    return roleConfig.allowedRoutes.some(route => path.startsWith(route) || path === '/');
  };

  const updateParametres = (data) => {
    setParametres(prev => {
      const merged = { ...prev, ...data };
      api.saveParametres(merged).catch(() => {});
      return merged;
    });
  };

  const addEleve = (data) => {
    const yr = new Date().getFullYear();
    const regex = new RegExp(`^GSEK-${yr}-(\\d+)$`);
    let maxNum = 0;
    eleves.forEach(e => {
      const match = e.matricule && e.matricule.match(regex);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const nextIndex = maxNum + 1;
    const newEleve = { ...data, id: uuidv4(), matricule: generateMatricule(yr, nextIndex) };
    setEleves(prev => [...prev, newEleve]);
    api.saveEleve(newEleve, true).catch(() => {});
    return newEleve;
  };

  const updateEleve = (id, data) => {
    setEleves(prev => prev.map(e => {
      if (e.id === id) {
        const updated = { ...e, ...data };
        api.saveEleve(updated, false).catch(() => {});
        return updated;
      }
      return e;
    }));
  };

  const deleteEleve = (id) => {
    setEleves(prev => prev.filter(e => e.id !== id));
    api.deleteEleve(id).catch(() => {});
  };

  const addPersonnel = (data) => {
    let maxNum = 0;
    personnel.forEach(p => {
      const match = p.matricule && p.matricule.match(/^PERS-(\d+)$/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const nextIndex = maxNum + 1;
    const newP = { ...data, id: uuidv4(), matricule: `PERS-${String(nextIndex).padStart(3, '0')}` };
    setPersonnel(prev => [...prev, newP]);
    api.savePersonnel(newP, true).catch(() => {});
    return newP;
  };

  const updatePersonnel = (id, data) => {
    setPersonnel(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...data };
        api.savePersonnel(updated, false).catch(() => {});
        return updated;
      }
      return p;
    }));
  };

  const deletePersonnel = (id) => {
    setPersonnel(prev => prev.filter(p => p.id !== id));
    api.deletePersonnel(id).catch(() => {});
  };

  const addPaiement = (data) => {
    const yr = new Date().getFullYear();
    const regex = new RegExp(`^RECU-${yr}-(\\d+)$`);
    let maxNum = 0;
    paiements.forEach(p => {
      const match = p.ref && p.ref.match(regex);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const nextIndex = maxNum + 1;
    const ref = `RECU-${yr}-${String(nextIndex).padStart(4, '0')}`;
    const newP = { ...data, id: uuidv4(), ref, date: new Date().toISOString().split('T')[0] };
    setPaiements(prev => [...prev, newP]);
    const recette = {
      id: uuidv4(),
      date: newP.date,
      type: 'recette',
      categorie: data.type === 'inscription' ? 'Inscriptions' : 'Mensualités',
      montant: data.montant,
      description: `${ref} — ${data.eleveNom}`,
      ref
    };
    setTransactions(prev => [...prev, recette]);
    api.savePaiement(newP).catch(() => {});
    api.saveTransaction(recette).catch(() => {});
    return newP;
  };

  const deletePaiement = (id) => {
    const target = paiements.find(p => p.id === id);
    if (target && target.ref) {
      setTransactions(prev => prev.filter(t => t.ref !== target.ref));
    }
    setPaiements(prev => prev.filter(p => p.id !== id));
    api.deletePaiement(id).catch(() => {});
  };

  const addBulletin = (data) => {
    const newB = { ...data, id: uuidv4(), dateCreation: new Date().toISOString().split('T')[0] };
    setBulletins(prev => [...prev, newB]);
    api.saveBulletin(newB).catch(() => {});
    return newB;
  };

  const updateBulletin = (id, data) => {
    setBulletins(prev => prev.map(b => {
      if (b.id === id) {
        const updated = { ...b, ...data };
        api.saveBulletin(updated).catch(() => {});
        return updated;
      }
      return b;
    }));
  };

  const deleteBulletin = (id) => {
    setBulletins(prev => prev.filter(b => b.id !== id));
    api.deleteBulletin(id).catch(() => {});
  };

  const addTransaction = (data) => {
    let maxNum = 0;
    transactions.forEach(t => {
      const match = t.ref && t.ref.match(/^TRX-(\d+)$/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const nextIndex = maxNum + 1;
    const newT = { ...data, id: uuidv4(), ref: `TRX-${String(nextIndex).padStart(4, '0')}` };
    setTransactions(prev => [...prev, newT]);
    api.saveTransaction(newT).catch(() => {});
    return newT;
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    api.deleteTransaction(id).catch(() => {});
  };

  const addAbsence = (data) => {
    const newA = { ...data, id: uuidv4() };
    setAbsences(prev => [newA, ...prev]);
    api.saveAbsence(newA).catch(() => {});
    return newA;
  };

  const deleteAbsence = (id) => {
    setAbsences(prev => prev.filter(a => a.id !== id));
    api.deleteAbsence(id).catch(() => {});
  };

  // Clôture d'année & Passage de classe
  const clotureEtPassageClasse = ({ promotions, nouvelleAnneeScolaire }) => {
    // promotions: [ { eleveId, action: 'passage' | 'redoublement' | 'quitter', targetClasse } ]
    if (!promotions || !promotions.length) return { success: false, count: 0 };

    setEleves(prev => prev.map(eleve => {
      const promo = promotions.find(p => p.eleveId === eleve.id);
      if (!promo) return eleve;

      if (promo.action === 'passage' && promo.targetClasse) {
        return { ...eleve, classe: promo.targetClasse };
      }
      if (promo.action === 'quitter') {
        return { ...eleve, statut: 'inactif' };
      }
      return eleve; // redoublement: reste dans la même classe
    }));

    if (nouvelleAnneeScolaire) {
      updateParametres({ anneeScolaire: nouvelleAnneeScolaire });
    }

    return { success: true, count: promotions.length };
  };

  const exportData = () => {
    const backup = {
      version: '1.2.0',
      dateExport: new Date().toISOString(),
      parametres,
      eleves,
      personnel,
      paiements,
      bulletins,
      transactions,
      absences
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('download', `gsek_sauvegarde_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (data.eleves && Array.isArray(data.eleves)) setEleves(data.eleves);
      if (data.personnel && Array.isArray(data.personnel)) setPersonnel(data.personnel);
      if (data.paiements && Array.isArray(data.paiements)) setPaiements(data.paiements);
      if (data.bulletins && Array.isArray(data.bulletins)) setBulletins(data.bulletins);
      if (data.transactions && Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (data.absences && Array.isArray(data.absences)) setAbsences(data.absences);
      if (data.parametres && typeof data.parametres === 'object') setParametres(data.parametres);
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la restauration :', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <AppContext.Provider value={{
      eleves, personnel, paiements, bulletins, transactions, absences, parametres,
      currentUser, currentRole, changeRole, login, logout, DEFAULT_USERS,
      serverConnected, syncWithServer,
      isRouteAllowed, ROLES,
      addEleve, updateEleve, deleteEleve,
      addPersonnel, updatePersonnel, deletePersonnel,
      addPaiement, deletePaiement,
      addBulletin, updateBulletin, deleteBulletin,
      addTransaction, deleteTransaction,
      addAbsence, deleteAbsence,
      clotureEtPassageClasse,
      updateParametres,
      exportData, importData,
      CLASSES, MATIERES, ANNEES, TRIMESTRES
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
