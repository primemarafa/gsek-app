// Service Client API pour GSEK (Serveur Local & Synchronisation)

const getBaseUrl = () => {
  // Si exécuté dans le même port ou configuré via variable d'environnement
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // En développement (React sur 3000, Express sur 5000)
  if (window.location.port === '3000') {
    return `http://${window.location.hostname}:5000`;
  }
  // En production (Express sert directement le frontend sur le même port)
  return window.location.origin;
};

export const API_BASE_URL = getBaseUrl();

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Erreur HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[GSEK API] Échec requête ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Statut
  checkStatus: () => request('/status'),

  // Chargement global au démarrage
  getBootstrap: () => request('/bootstrap'),

  // Utilisateurs
  getUsers: () => request('/auth/users'),
  saveUser: (user, isNew = false) =>
    request(isNew ? '/auth/users' : `/auth/users/${user.id}`, {
      method: isNew ? 'POST' : 'PUT',
      body: JSON.stringify(user)
    }),
  deleteUser: (id) => request(`/auth/users/${id}`, { method: 'DELETE' }),

  // Élèves
  getEleves: () => request('/eleves'),
  saveEleve: (eleve, isNew = false) =>
    request(isNew ? '/eleves' : `/eleves/${eleve.id}`, {
      method: isNew ? 'POST' : 'PUT',
      body: JSON.stringify(eleve)
    }),
  deleteEleve: (id) => request(`/eleves/${id}`, { method: 'DELETE' }),

  // Personnel
  getPersonnel: () => request('/personnel'),
  savePersonnel: (person, isNew = false) =>
    request(isNew ? '/personnel' : `/personnel/${person.id}`, {
      method: isNew ? 'POST' : 'PUT',
      body: JSON.stringify(person)
    }),
  deletePersonnel: (id) => request(`/personnel/${id}`, { method: 'DELETE' }),

  // Paiements
  getPaiements: () => request('/paiements'),
  savePaiement: (paiement) =>
    request('/paiements', {
      method: 'POST',
      body: JSON.stringify(paiement)
    }),
  deletePaiement: (id) => request(`/paiements/${id}`, { method: 'DELETE' }),

  // Bulletins
  getBulletins: () => request('/bulletins'),
  saveBulletin: (bulletin) =>
    request('/bulletins', {
      method: 'POST',
      body: JSON.stringify(bulletin)
    }),
  deleteBulletin: (id) => request(`/bulletins/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: () => request('/transactions'),
  saveTransaction: (trx) =>
    request('/transactions', {
      method: 'POST',
      body: JSON.stringify(trx)
    }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),

  // Absences
  getAbsences: () => request('/absences'),
  saveAbsence: (absence) =>
    request('/absences', {
      method: 'POST',
      body: JSON.stringify(absence)
    }),
  deleteAbsence: (id) => request(`/absences/${id}`, { method: 'DELETE' }),

  // Paramètres
  getParametres: () => request('/parametres'),
  saveParametres: (params) =>
    request('/parametres', {
      method: 'PUT',
      body: JSON.stringify(params)
    }),

  // Sauvegardes
  createBackup: () => request('/backup', { method: 'POST' }),
  getBackups: () => request('/backups')
};
