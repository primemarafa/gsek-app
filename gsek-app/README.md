# 🏫 GSEK — Système de Gestion Scolaire
### Groupe Scolaire d'Excellence Sidy Konaté

Application web complète de gestion scolaire développée en React.

---

## 📦 Modules disponibles

| Module | Fonctionnalités |
|--------|----------------|
| 🎒 **Élèves** | Inscription, matricule automatique, fiche imprimable |
| 📋 **Bulletins** | Saisie des notes, calcul automatique des moyennes, impression |
| 🧾 **Paiements** | Reçus d'inscription et mensualités, impression officielle |
| 💰 **Comptabilité** | Recettes, dépenses, graphiques, solde général |
| 👨‍🏫 **Personnel** | Gestion des enseignants et staff, salaires |
| ⚙️ **Paramètres** | Configuration de l'école, tarification |

---

## 🚀 Installation et démarrage

### Prérequis
- Node.js 16+ 
- npm ou yarn

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/gsek-app.git
cd gsek-app

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Build de production

```bash
npm run build
```

---

## 🗂️ Structure du projet

```
src/
├── context/
│   └── AppContext.js        # État global + persistance localStorage
├── components/
│   └── layout/
│       ├── Layout.js         # Sidebar + Header
│       └── Layout.css
├── pages/
│   ├── Dashboard.js          # Tableau de bord
│   ├── eleves/
│   │   ├── ElevesPage.js     # Liste + inscription élèves
│   │   └── EleveDetail.js    # Fiche élève imprimable
│   ├── bulletin/
│   │   ├── BulletinPage.js   # Gestion des bulletins
│   │   └── BulletinDetail.js # Bulletin imprimable avec logo
│   ├── paiement/
│   │   ├── PaiementPage.js   # Liste des paiements
│   │   └── PaiementDetail.js # Reçu imprimable avec logo
│   ├── personnel/
│   │   └── PersonnelPage.js  # Gestion du personnel
│   ├── comptabilite/
│   │   └── ComptabilitePage.js
│   └── parametres/
│       └── ParametresPage.js
└── App.css                   # Styles globaux
```

---

## ✨ Fonctionnalités clés

- **Matricule automatique** : Format `GSEK-ANNÉE-XXXX` pour chaque élève
- **Logo et nom de l'école** : Présent sur tous les documents imprimables (bulletins, reçus, fiches)
- **Impression** : Chaque document est optimisé pour l'impression papier A4
- **Persistance** : Données sauvegardées localement dans le navigateur (localStorage)
- **Calculs automatiques** : Moyennes pondérées, mentions, solde comptable

---

## 🖨️ Documents imprimables

1. **Fiche élève** — Informations complètes avec matricule
2. **Bulletin de notes** — Notes par matière, moyenne générale, mention, signatures
3. **Reçu de paiement** — Reçu officiel avec cachet, pour inscription ou mensualité

Tous les documents affichent :
- Le logo et le nom de l'école **GROUPE SCOLAIRE D'EXCELLENCE SIDY KONATÉ**
- La devise : *Excellence · Discipline · Réussite*
- Les informations de contact

---

## 🛠️ Technologies utilisées

- **React 18** — Interface utilisateur
- **React Router v6** — Navigation
- **Recharts** — Graphiques et visualisations
- **react-to-print** — Impression des documents
- **UUID** — Génération des identifiants uniques
- **LocalStorage** — Persistance des données

---

## 📝 Licence

Développé pour le Groupe Scolaire d'Excellence Sidy Konaté, Dakar, Sénégal.
