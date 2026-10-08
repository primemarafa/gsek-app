const express = require('express');
const router = express.Router();
const { db, DB_PATH, BACKUPS_DIR } = require('./db');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Helper pour parser JSON de façon sûre
const safeJsonParse = (str, fallback = []) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};

// -------------------------------------------------------------
// 1. STATUT SERVEUR & SANTÉ SYSTÈME
// -------------------------------------------------------------
router.get('/status', (req, res) => {
  const elevesCount = db.prepare('SELECT count(*) as count FROM eleves').get().count;
  const paiementsCount = db.prepare('SELECT count(*) as count FROM paiements').get().count;
  const staffCount = db.prepare('SELECT count(*) as count FROM personnel').get().count;

  // Détection des adresses IP locales de l'UC
  const networkInterfaces = os.networkInterfaces();
  const localIps = [];
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIps.push(net.address);
      }
    }
  }

  res.json({
    status: 'online',
    appName: 'GSEK Serveur Local',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      totalMemMB: Math.round(os.totalmem() / 1024 / 1024),
      freeMemMB: Math.round(os.freemem() / 1024 / 1024),
      localIps
    },
    counts: {
      eleves: elevesCount,
      paiements: paiementsCount,
      personnel: staffCount
    }
  });
});

// -------------------------------------------------------------
// 2. BOOTSTRAP GLOBAL (Chargement instantané 1-requête au démarrage)
// -------------------------------------------------------------
router.get('/bootstrap', (req, res) => {
  const parametresRow = db.prepare('SELECT * FROM parametres WHERE id = ?').get('main');
  const utilisateurs = db.prepare('SELECT id, nom, prenom, email, role, titre, matricule, createdAt FROM utilisateurs').all();
  const eleves = db.prepare('SELECT * FROM eleves ORDER BY classe ASC, nom ASC').all();
  const personnel = db.prepare('SELECT * FROM personnel ORDER BY nom ASC').all();
  const paiements = db.prepare('SELECT * FROM paiements ORDER BY createdAt DESC, date DESC').all();
  const rawBulletins = db.prepare('SELECT * FROM bulletins ORDER BY createdAt DESC').all();
  const bulletins = rawBulletins.map(b => ({
    ...b,
    notes: safeJsonParse(b.notes, [])
  }));
  const transactions = db.prepare('SELECT * FROM transactions ORDER BY date DESC, createdAt DESC').all();
  const absences = db.prepare('SELECT * FROM absences ORDER BY date DESC').all();

  res.json({
    parametres: parametresRow || {},
    utilisateurs,
    eleves,
    personnel,
    paiements,
    bulletins,
    transactions,
    absences
  });
});

// -------------------------------------------------------------
// 3. AUTHENTIFICATION & UTILISATEURS
// -------------------------------------------------------------
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.prepare('SELECT * FROM utilisateurs WHERE lower(email) = ?').get(cleanEmail);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Identifiants invalides (email ou mot de passe incorrect).' });
  }

  // Ne pas exposer le mot de passe en clair dans la réponse
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

router.get('/auth/users', (req, res) => {
  const users = db.prepare('SELECT id, nom, prenom, email, role, titre, matricule, createdAt FROM utilisateurs').all();
  res.json(users);
});

