// src/components/Causes.jsx (version frontend pour visiteurs)
import React, { useState, useEffect } from 'react';
import {
  School,
  HealthAndSafety,
  WaterDrop,
  EmojiEvents,
  Groups,
  Close,
  CalendarToday,
  Assignment,
  CheckCircle,
  Euro
} from '@mui/icons-material';
// import './Causes.css';

const Causes = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCause, setSelectedCause] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  


  useEffect(() => {
    fetchCauses();
  }, []);

  const fetchCauses = async () => {
    try {
      const response = await fetch(`https://ypsbackend.vercel.app/api/frontend/causes?limit=8`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des causes');
      }
      const data = await response.json();
      setCauses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Icônes selon le type de cause
  const getIconByCause = (causeName) => {
    const name = causeName.toLowerCase();
    if (name.includes('éducation') || name.includes('education')) return <School />;
    if (name.includes('santé') || name.includes('sante')) return <HealthAndSafety />;
    if (name.includes('eau')) return <WaterDrop />;
    if (name.includes('urgence')) return <EmojiEvents />;
    return <Groups />;
  };

  // Formatage de la description
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Gestion du clic sur une cause
  const handleCauseClick = (cause) => {
    setSelectedCause(cause);
    setIsModalOpen(true);
    // Empêche le défilement de la page lorsque le modal est ouvert
    document.body.style.overflow = 'hidden';
  };

  // Fermer le modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCause(null);
    document.body.style.overflow = 'auto';
  };

  if (loading) {
    return (
      <div className="causes-container">
        <div className="causes-loading-container">
          <div className="causes-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="causes-container">
        <div className="causes-error-container">
          <h3 style={{ margin: 0 }}>Erreur</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="causes-container" id="missions">
      {/* Modal pour afficher les détails de la cause */}
      {isModalOpen && selectedCause && (
        <div className="causes-modal-overlay" onClick={closeModal}>
          <div className="causes-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="causes-modal-close-button"
              onClick={closeModal}
              aria-label="Fermer"
            >
              <Close style={{ fontSize: '2rem' }} />
            </button>

            {/* En-tête du modal avec image */}
            <div className="causes-modal-header">
              {selectedCause.icone ? (
                <img
                  src={selectedCause.icone}
                  alt={selectedCause.nom}
                  className="causes-modal-image"
                />
              ) : (
                <div className="cause-icon-container">
                  {getIconByCause(selectedCause.nom)}
                </div>
              )}

              {/* Badge de statut */}
              <span className={`cause-status-badge ${selectedCause.statut === 'actif' ? 'cause-status-active' : 'cause-status-inactive'
                }`}>
                {selectedCause.statut === 'actif' ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Corps du modal */}
            <div className="causes-modal-body">
              <p className="causes-modal-title">
                {selectedCause.nom}
              </p>

              <p className="causes-modal-description">
                {selectedCause.description}
              </p>

              {/* Grille de statistiques */}
              <div className="causes-modal-stats-grid">
                <div className="causes-modal-stat-card">
                  <Assignment className="causes-modal-stat-icon" />
                  <div className="causes-modal-stat-content">
                    <div className="causes-modal-stat-number">
                      {selectedCause.nb_projets || 0}
                    </div>
                    <div className="causes-modal-stat-label">
                      Projets en cours
                    </div>
                  </div>
                </div>

                <div className="causes-modal-stat-card">
                  <CheckCircle style={{
                    fontSize: '2rem',
                    color: '#4caf50'
                  }} />
                  <div className="causes-modal-stat-content">
                    <div className="causes-modal-stat-number">
                      {selectedCause.nb_projets_termines || 0}
                    </div>
                    <div className="causes-modal-stat-label">
                      Projets réalisés
                    </div>
                  </div>
                </div>

                <div className="causes-modal-stat-card">
                  <Groups style={{
                    fontSize: '2rem',
                    color: '#ff9800'
                  }} />
                  <div className="causes-modal-stat-content">
                    <div className="causes-modal-stat-number">
                      {selectedCause.nb_benevoles || 0}
                    </div>
                    <div className="causes-modal-stat-label">
                      Bénévoles engagés
                    </div>
                  </div>
                </div>

                <div className="causes-modal-stat-card">
                  <Euro style={{
                    fontSize: '2rem',
                    color: '#9c27b0'
                  }} />
                  <div className="causes-modal-stat-content">
                    <div className="causes-modal-stat-number">
                      {selectedCause.fonds_collectes ?
                        `${selectedCause.fonds_collectes.toLocaleString('fr-FR')} €` :
                        '0 €'}
                    </div>
                    <div className="causes-modal-stat-label">
                      Fonds collectés
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="causes-modal-meta-info">
                <div className="causes-modal-meta-item">
                  <CalendarToday fontSize="small" />
                  <span>Créée le: {new Date(selectedCause.created_at).toLocaleDateString('fr-FR')}</span>
                </div>

                {selectedCause.updated_at && (
                  <div className="causes-modal-meta-item">
                    <CalendarToday fontSize="small" />
                    <span>Mise à jour: {new Date(selectedCause.updated_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* En-tête */}
        <div className="causes-header">
          <h3 className="causes-title">
     
            Les 5 Signes Vitaux du PAN-JPS: Fondements de la Commission Nationale Jeunesse Paix et Sécurité.
          </h3>
          <img src="/backg09.png" alt="" style={{ display: 'block', margin: '0 auto', maxWidth: '100%', marginTop: '0px', height: '50px' }} />
          <p className="causes-subtitle">
            Découvrez les missions pour lesquelles nous nous engageons chaque jour
            pour construire un Cameroun meilleur. Cliquez sur un Signe vital pour voir tous les détails.
          </p>
        </div>

        {/* Grille des causes */}
        {causes.length === 0 ? (
          <div className="causes-alert">
            Aucun Signe vital disponible pour le moment.
          </div>
        ) : (
          <div className="causes-grid">
            {causes.map((cause) => (
              <div
                key={cause.id}
                className="cause-card"
                onClick={() => handleCauseClick(cause)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCauseClick(cause);
                  }
                }}
                aria-label={`Voir les détails du signe vital: ${cause.nom}`}
              >
                {/* En-tête de la carte */}
                <div className="cause-card-header">
                  {cause.icone ? (
                    <img
                      src={cause.icone}
                      alt={cause.nom}
                      className="cause-card-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="cause-icon-container">
                      {getIconByCause(cause.nom)}
                    </div>
                  )}

                  {/* Badge de statut */}
                  <span className={`cause-status-badge ${cause.statut === 'actif' ? 'cause-status-active' : 'cause-status-inactive'
                    }`}>
                    {cause.statut === 'actif' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Contenu de la carte */}
                <div className="cause-card-content">
                  <h3 className="cause-card-title">
                    {cause.nom}
                  </h3>

                  <p className="cause-card-description">
                    {truncateDescription(cause.description, 90)}
                  </p>

                  {/* Statistiques */}
                  <div className="cause-stats-container">
                    <div className="cause-stat-box">
                      <div className="cause-stat-number">
                        {cause.nb_projets || 0}
                      </div>
                      <div className="cause-stat-label">
                        Projets
                      </div>
                    </div>

                    <div className="cause-stat-box">
                      <div className="cause-stat-number cause-stat-number-completed">
                        {cause.nb_projets_termines || 0}
                      </div>
                      <div className="cause-stat-label">
                        Réalisés
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="cause-date">
                    Créé le: {new Date(cause.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section d'information */}
        <div className="causes-info-section">
          <h2 className="causes-info-title">
            🌍 Chaque Signe Vital compte et implemente les 05 pilers d'actions de Paix et de Sécurité:
          </h2>
          <p className="causes-info-text">
            <li>Participation - Protection - Prevention - Partenariat - Départ et Réintegration</li> <br />
            Votre soutien nous permet de mener à bien ces missions de Paix.
            Ensemble, nous pouvons faire la différence pour notre Afrique en Miniature.
            Cliquez sur un Signe vital pour en savoir plus et découvrir comment vous pouvez aider.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Causes;