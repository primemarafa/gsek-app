const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

// Dossier de données sécurisé sur l'UC
const DATA_DIR = path.join(__dirname, 'data');
const BACKUPS_DIR = path.join(__dirname, 'backups');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'gsek.sqlite');

// Initialisation de la base SQLite native
const db = new DatabaseSync(DB_PATH);

// Configuration haute performance WAL (Write-Ahead Logging) & Cache RAM
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA cache_size = -64000;'); // 64 Mo de cache RAM dédié

// Création des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS parametres (
    id TEXT PRIMARY KEY,
    nom TEXT,
    adresse TEXT,
    telephone TEXT,
    email TEXT,
    siteWeb TEXT,
    devise TEXT,
    anneeScolaire TEXT,
    fraisInscription REAL,
    fraisMensualite REAL,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS utilisateurs (
    id TEXT PRIMARY KEY,
    nom TEXT,
    prenom TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    titre TEXT,
    matricule TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS eleves (
    id TEXT PRIMARY KEY,
    matricule TEXT UNIQUE,
    nom TEXT,
    prenom TEXT,
    dateNaissance TEXT,
    sexe TEXT,
    classe TEXT,
    statut TEXT,
    parentNom TEXT,
    parentTel TEXT,
    adresse TEXT,
    dateInscription TEXT,
    photo TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS personnel (
    id TEXT PRIMARY KEY,
    matricule TEXT UNIQUE,
    nom TEXT,
    prenom TEXT,
    role TEXT,
    matiere TEXT,
    salaire REAL,
    dateEmbauche TEXT,
    tel TEXT,
    email TEXT,
    statut TEXT,
    contrat TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS paiements (
    id TEXT PRIMARY KEY,
    ref TEXT UNIQUE,
    date TEXT,
    eleveId TEXT,
    eleveNom TEXT,
    eleveMatricule TEXT,
    classe TEXT,
    type TEXT,
    montant REAL,
    modePaiement TEXT,
    mois TEXT,
    annee TEXT,
    recuPar TEXT,
    commentaire TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS bulletins (
    id TEXT PRIMARY KEY,
    eleveId TEXT,
    eleveNom TEXT,
    classe TEXT,
    trimestre TEXT,
    annee TEXT,
    notes TEXT,
    appreciation TEXT,
    moyenneGenerale REAL,
    rang INTEGER,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    ref TEXT,
    date TEXT,
    type TEXT,
    categorie TEXT,
    montant REAL,
    description TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS absences (
    id TEXT PRIMARY KEY,
    eleveId TEXT,
    eleveNom TEXT,
    eleveMatricule TEXT,
    classe TEXT,
    date TEXT,
    type TEXT,
    dureeHeures REAL,
    motif TEXT,
    createdAt TEXT
  );

  -- Index d'accélération B-Tree pour requêtes < 2 ms
  CREATE INDEX IF NOT EXISTS idx_eleves_classe ON eleves(classe);
  CREATE INDEX IF NOT EXISTS idx_eleves_matricule ON eleves(matricule);
  CREATE INDEX IF NOT EXISTS idx_paiements_eleve ON paiements(eleveId);
  CREATE INDEX IF NOT EXISTS idx_paiements_mois ON paiements(mois);
  CREATE INDEX IF NOT EXISTS idx_absences_eleve ON absences(eleveId);
  CREATE INDEX IF NOT EXISTS idx_absences_date ON absences(date);
  CREATE INDEX IF NOT EXISTS idx_bulletins_eleve ON bulletins(eleveId);
  CREATE INDEX IF NOT EXISTS idx_bulletins_classe ON bulletins(classe, trimestre, annee);
`);

// Données initiales si la base vient d'être créée
function seedIfEmpty() {
  const usersCount = db.prepare('SELECT count(*) as count FROM utilisateurs').get().count;
  if (usersCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO utilisateurs (id, nom, prenom, email, password, role, titre, matricule, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    insertUser.run('u-dir', 'Sarr', 'Abdoulaye', 'direction@gsek.sn', 'admin', 'directeur', 'Directeur Général', 'PERS-001');
    insertUser.run('u-cpt', 'Diop', 'Mamadou', 'comptable@gsek.sn', 'admin', 'comptable', 'Responsable Comptabilité', 'PERS-004');
    insertUser.run('u-sec', 'Diallo', 'Aminata', 'secretaire@gsek.sn', 'admin', 'secretaire', 'Secrétaire Administrative', 'PERS-005');
    insertUser.run('u-ens', 'Ba', 'Mariama', 'enseignant@gsek.sn', 'admin', 'enseignant', 'Professeure de Mathématiques', 'PERS-002');
  }

  const paramCount = db.prepare('SELECT count(*) as count FROM parametres').get().count;
  if (paramCount === 0) {
    const insertParam = db.prepare(`
      INSERT INTO parametres (id, nom, adresse, telephone, email, siteWeb, devise, anneeScolaire, fraisInscription, fraisMensualite, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    insertParam.run(
      'main',
      "Groupe Scolaire d'Excellence Sidy Konaté",
      'Dakar, Sénégal',
      '+221 33 800 00 00',
      'contact@gsek.sn',
      'www.gsek.sn',
      'Excellence · Discipline · Réussite',
      '2024-2025',
      75000,
      35000
    );
  }

  const elevesCount = db.prepare('SELECT count(*) as count FROM eleves').get().count;
  if (elevesCount === 0) {
    const insertEleve = db.prepare(`
      INSERT INTO eleves (id, matricule, nom, prenom, dateNaissance, sexe, classe, statut, parentNom, parentTel, adresse, dateInscription, photo, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    insertEleve.run('e1', 'GSEK-2024-0001', 'Konaté', 'Amadou', '2012-03-15', 'M', '6ème A', 'actif', 'Konaté Ibrahima', '+221 77 123 45 67', 'Dakar, Médina', '2024-09-01', null);
    insertEleve.run('e2', 'GSEK-2024-0002', 'Diallo', 'Fatoumata', '2011-07-22', 'F', '5ème B', 'actif', 'Diallo Mamadou', '+221 76 234 56 78', 'Dakar, Plateau', '2024-09-01', null);
    insertEleve.run('e3', 'GSEK-2024-0003', 'Sow', 'Ousmane', '2010-11-05', 'M', '4ème A', 'actif', 'Sow Awa', '+221 78 345 67 89', 'Dakar, Grand-Yoff', '2024-09-01', null);
  }

  const staffCount = db.prepare('SELECT count(*) as count FROM personnel').get().count;
  if (staffCount === 0) {
    const insertStaff = db.prepare(`
      INSERT INTO personnel (id, matricule, nom, prenom, role, matiere, salaire, dateEmbauche, tel, email, statut, contrat, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    insertStaff.run('p1', 'PERS-001', 'Sarr', 'Abdoulaye', 'Directeur', '', 450000, '2020-09-01', '+221 77 111 22 33', 'a.sarr@gsek.sn', 'actif', 'CDI');
    insertStaff.run('p2', 'PERS-002', 'Ba', 'Mariama', 'Enseignante', 'Mathématiques', 280000, '2021-09-01', '+221 76 222 33 44', 'm.ba@gsek.sn', 'actif', 'CDD');
    insertStaff.run('p3', 'PERS-003', 'Ndiaye', 'Pape', 'Enseignant', 'Français', 260000, '2022-01-15', '+221 78 333 44 55', 'p.ndiaye@gsek.sn', 'actif', 'CDI');
  }

  const transCount = db.prepare('SELECT count(*) as count FROM transactions').get().count;
  if (transCount === 0) {
    const insertTrans = db.prepare(`
      INSERT INTO transactions (id, ref, date, type, categorie, montant, description, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    insertTrans.run('t1', 'TRX-001', '2025-01-15', 'recette', 'Inscriptions', 850000, 'Inscriptions janvier 2025');
    insertTrans.run('t2', 'TRX-002', '2025-01-20', 'recette', 'Mensualités', 1250000, 'Mensualités janvier 2025');
    insertTrans.run('t3', 'TRX-003', '2025-01-31', 'depense', 'Salaires', 990000, 'Salaires janvier 2025');
    insertTrans.run('t4', 'TRX-004', '2025-02-05', 'depense', 'Fournitures', 125000, 'Fournitures scolaires');
  }

  const absCount = db.prepare('SELECT count(*) as count FROM absences').get().count;
  if (absCount === 0) {
    const insertAbs = db.prepare(`
      INSERT INTO absences (id, eleveId, eleveNom, eleveMatricule, classe, date, type, dureeHeures, motif, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    insertAbs.run('a1', 'e1', 'Konaté Amadou', 'GSEK-2024-0001', '6ème A', '2025-01-14', 'justifiee', 4, 'Raison médicale');
    insertAbs.run('a2', 'e2', 'Diallo Fatoumata', 'GSEK-2024-0002', '5ème B', '2025-01-18', 'retard', 0.5, 'Embouteillages transport');
  }
}

seedIfEmpty();

module.exports = {
  db,
  DB_PATH,
  DATA_DIR,
  BACKUPS_DIR
};