router.post('/auth/users', (req, res) => {
  const { id, nom, prenom, email, password, role, titre, matricule } = req.body || {};
  if (!email || !password || !nom) {
    return res.status(400).json({ error: 'Données utilisateur incomplètes' });
  }

  const newId = id || `u-${Date.now()}`;
  try {
    const stmt = db.prepare(`
      INSERT INTO utilisateurs (id, nom, prenom, email, password, role, titre, matricule, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(newId, nom, prenom, email.toLowerCase(), password, role || 'enseignant', titre || '', matricule || '');
    res.json({ success: true, id: newId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/auth/users/:id', (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, password, role, titre, matricule } = req.body || {};
  try {
    if (password) {
      db.prepare(`
        UPDATE utilisateurs SET nom=?, prenom=?, email=?, password=?, role=?, titre=?, matricule=? WHERE id=?
      `).run(nom, prenom, email.toLowerCase(), password, role, titre, matricule, id);
    } else {
      db.prepare(`
        UPDATE utilisateurs SET nom=?, prenom=?, email=?, role=?, titre=?, matricule=? WHERE id=?
      `).run(nom, prenom, email.toLowerCase(), role, titre, matricule, id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/auth/users/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM utilisateurs WHERE id = ?').run(id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 4. ÉLÈVES
// -------------------------------------------------------------
router.get('/eleves', (req, res) => {
  const eleves = db.prepare('SELECT * FROM eleves ORDER BY classe ASC, nom ASC').all();
  res.json(eleves);
});

router.post('/eleves', (req, res) => {
  const e = req.body;
  const id = e.id || `e-${Date.now()}`;
  try {
    const stmt = db.prepare(`
      INSERT INTO eleves (id, matricule, nom, prenom, dateNaissance, sexe, classe, statut, parentNom, parentTel, adresse, dateInscription, photo, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(
      id, e.matricule, e.nom, e.prenom, e.dateNaissance || '', e.sexe || 'M',
      e.classe || '', e.statut || 'actif', e.parentNom || '', e.parentTel || '',
      e.adresse || '', e.dateInscription || new Date().toISOString().split('T')[0],
      e.photo || null
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/eleves/:id', (req, res) => {
  const { id } = req.params;
  const e = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE eleves SET
        matricule = ?, nom = ?, prenom = ?, dateNaissance = ?, sexe = ?,
        classe = ?, statut = ?, parentNom = ?, parentTel = ?, adresse = ?,
        dateInscription = ?, photo = ?
      WHERE id = ?
    `);
    stmt.run(
      e.matricule, e.nom, e.prenom, e.dateNaissance || '', e.sexe || 'M',
      e.classe || '', e.statut || 'actif', e.parentNom || '', e.parentTel || '',
      e.adresse || '', e.dateInscription || '', e.photo || null,
      id
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/eleves/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM eleves WHERE id = ?').run(id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 5. PERSONNEL
// -------------------------------------------------------------
router.get('/personnel', (req, res) => {
  const list = db.prepare('SELECT * FROM personnel ORDER BY nom ASC').all();
  res.json(list);
});

router.post('/personnel', (req, res) => {
  const p = req.body;
  const id = p.id || `p-${Date.now()}`;
  try {
    const stmt = db.prepare(`
      INSERT INTO personnel (id, matricule, nom, prenom, role, matiere, salaire, dateEmbauche, tel, email, statut, contrat, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(
      id, p.matricule, p.nom, p.prenom, p.role || 'Enseignant', p.matiere || '',
      Number(p.salaire) || 0, p.dateEmbauche || '', p.tel || '', p.email || '',
      p.statut || 'actif', p.contrat || 'CDI'
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/personnel/:id', (req, res) => {
  const { id } = req.params;
  const p = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE personnel SET
        matricule = ?, nom = ?, prenom = ?, role = ?, matiere = ?,
        salaire = ?, dateEmbauche = ?, tel = ?, email = ?, statut = ?, contrat = ?
      WHERE id = ?
    `);
    stmt.run(
      p.matricule, p.nom, p.prenom, p.role || 'Enseignant', p.matiere || '',
      Number(p.salaire) || 0, p.dateEmbauche || '', p.tel || '', p.email || '',
      p.statut || 'actif', p.contrat || 'CDI', id
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/personnel/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM personnel WHERE id = ?').run(id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 6. PAIEMENTS & REÇUS
// -------------------------------------------------------------
router.get('/paiements', (req, res) => {
  const list = db.prepare('SELECT * FROM paiements ORDER BY createdAt DESC, date DESC').all();
  res.json(list);
});

router.post('/paiements', (req, res) => {
  const p = req.body;
  const id = p.id || `pay-${Date.now()}`;
  try {
    const stmt = db.prepare(`
      INSERT INTO paiements (id, ref, date, eleveId, eleveNom, eleveMatricule, classe, type, montant, modePaiement, mois, annee, recuPar, commentaire, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(
      id, p.ref, p.date || new Date().toISOString().split('T')[0],
      p.eleveId, p.eleveNom, p.eleveMatricule, p.classe, p.type || 'mensualite',
      Number(p.montant) || 0, p.modePaiement || 'Espèces', p.mois || '',
      p.annee || '', p.recuPar || 'Caisse', p.commentaire || ''
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/paiements/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM paiements WHERE id = ?').run(id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 7. BULLETINS DE NOTES
// -------------------------------------------------------------
router.get('/bulletins', (req, res) => {
  const rawList = db.prepare('SELECT * FROM bulletins ORDER BY createdAt DESC').all();
  const list = rawList.map(b => ({
    ...b,
    notes: safeJsonParse(b.notes, [])
  }));
  res.json(list);
});

router.post('/bulletins', (req, res) => {
  const b = req.body;
  const id = b.id || `bull-${Date.now()}`;
  const notesStr = typeof b.notes === 'string' ? b.notes : JSON.stringify(b.notes || []);
  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO bulletins (id, eleveId, eleveNom, classe, trimestre, annee, notes, appreciation, moyenneGenerale, rang, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(
      id, b.eleveId, b.eleveNom, b.classe, b.trimestre, b.annee,
      notesStr, b.appreciation || '', Number(b.moyenneGenerale) || 0,
      Number(b.rang) || null
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/bulletins/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM bulletins WHERE id = ?').run(id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 8. TRANSACTIONS COMPTABLES
// -------------------------------------------------------------
router.get('/transactions', (req, res) => {
  const list = db.prepare('SELECT * FROM transactions ORDER BY date DESC, createdAt DESC').all();
  res.json(list);
});

router.post('/transactions', (req, res) => {
  const t = req.body;
  const id = t.id || `trx-${Date.now()}`;
  try {
    const stmt = db.prepare(`
      INSERT INTO transactions (id, ref, date, type, categorie, montant, description, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(
      id, t.ref || `TRX-${Date.now()}`, t.date || new Date().toISOString().split('T')[0],
      t.type || 'recette', t.categorie || 'Autre', Number(t.montant) || 0,
      t.description || ''
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/transactions/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 9. VIE SCOLAIRE & ABSENCES
// -------------------------------------------------------------
router.get('/absences', (req, res) => {
  const list = db.prepare('SELECT * FROM absences ORDER BY date DESC').all();
  res.json(list);
});

router.post('/absences', (req, res) => {
  const a = req.body;
  const id = a.id || `abs-${Date.now()}`;
  try {
    const stmt = db.prepare(`
      INSERT INTO absences (id, eleveId, eleveNom, eleveMatricule, classe, date, type, dureeHeures, motif, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(
      id, a.eleveId, a.eleveNom, a.eleveMatricule, a.classe,
      a.date || new Date().toISOString().split('T')[0],
      a.type || 'justifiee', Number(a.dureeHeures) || 1, a.motif || ''
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/absences/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM absences WHERE id = ?').run(id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 10. PARAMÈTRES DE L'ÉCOLE
// -------------------------------------------------------------
router.get('/parametres', (req, res) => {
  const row = db.prepare('SELECT * FROM parametres WHERE id = ?').get('main');
  res.json(row || {});
});

router.put('/parametres', (req, res) => {
  const p = req.body;
  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO parametres (id, nom, adresse, telephone, email, siteWeb, devise, anneeScolaire, fraisInscription, fraisMensualite, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(
      'main', p.nom, p.adresse, p.telephone, p.email, p.siteWeb,
      p.devise, p.anneeScolaire, Number(p.fraisInscription) || 0,
      Number(p.fraisMensualite) || 0
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 11. SAUVEGARDE & EXPORT / IMPORT
// -------------------------------------------------------------
router.post('/backup', (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `gsek_backup_${timestamp}.sqlite`;
    const backupFilePath = path.join(BACKUPS_DIR, backupFileName);

    // Copie synchrone sécurisée
    fs.copyFileSync(DB_PATH, backupFilePath);

    res.json({
      success: true,
      message: 'Sauvegarde effectuée avec succès',
      fileName: backupFileName,
      path: backupFilePath,
      sizeBytes: fs.statSync(backupFilePath).size
    });
  } catch (err) {
    res.status(500).json({ error: 'Échec de la sauvegarde : ' + err.message });
  }
});

router.get('/backups', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.endsWith('.sqlite'))
      .map(name => {
        const fullPath = path.join(BACKUPS_DIR, name);
        const stat = fs.statSync(fullPath);
        return {
          fileName: name,
          sizeBytes: stat.size,
          createdAt: stat.mtime
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
