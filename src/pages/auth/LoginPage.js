import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { GraduationCap, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, parametres, DEFAULT_USERS } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setLoading(true);
    const res = login(email, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Identifiants invalides.');
    }
  };

  const handleQuickDemo = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
    const res = login(user.email, user.password);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-logo">
              <GraduationCap size={26} color="#f59e0b" />
            </div>
            <h1 className="login-title">GSEK Sidy Konaté</h1>
            <p className="login-sub">{parametres?.nom || "Groupe Scolaire d'Excellence"}</p>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Identifiant / Email</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ex: direction@gsek.sn"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label>Mot de passe</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer mot de passe" : "Afficher mot de passe"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
              {loading ? 'Connexion...' : (
                <>Connexion sécurisée <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Sélecteur de test rapide multi-rôles */}
          <div className="login-demo-section">
            <div className="demo-section-title">Connexion rapide par profil (Démo / Test) :</div>
            <div className="demo-chips-grid">
              {(DEFAULT_USERS || []).map(u => (
                <button
                  key={u.id}
                  type="button"
                  className="demo-chip"
                  onClick={() => handleQuickDemo(u)}
                  title={`Se connecter comme ${u.titre}`}
                >
                  <span className="demo-chip-role">{u.titre}</span>
                  <span className="demo-chip-name">{u.prenom} {u.nom}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="login-footer-text">
          Système sécurisé · Année scolaire {parametres?.anneeScolaire || '2024-2025'}
        </div>
      </div>
    </div>
  );
}
