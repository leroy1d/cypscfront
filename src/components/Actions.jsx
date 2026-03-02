import React, { useState, useEffect } from 'react';
import { apiService } from '../../../backend/api';

const Actions = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const data = await apiService.getActions();
        setActions(data);
      } catch (error) {
        console.error('Erreur lors du chargement des actions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, []);

  const methodologies = [
    {
      icon: 'fas fa-users',
      title: 'Participation communautaire',
      description: 'Nous impliquons les communautés locales dans toutes les phases de nos projets'
    },
    {
      icon: 'fas fa-handshake',
      title: 'Partenariats locaux',
      description: 'Nous travaillons avec des organisations locales pour une action plus efficace'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Suivi et évaluation',
      description: 'Nous mesurons systématiquement l\'impact de nos interventions'
    },
    {
      icon: 'fas fa-recycle',
      title: 'Développement durable',
      description: 'Nos projets sont conçus pour avoir un impact à long terme'
    }
  ];

  if (loading) {
    return (
      <section className="section-padding actions-section" id="actions">
        <div className="container">
          <div className="section-title">
            <h2>Nos Actions sur le Terrain</h2>
            <p>Chargement des données...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding actions-section" id="actions">
      <div className="container">
        <div className="section-title">
          <h2>Nos Actions sur le Terrain</h2>
          <p>Découvrez nos interventions concrètes à travers le monde et notre méthodologie d'action humanitaire.</p>
        </div>

        <div className="actions-timeline">
          {actions.map((action, index) => (
            <div className="timeline-item" key={action.id}>
              <div className="timeline-icon">
                <i className={getActionIcon(action.type)}></i>
              </div>
              <div className="timeline-content">
                <span className="timeline-date">
                  {formatDate(action.date_debut)} - {action.date_fin ? formatDate(action.date_fin) : 'En cours'}
                </span>
                <h3>{action.titre}</h3>
                <p>{action.description}</p>
                {action.pays && (
                  <p><strong>Lieu :</strong> {action.pays} {action.localisation ? `- ${action.localisation}` : ''}</p>
                )}
                <p><strong>Statut :</strong> {getStatusText(action.statut)}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h3>Notre méthodologie d'intervention</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
            {methodologies.map((method, index) => (
              <div key={index} style={{ backgroundColor: '#f0f7ff', padding: '20px', borderRadius: '10px' }}>
                <i className={method.icon} style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '15px' }}></i>
                <h4 style={{ marginBottom: '10px' }}>{method.title}</h4>
                <p style={{ fontSize: '0.9rem' }}>{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .actions-timeline {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
        }

        .actions-timeline::before {
          content: '';
          position: absolute;
          left: 30px;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: #dbb200ff;
          opacity: 0.3;
        }

        .timeline-item {
          display: flex;
          margin-bottom: 40px;
          position: relative;
        }

        .timeline-icon {
          width: 60px;
          height: 60px;
          background-color: #056219ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          margin-right: 30px;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .timeline-content {
          background-color: var(--light-color);
          padding: 25px;
          border-radius: 10px;
          box-shadow: var(--shadow);
          flex: 1;
        }

        .timeline-content h3 {
          color: var(--dark-color);
          margin-bottom: 10px;
          font-size: 1.3rem;
        }

        .timeline-date {
          display: inline-block;
          background-color: var(--secondary-color);
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.9rem;
          margin-bottom: 10px;
        }

        @media (max-width: 992px) {
          .actions-timeline::before {
            left: 20px;
          }

          .timeline-icon {
            width: 50px;
            height: 50px;
            font-size: 1.3rem;
            margin-right: 20px;
          }
        }

        @media (max-width: 768px) {
          .actions-timeline::before {
            left: 15px;
          }

          .timeline-item {
            flex-direction: column;
          }

          .timeline-icon {
            margin-bottom: 15px;
          }
        }
      `}</style>
    </section>
  );
};

// Fonctions utilitaires
function getActionIcon(type) {
  const icons = {
    'urgence': 'fas fa-first-aid',
    'developpement': 'fas fa-hands-helping',
    'education': 'fas fa-graduation-cap',
    'sante': 'fas fa-medkit',
    'eau': 'fas fa-tint',
    'alimentaire': 'fas fa-utensils'
  };
  return icons[type] || 'fas fa-hands-helping';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function getStatusText(status) {
  const statusMap = {
    'planifie': 'Planifié',
    'en_cours': 'En cours',
    'termine': 'Terminé',
    'suspendu': 'Suspendu',
    'annule': 'Annulé'
  };
  return statusMap[status] || status;
}

export default Actions;