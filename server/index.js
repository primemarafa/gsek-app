const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const apiRoutes = require('./api');
const { DB_PATH } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de sécurité et d'encodage
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Journalisation légère des requêtes en console
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.originalUrl.startsWith('/api')) {
      const duration = Date.now() - start;
      console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Routes API REST
app.use('/api', apiRoutes);

// Service de l'application Frontend compilée (Mode Production Déployé)
const buildPath = path.join(__dirname, '../build');
app.use(express.static(buildPath, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.includes(path.join('static', 'js')) || filePath.includes(path.join('static', 'css'))) {
      // Cache agressif 1 an pour les fichiers hachés statiques
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Fallback Single Page Application pour React Router
app.use((req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Application GSEK en cours de démarrage ou compilation. Veuillez lancer npm run build.');
    }
  });
});

// Démarrage du serveur sur toutes les interfaces réseau (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  // Récupération des adresses IP locales de la machine
  const interfaces = os.networkInterfaces();
  const localIps = [];
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        localIps.push(config.address);
      }
    }
  }

  console.log('\n=============================================================');
  console.log('   🏫  SERVEUR CENTRAL GSEK SIDY KONATÉ - EN LIGNE');
  console.log('=============================================================');
  console.log(`   Base de données : ${DB_PATH}`);
  console.log(`   Moteur SQL      : SQLite 3 (Node.js Sync WAL Mode)`);
  console.log('-------------------------------------------------------------');
  console.log(`   Accès Local (sur cette UC)   : http://localhost:${PORT}`);
  if (localIps.length > 0) {
    localIps.forEach(ip => {
      console.log(`   Accès Réseau (Directeur/Staff): http://${ip}:${PORT}`);
    });
  }
  console.log('=============================================================\n');
});
