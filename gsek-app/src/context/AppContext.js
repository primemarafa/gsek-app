import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

const generateMatricule = (annee, index) => {
  const yr = annee || new Date().getFullYear();
  const num = String(index).padStart(4, '0');
  return `GSEK-${yr}-${num}`;
};

const initialEleves = [
  {
    id: uuidv4(), matricule: 'GSEK-2024-0001', nom: 'Konaté', prenom: 'Amadou',
    dateNaissance: '2012-03-15', sexe: 'M', classe: '6ème A', statut: 'actif',
    parentNom: 'Konaté Ibrahima', parentTel: '+221 77 123 45 67',
    adresse: 'Dakar, Médina', dateInscription: '2024-09-01', photo: null
  },
  {
    id: uuidv4(), matricule: 'GSEK-2024-0002', nom: 'Diallo', prenom: 'Fatoumata',
    dateNaissance: '2011-07-22', sexe: 'F', classe: '5ème B', statut: 'actif',
    parentNom: 'Diallo Mamadou', parentTel: '+221 76 234 56 78',
    adresse: 'Dakar, Plateau', dateInscription: '2024-09-01', photo: null
  },
  {
    id: uuidv4(), matricule: 'GSEK-2024-0003', nom: 'Sow', prenom: 'Ousmane',
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

const CLASSES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème A', '6ème B', '5ème A', '5ème B', '4ème A', '4ème B', '3ème A', '3ème B'];
const MATIERES = ['Mathématiques', 'Français', 'Sciences', 'Histoire-Géographie', 'Anglais', 'Physique-Chimie', 'SVT', 'Éducation Civique', 'Arabe', 'Informatique', 'EPS'];
const ANNEES = ['2023-2024', '2024-2025', '2025-2026'];
const TRIMESTRES = ['1er Trimestre', '2ème Trimestre', '3ème Trimestre'];

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

  useEffect(() => { localStorage.setItem('gsek_eleves', JSON.stringify(eleves)); }, [eleves]);
  useEffect(() => { localStorage.setItem('gsek_personnel', JSON.stringify(personnel)); }, [personnel]);
  useEffect(() => { localStorage.setItem('gsek_paiements', JSON.stringify(paiements)); }, [paiements]);
  useEffect(() => { localStorage.setItem('gsek_bulletins', JSON.stringify(bulletins)); }, [bulletins]);
  useEffect(() => { localStorage.setItem('gsek_transactions', JSON.stringify(transactions)); }, [transactions]);

  const addEleve = (data) => {
    const index = eleves.length + 1;
    const newEleve = { ...data, id: uuidv4(), matricule: generateMatricule(new Date().getFullYear(), index) };
    setEleves(prev => [...prev, newEleve]);
    return newEleve;
  };
  const updateEleve = (id, data) => setEleves(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  const deleteEleve = (id) => setEleves(prev => prev.filter(e => e.id !== id));

  const addPersonnel = (data) => {
    const index = personnel.length + 1;
    const newP = { ...data, id: uuidv4(), matricule: `PERS-${String(index).padStart(3,'0')}` };
    setPersonnel(prev => [...prev, newP]);
    return newP;
  };
  const updatePersonnel = (id, data) => setPersonnel(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const deletePersonnel = (id) => setPersonnel(prev => prev.filter(p => p.id !== id));

  const addPaiement = (data) => {
    const index = paiements.length + 1;
    const ref = `RECU-${new Date().getFullYear()}-${String(index).padStart(4,'0')}`;
    const newP = { ...data, id: uuidv4(), ref, datePaiement: new Date().toISOString().split('T')[0] };
    setPaiements(prev => [...prev, newP]);
    const recette = { id: uuidv4(), date: newP.datePaiement, type: 'recette', categorie: data.type === 'inscription' ? 'Inscriptions' : 'Mensualités', montant: data.montant, description: `${ref} — ${data.eleveNom}`, ref };
    setTransactions(prev => [...prev, recette]);
    return newP;
  };

  const addBulletin = (data) => {
    const newB = { ...data, id: uuidv4(), dateCreation: new Date().toISOString().split('T')[0] };
    setBulletins(prev => [...prev, newB]);
    return newB;
  };
  const updateBulletin = (id, data) => setBulletins(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));

  const addTransaction = (data) => {
    const index = transactions.length + 1;
    const newT = { ...data, id: uuidv4(), ref: `TRX-${String(index).padStart(4,'0')}` };
    setTransactions(prev => [...prev, newT]);
    return newT;
  };

  return (
    <AppContext.Provider value={{
      eleves, personnel, paiements, bulletins, transactions,
      addEleve, updateEleve, deleteEleve,
      addPersonnel, updatePersonnel, deletePersonnel,
      addPaiement,
      addBulletin, updateBulletin,
      addTransaction,
      CLASSES, MATIERES, ANNEES, TRIMESTRES
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
