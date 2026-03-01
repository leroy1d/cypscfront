import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


const Footer = () => {
  const [settings, setSettings] = useState({
    siteTitle: 'CNYPSC/CNJPS',
    footerDescription: 'Association humanitaire reconnue d\'utilité publique depuis 2023. Agréée par le Comité de la Charte du don en confiance.',
    contactAddress: '12 Rue de la Solidarité, 75015 Paris',
    contactPhone: '+33 1 23 45 67 89',
    contactEmail: 'contact@solidarite-mondiale.org',
    contactHours: 'Lundi-Vendredi 9h-18h',
    facebookUrl: '#',
    twitterUrl: '#',
    instagramUrl: '#',
    linkedinUrl: '#',
    youtubeUrl: '#'
  });

  useEffect(() => {
    loadSettings();
  }, []);




   const [logoUrl, setLogoUrl] = useState('');
  
    useEffect(() => {
      loadLogo();
     
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
  // Modifier la fonction loadSettings pour utiliser les données correctement

const loadSettings = async () => {
  try {
    const response = await fetch('http://192.168.179.20:5005/api/frontend/settings');
    if (response.ok) {
      const data = await response.json();
      
      
      // Utiliser les données telles quelles (le backend transforme déjà)
      setSettings({
        siteTitle: data.site_title || 'CNYPSC/CNJPS',
        siteSlogan: data.site_slogan || '',
        footerDescription: data.footer_description || 'Association humanitaire reconnue d\'utilité publique depuis 2023.',
        contactAddress: data.contact_address || '12 Rue de la Solidarité, 75015 Paris',
        contactPhone: data.contact_phone || '+33 1 23 45 67 89',
        contactEmail: data.contact_email || 'contact@solidarite-mondiale.org',
        contactHours: data.contact_hours || 'Lundi-Vendredi 9h-18h',
        facebookUrl: data.facebook_url || '#',
        twitterUrl: data.twitter_url || '#',
        instagramUrl: data.instagram_url || '#',
        linkedinUrl: data.linkedin_url || '#',
        youtubeUrl: data.youtube_url || '#'
      });
    }
  } catch (error) {
    console.error('Erreur chargement paramètres footer:', error);
  }
};
  const footerLinks = {
    quickLinks: [
      { text: 'FAQ', href: '#faq' },
      { text: 'Nos missions', href: '#missions' },
      { text: 'Nos actions', href: '#actions' },
      { text: 'Transparence', href: '#transparence' },
      { text: 'Nous contacter', href: '#contact' }
    ],
    resources: [
      { text: 'Rapports annuels', href: '#transparence' },
      { text: 'Comptes vérifiés', href: '#transparence' },
      { text: 'Regoindre le Club YPS/JPS', href: '#' },
      { text: 'Partenariats entreprises', href: '#' },
      { text: 'Presse', href: '#' }
    ],
    contact: [
      { icon: 'fas fa-map-marker-alt', text: settings.contactAddress },
      { icon: 'fas fa-phone', text: settings.contactPhone },
      { icon: 'fas fa-envelope', text: settings.contactEmail },
      { icon: 'fas fa-clock', text: settings.contactHours }
    ]
  };

  const socialIcons = [
    { icon: 'fab fa-facebook-f', href: settings.facebookUrl },
    { icon: 'fab fa-twitter', href: settings.twitterUrl },
    { icon: 'fab fa-instagram', href: settings.instagramUrl },
    { icon: 'fab fa-linkedin-in', href: settings.linkedinUrl },
    { icon: 'fab fa-youtube', href: settings.youtubeUrl }
  ];

  return (
    <footer id="contact">
     
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
          
            <h3>{settings.siteTitle}</h3> {/* Changé de data.siteTitle à settings.siteTitle */}
            <p>{settings.footerDescription}</p>
            <div className="social-icons">
              {socialIcons.map((social, index) => (
                <a key={index} href={social.href} target="_blank" rel="noopener noreferrer">
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-column">
            <h3>Liens rapides</h3>
            <ul className="footer-links">
              {footerLinks.quickLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href}>{link.text}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h3>Ressources</h3>
            <ul className="footer-links">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a href={link.href}>{link.text}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h3>Contact</h3>
            <ul className="footer-links">
              {footerLinks.contact.map((item, index) => (
                <li key={index}>
                  <i className={item.icon}></i> {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} {settings.siteTitle}. Tous droits réservés. | Powered by Opened Digital | CMR: F289919105716J</p>
          <p style={{ marginLeft: '30px' }}>
            <a href="#" style={{ color: '#aaa', marginRight: '15px' }}>Mentions légales</a>
            <a href="#" style={{ color: '#aaa', marginRight: '15px' }}>Politique de confidentialité</a>
            <a href="#" style={{ color: '#aaa' }}>Cookies</a>
          </p>
        </div>
      </div>

      <style >{`
        footer {
          background-color: var(--blue-deep);
          color: white;
          padding: 70px 0 30px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          margin-bottom: 50px;
        }

        .footer-column h3 {
          font-size: 1.3rem;
          margin-bottom: 25px;
          color: white;
          position: relative;
          padding-bottom: 10px;
        }

        .footer-column h3::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: var(--primary-color);
        }

        .footer-links {
          list-style: none;
        }

        .logo-img {
          width: 150px;
          height: auto;
          background-color: white;
          padding: 10px;
          border-radius: 5px; 
        }

        .logo-img-footer {
          width: 150px;
          height: auto;
          margin-left:330px;
          background-color: white;
          padding: 1px;
          border-radius: 5px; 
        }

        .footer-links li {
          margin-bottom: 12px;
          display: flex;
          align-items: flex-start;
        }

        .footer-links a {
          color: #ccc;
          text-decoration: none;
          transition: var(--transition);
        }

        .footer-links a:hover {
          color: white;
          padding-left: 5px;
        }

        .footer-links i {
          margin-right: 10px;
          color: var(--primary-color);
          width: 20px;
        }

        .social-icons {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .social-icons a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: white;
          text-decoration: none;
          transition: var(--transition);
        }

        .social-icons a:hover {
          background-color: var(--primary-color);
          transform: translateY(-5px);
        }

        .copyright {
          display:flex;
          justify-content:center;
          align-items:center;
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #aaa;
          font-size: 0.9rem;
        }
      `}</style>
    </footer>
  );
};

export default Footer;