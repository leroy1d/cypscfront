import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Headeract() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [siteTitle, setSiteTitle] = useState('YPSNC/CNJPS');

  useEffect(() => {
    loadLogo();
    loadSiteSettings();
  }, []);

  const loadLogo = async () => {
    try {
      const response = await fetch('http://192.168.179.20:5005/api/logo');
      if (response.ok) {
        const data = await response.json();
        if (!data.is_default) {
          setLogoUrl(`http://192.168.179.20:5005${data.logo_url}`);
        }
      }
    } catch (error) {
      console.error('Erreur chargement logo:', error);
    }
  };

  const loadSiteSettings = async () => {
    try {
      const response = await fetch('http://192.168.179.20:5005/api/frontend/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.site_title) {
          setSiteTitle(data.site_title);
        }
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header>
      <div className="header-container">
        {/* Logo à gauche */}
        <Link to="/home" className="logo">
          <img
            src={logoUrl || "/yps.jpg"}
            alt={`Logo ${siteTitle}`}
            className="logo-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/nypsb.png";
            }}
          /> <br />
          <span className="logo-text">
            {siteTitle}
          </span>
        </Link>

        {/* Boutons à droite */}
        <div className="header-buttons">
          <Link to="/benevole" className="donate-btn">Rejoignez le Club YPS</Link>
        </div>

        {/* Bouton menu mobile */}
        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Menu">
          <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </button>

        {/* Navigation au centre */}
        <nav className={isMenuOpen ? "active" : ""}>
          <ul>
            <li><Link to="/accueil" onClick={handleNavClick}>Accueil</Link></li>
            {/* <li><a href="#missions" onClick={handleNavClick}>Nos Missions</a></li>
                <li><a href="#actions" onClick={handleNavClick}>Nos Actions</a></li>
                <li><a href="#transparence" onClick={handleNavClick}>Transparence</a></li>
                <li><a href="#faq" onClick={handleNavClick}>FAQ</a></li>
                <li><a href="#contact" onClick={handleNavClick}>Contact</a></li> */}
            <li><Link to="/benevole" onClick={handleNavClick}>Devenir Membre/Ambassadeur</Link></li>
            <li><Link to="/actualite" onClick={handleNavClick}>Actualité</Link></li>
            <li><Link to="/gallerie" onClick={handleNavClick}>Galerie/Documents</Link></li>
          </ul>
        </nav>

        
      </div>

      <img src="/backg09.png" alt="" style={{ display: 'block', margin: '0 auto', maxWidth: '95%', height: '50px' }} />

      <style>{`
        /* Variables CSS */
        :root {
          --primary-color: #0077d4;
          --secondary-color: #e88008ff;
          --accent-color: #ea4335;
          --dark-color: #202124;
          --light-color: #f8f9fa;
          --text-color: #333;
          --text-light: #666;
          --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          --transition: all 0.3s ease;
          --blue-deep: #1a365d;
          --orange-soft: #e88008;
          --green-stable: #2e7d32;
        }

        header {
          background-color: white;
          box-shadow: var(--shadow);
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          max-width: 1700px;
          margin: 0 auto;
          position: relative;
        }

        /* Logo à gauche */
        .logo {
          display: flex;
          // align-items: center;
          gap: 90px;
          text-decoration: none;
          flex-shrink: ;
        }

        .logo-img {
          height: 90px;
          width: auto;
          object-fit: contain;
          max-width: 100%;
          gap: 90px;
        }

        .logo-text {
        display: none;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--primary-color);
          line-height: 1;
        }

        /* Navigation */
        nav {
          display: flex;
          justify-content: center;
          flex: 1;
        }

        nav ul {
          display: flex;
          list-style: none;
          gap: 25px;
          margin: 0;
          padding: 0;
        }

        nav a {
          text-decoration: none;
          color: var(--text-color);
          font-weight: 600;
          font-size: 1rem;
          transition: var(--transition);
          padding: 5px 0;
          position: relative;
          white-space: nowrap;
        }

        nav a:hover {
          color: var(--primary-color);
        }

        nav a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background-color: var(--primary-color);
          transition: var(--transition);
        }

        nav a:hover::after {
          width: 100%;
        }

        /* Boutons à droite */
        .header-buttons {
          display: flex;
          align-items: center;
          color: var(--text-color);
          gap: 50px;
          flex-shrink: 0;
        }

        .donate-btn {
          background-color: var(--blue-deep);
          color: white;
          padding: 10px 20px;
          border-radius: 30px;
          font-weight: 700;
          text-decoration: none;
          transition: var(--transition);
          display: inline-block;
          white-space: nowrap;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .donate-btn:hover {
          background-color: var(--orange-soft);
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(232, 128, 8, 0.3);
        }

        /* Menu mobile */
        .mobile-menu-btn {
          display: block;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--dark-color);
          cursor: pointer;
          z-index: 1001;
          padding: 10px;
        }

        /* Responsive */
       /* Responsive */
        @media (max-width: 1100px) {
          nav ul {
            gap: 20px;
          }
          
          .logo-text {
            font-size: 1.6rem;
          }
          
          .mobile-menu-btn {
            display: block;
            color:#1a365d;
          }

          nav a {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 950px) {
          nav ul {
            gap: 15px;
          }
          
          .mobile-menu-btn {
            display: block;
            color:#1a365d;
          }

          .logo-text {
            font-size: 1.4rem;
          }
          
          nav a {
            font-size: 0.9rem;
          }
          
          .donate-btn, .admin-btn {
            padding: 8px 15px;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 850px) {
          .header-container {
            justify-content: space-between;
          }
          
          nav {
            position: static;
            transform: none;
            left: auto;
            display: none;
          }
          
          nav.active {
            display: block;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            z-index: 1000;
          }
          
          nav ul {
            flex-direction: column;
            gap: 0;
            text-align: center;
          }
          
          nav li {
            border-bottom: 1px solid #eee;
          }
          
          nav a {
            display: block;
            padding: 15px 20px;
            font-size: 1rem;
          }
          
         .mobile-menu-btn {
            display: block;
            color:#1a365d;
          }
          
          .logo {
            flex: 1;
          }
          
          .header-buttons {
            flex-shrink: 0;
          }
        }

        @media (max-width: 768px) {
          .header-container {
            padding: 10px 15px;
          }
          
          .logo-img {
            height: 40px;
          }
          
          .logo-text {
            font-size: 1.3rem;
          }
          
          .mobile-menu-btn {
            display: block;
            color:#1a365d;
          }
          
          .donate-btn, .admin-btn {
            padding: 8px 12px;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            flex-wrap: wrap;
            padding: 8px 10px;
          }
          
          .logo {
            width: auto;
          }
          
          .logo-text {
            font-size: 1.2rem;
          }
          
         .mobile-menu-btn {
            display: block;
            color:#1a365d;
          }
          
          .header-buttons {
            width: 100%;
            justify-content: center;
            order: 3;
            margin-top: 10px;
            gap: 10px;
          }
          
          nav.active {
            order: 4;
            margin-top: 10px;
            position: relative;
            top: auto;
          }
        }

        @media (max-width: 360px) {
          .logo-text {
            display: none;
          }
          
          .header-buttons {
            flex-direction: column;
            align-items: stretch;
          }
          
         .mobile-menu-btn {
            display: block;
            color:#1a365d;
          }
            
          .donate-btn, .admin-btn {
            width: 70%;
            text-align: center;
            padding: 10px;
          }
        }

        /* Ajustement pour le logo dynamique */
        .logo-img {
          height: 50px;
          width: auto;
          object-fit: contain;
          max-width: 100px;
        }
        
        @media (max-width: 768px) {
          .logo-img {
            height: 40px;
          }
        

        }
      `}</style>
    </header>
  )
}