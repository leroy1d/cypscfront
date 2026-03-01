import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './components/dashboard';
import GestionContenu from './components/gestiondecontenu';
import GestionUtilisateurs from './components/gestiondesutilisateurs';
import GestionDons from './components/gestiondedons';
import { FiHome, FiUsers, FiDollarSign, FiImage, FiFileText, FiLogOut, FiFlag, FiMenu, FiX, FiSettings } from 'react-icons/fi';
import { FaHandsHelping } from 'react-icons/fa';
import Home from './components/home';
import Header from './components/Header';
import BenevolePage from './components/benevole';
import Article from './components/actualite';
import Dons from './components/Donation';
import Gallery from './components/gallerie';
// import Header from './components/Headeract';
import MediaManager from './components/MediaManager';
import CausesManager from './components/CausesManager';
import Settings from './components/Settings';
import PlanActionNational from './components/PlanActionNational';
// import StatisticsForm from './components/statistique';

// Configuration axios
axios.defaults.baseURL = 'http://192.168.179.20:5005';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Route pour la page d'accueil publique */}
        <Route path="/" element={
          <>
            <Header />
            <Home />
          </>
        } />

        {/* Route pour la page bénévole */}
        <Route path="/benevole" element={
          <>
           <Header />
            <BenevolePage />
          </>
        } />

        {/* Routes pour l'administration - nécessite authentification */}
        <Route
          path="/admin/*"
          element={
            isAuthenticated ? (
              <AdminLayout user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />

        {/* Route pour la page de login de l'admin */}
        <Route
          path="/admin/login"
          element={
            isAuthenticated ? (
              <Navigate to="/admin" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Route pour actualite */}
        <Route path="/actualite" element={
          <>
            <Header />
            <Article />
          </>
        } />

        {/* Route pour dons */}
        <Route path="/donation" element={
          <>
            <Dons />
          </>
        } />

        {/* Route pour dons */}
        <Route path="/gallerie" element={
          <>
            <Header />
            <Gallery />
          </>
        } />

        {/* Route pour dons */}
        <Route path="/rapport" element={
          <>
            <Header />
            <PlanActionNational />
          </>
        } />



        {/* Route pour dons */}
        <Route path="/medias" element={
          <>
            <MediaManager />
          </>
        } />

        {/* Route pour dons */}
        <Route path="/settings" element={
          <>
            <Settings />
          </>
        } />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Composant pour le layout de l'administration
function AdminLayout({ user, onLogout }) {
  return (
    <div className="admin-container">
      <Sidebar user={user} onLogout={onLogout} />
      <MainContent>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contenu" element={<GestionContenu />} />
          <Route path="/utilisateurs" element={<GestionUtilisateurs />} />
          <Route path="/dons" element={<GestionDons />} />
          <Route path="/medias" element={<MediaManager />} />
          <Route path="/causes" element={<CausesManager />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainContent>
    </div>
  );
}

function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/admin', icon: <FiHome />, label: 'Tableau de bord' },
    { path: '/admin/contenu', icon: <FiFileText />, label: 'Gestion de contenu' },
    { path: '/admin/utilisateurs', icon: <FiUsers />, label: 'Gestion des utilisateurs' },
    { path: '/admin/dons', icon: <FiDollarSign />, label: 'Gestion des dons' },
    { path: '/admin/medias', icon: <FiImage />, label: 'Gestion des medias' },
    { path: '/admin/causes', icon: <FiFlag />, label: 'Signes vitaux' },
    { path: '/admin/settings', icon: <FiSettings />, label: 'Paramètres du site' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Bouton menu hamburger pour mobile */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Overlay pour fermer le menu sur mobile */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu} />
      )}

      <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/admin" style={{ color: 'white' }} onClick={closeMobileMenu}>
            <img src="yps.jpg" alt="Logo YPS" className='logo' />
            <span style={{ marginLeft: '10px', fontSize: '1.2rem' }}></span>
          </Link>
          <button className="close-mobile-menu" onClick={closeMobileMenu}>
            <FiX />
          </button>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              <Link to={item.path}>
                <span className="icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="user-info">
            <div>
              <strong>{user?.nom}</strong>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{user?.email}</div>
            </div>
            <button onClick={onLogout} className="logout-btn">
              <FiLogOut />
            </button>
          </div>

          {/* Lien pour retourner au site public */}
          <div style={{ marginTop: '15px' }}>
            <Link
              to="/"
              className="btn btn-secondary"
              style={{
                width: '100%',
                display: 'block',
                textAlign: 'center',
                padding: '8px',
                fontSize: '0.9rem'
              }}
              onClick={closeMobileMenu}
            >
              Retour au site public
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function MainContent({ children }) {
  return <div className="main-content">{children}</div>;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { email, password });
      onLogin(response.data.token, response.data.user);
    } catch (err) {
      console.error('Erreur de connexion:', err);

      if (err.code === 'ERR_NETWORK') {
        setError('Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré.');
      } else if (err.response?.status === 401) {
        setError('Email ou mot de passe incorrect');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Connexion Admin</h2>
        <FaHandsHelping style={{ fontSize: '50px', color: '#3498db', display: 'block', margin: '0 auto 20px' }} />

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Se connecter
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '0.9rem', textAlign: 'center', color: '#666' }}>
          <p>Identifiants par défaut : admin@association.org / admin123</p>
        </div>

        {/* Lien pour retourner au site public */}
        <div style={{ marginTop: '20px' }}>
          <Link
            to="/"
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Retour au site public
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;