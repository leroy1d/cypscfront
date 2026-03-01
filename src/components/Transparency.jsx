import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../backend/api';

const Transparency = () => {
  const [transparencyData, setTransparencyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const canvasRef = useRef(null);
  const tooltipRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const fetchTransparencyData = async () => {
      try {
        const data = await apiService.getTransparencyData();
        setTransparencyData(data);
      } catch (error) {
        console.error('Erreur lors du chargement des données de transparence:', error);
        // Données par défaut
        setTransparencyData([
          { type: 'utilisation_fonds', label: 'Missions de Paix', valeur: '92%' },
          { type: 'utilisation_fonds', label: 'Frais de fonctionnement', valeur: '5%' },
          { type: 'utilisation_fonds', label: 'Collecte de fonds', valeur: '3%' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransparencyData();
  }, []);

  // Préparer les données pour le diagramme circulaire
  const prepareChartData = () => {
    return transparencyData.map(item => {
      const value = parseFloat(item.valeur.replace('%', '')) || 0;
      
      // Couleurs prédéfinies
      const colorMap = {
        'Missions de Paix': '#34a853',
        'Frais de fonctionnement': '#e60413ff',
        'Collecte de fonds': '#dbcd07ff',
        'default': '#34a853'
      };

      return {
        label: item.label,
        value: value,
        percentage: item.valeur,
        color: colorMap[item.label] || colorMap.default,
        description: getDescription(item.label)
      };
    });
  };

  const getDescription = (label) => {
    switch(label) {
      case 'Missions de construction et de consolidation de la Paix':
        return 'Aide d\'urgence, atelier, éducation, suivi,...';
      case 'Frais de fonctionnement':
        return 'Salaires équipe siège, locaux, administration';
      case 'Collecte de fonds':
        return 'Campagnes de communication, prospection';
      default:
        return 'Autres dépenses';
    }
  };

  // Dessiner le diagramme circulaire
  useEffect(() => {
    if (loading || !canvasRef.current || transparencyData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const chartData = prepareChartData();
    
    // Dimensions
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    const holeRadius = radius * 0.5; // Pour un diagramme en donut

    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);

    // Variables d'animation
    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;
    let animationProgress = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      let currentAngle = -Math.PI / 2; // Commencer en haut
      const animatedTotal = totalValue * animationProgress;

      // Dessiner chaque segment
      chartData.forEach((segment, index) => {
        const animatedValue = segment.value * animationProgress;
        const segmentAngle = (animatedValue / totalValue) * 2 * Math.PI;
        
        // Dessiner le segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segmentAngle);
        ctx.closePath();
        
        // Couleur du segment
        ctx.fillStyle = segment.color;
        ctx.fill();

        // Bordure
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Trou central pour l'effet donut
        ctx.beginPath();
        ctx.moveTo(centerX + holeRadius * Math.cos(currentAngle), centerY + holeRadius * Math.sin(currentAngle));
        ctx.arc(centerX, centerY, holeRadius, currentAngle, currentAngle + segmentAngle);
        ctx.closePath();
        
        // Couper le centre
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fill();
        ctx.restore();

        currentAngle += segmentAngle;
      });

      // Texte au centre
      ctx.fillStyle = '#333';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('100%', centerX, centerY);
      
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
      ctx.fillText('Total', centerX, centerY + 25);

      // Animation progress
      animationProgress += 0.02;
      if (animationProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation terminée
        animationProgress = 1;
        
        // Redessiner une dernière fois
        ctx.clearRect(0, 0, width, height);
        redrawChart();
      }
    };

    // Fonction pour redessiner sans animation
    const redrawChart = () => {
      ctx.clearRect(0, 0, width, height);
      
      let currentAngle = -Math.PI / 2;
      
      chartData.forEach((segment, index) => {
        const segmentAngle = (segment.value / totalValue) * 2 * Math.PI;
        
        // Dessiner le segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segmentAngle);
        ctx.closePath();
        
        // Couleur du segment (plus foncée si survolé/sélectionné)
        let color = segment.color;
        if (hoveredSegment === index || selectedSegment === index) {
          // Assombrir la couleur
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          const darkened = `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`;
          color = darkened;
        }
        
        ctx.fillStyle = color;
        ctx.fill();

        // Bordure
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Trou central
        ctx.beginPath();
        ctx.moveTo(centerX + holeRadius * Math.cos(currentAngle), centerY + holeRadius * Math.sin(currentAngle));
        ctx.arc(centerX, centerY, holeRadius, currentAngle, currentAngle + segmentAngle);
        ctx.closePath();
        
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fill();
        ctx.restore();

        currentAngle += segmentAngle;
      });

      // Texte au centre
      ctx.fillStyle = '#333';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('100%', centerX, centerY);
      
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
      ctx.fillText('Total', centerX, centerY + 25);
    };

    // Démarrer l'animation
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [loading, transparencyData, hoveredSegment, selectedSegment]);

  // Gérer le survol sur le canvas
  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.4;

    // Calculer la distance du centre
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Vérifier si la souris est dans le diagramme
    if (distance <= radius) {
      // Calculer l'angle
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += 2 * Math.PI;
      angle += Math.PI / 2; // Ajuster pour commencer en haut
      if (angle > 2 * Math.PI) angle -= 2 * Math.PI;

      // Trouver le segment survolé
      const chartData = prepareChartData();
      const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
      
      let currentAngle = 0;
      let hoveredIndex = -1;

      for (let i = 0; i < chartData.length; i++) {
        const segmentAngle = (chartData[i].value / totalValue) * 2 * Math.PI;
        if (angle >= currentAngle && angle < currentAngle + segmentAngle) {
          hoveredIndex = i;
          break;
        }
        currentAngle += segmentAngle;
      }

      setHoveredSegment(hoveredIndex);

      // Afficher le tooltip
      if (hoveredIndex !== -1 && tooltipRef.current) {
        const segment = chartData[hoveredIndex];
        tooltipRef.current.style.display = 'block';
        tooltipRef.current.style.left = `${e.clientX + 10}px`;
        tooltipRef.current.style.top = `${e.clientY + 10}px`;
        tooltipRef.current.innerHTML = `
          <strong>${segment.label}</strong><br>
          <span style="color: ${segment.color}; font-weight: bold;">${segment.percentage}</span><br>
          <small>${segment.description}</small>
        `;
      }
    } else {
      setHoveredSegment(null);
      if (tooltipRef.current) {
        tooltipRef.current.style.display = 'none';
      }
    }
  };

  const handleCanvasClick = (e) => {
    if (hoveredSegment !== null) {
      setSelectedSegment(hoveredSegment === selectedSegment ? null : hoveredSegment);
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredSegment(null);
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  };

  const transparencyCards = [
    {
      icon: 'fas fa-chart-pie',
      title: 'Utilisation des fonds',
      description: 'Nous garantissons une transparence totale sur l\'utilisation de chaque euro collecté.',
      value: '92%',
      subtext: 'aux projets de terrain'
    },
    {
      icon: 'fas fa-file-invoice-dollar',
      title: 'Comptes certifiés',
      description: 'Nos comptes sont audités chaque année et publiés intégralement.',
      link: { text: 'Télécharger le rapport', icon: 'fas fa-download' }
    },
    {
      icon: 'fas fa-award',
      title: 'Labels de confiance',
      description: 'Nous respectons les normes les plus exigeantes en matière de transparence.',
      badges: ['Don en Confiance', 'Utilité Publique']
    }
  ];

  const chartData = prepareChartData();

  const commitments = [
    { 
      icon: 'fas fa-file-alt',
      title: 'Rapports annuels complets', 
      description: 'Publication détaillée de nos comptes et activités' 
    },
    { 
      icon: 'fas fa-balance-scale',
      title: 'Comité d\'éthique indépendant', 
      description: 'Surveillance de nos pratiques et gouvernance' 
    },
    { 
      icon: 'fas fa-database',
      title: 'Données financières ouvertes', 
      description: 'Accès libre à tous nos chiffres clés' 
    }
  ];

  if (loading) {
    return (
      <section className="section-padding transparency-section" id="transparence">
        <div className="container">
          <div className="section-title">
            <h2>Transparence et Gouvernance</h2>
            <p>Chargement des données...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding transparency-section" id="transparence">
      <div className="container">
        <div className="section-title">
          <h2>Transparence et Gouvernance</h2>
          <p>Nous croyons en une gestion rigoureuse et transparente de chaque euro collecté. Découvrez comment sont utilisés vos dons.</p>
        </div>

        {/* <div className="transparency-grid">
          {transparencyCards.map((card, index) => (
            <div className="transparency-card" key={index}>
              <i className={`${card.icon} transparency-icon`}></i>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              
              {card.value && (
                <>
                  <div className="transparency-value">
                    {card.value}
                  </div>
                  <p className="transparency-subtext">{card.subtext}</p>
                </>
              )}
              
              {card.link && (
                <div className="transparency-link">
                  <a href="/documents/rapport-financier.pdf" target="_blank" rel="noopener noreferrer">
                    <i className={card.link.icon}></i> {card.link.text}
                  </a>
                </div>
              )}
              
              {card.badges && (
                <div className="badge-container">
                  {card.badges.map((badge, idx) => (
                    <div key={idx} className="transparency-badge">
                      {badge}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div> */}

        <div className="financial-chart">
          <h3>Répartition de nos ressources</h3>
          <p className="chart-description">
            Visualisez comment chaque centime de notre budget est utilisé pour maximiser notre impact
          </p>

          <div className="pie-chart-container">
            <div className="pie-chart-wrapper">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="pie-chart-canvas"
                onMouseMove={handleCanvasMouseMove}
                onClick={handleCanvasClick}
                onMouseLeave={handleCanvasMouseLeave}
                style={{ cursor: 'pointer' }}
              />
              
              {selectedSegment !== null && (
                <div className="selected-segment-info">
                  <div 
                    className="segment-color" 
                    style={{ backgroundColor: chartData[selectedSegment].color }}
                  ></div>
                  <div className="segment-details">
                    <h4>{chartData[selectedSegment].label}</h4>
                    <div className="segment-percentage">{chartData[selectedSegment].percentage}</div>
                    <p>{chartData[selectedSegment].description}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="chart-legend">
              {chartData.map((segment, index) => (
                <div 
                  key={index}
                  className={`legend-item ${hoveredSegment === index ? 'hovered' : ''} ${selectedSegment === index ? 'selected' : ''}`}
                  onMouseEnter={() => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => setSelectedSegment(index === selectedSegment ? null : index)}
                  style={{ cursor: 'pointer' }}
                >
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <div className="legend-details">
                    <div className="legend-header">
                      <strong>{segment.label}</strong>
                      <span className="legend-percentage">{segment.percentage}</span>
                    </div>
                    <small>{segment.description}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-stats">
            <div className="stat-card">
              <i className="fas fa-hand-holding-usd"></i>
              <div className="stat-content">
                <h4>Impact maximum</h4>
                <p>92% des dons vont directement aux missions de construction et de consolidation de la paix.</p>
              </div>
            </div>
            <div className="stat-card">
              <i className="fas fa-chart-line"></i>
              <div className="stat-content">
                <h4>Efficacité prouvée</h4>
                <p>Seulement 8% pour les frais de fonctionnement et collecte</p>
              </div>
            </div>
            <div className="stat-card">
              <i className="fas fa-search-dollar"></i>
              <div className="stat-content">
                <h4>Transparence totale</h4>
                <p>Nos comptes sont audités et publiés chaque année</p>
              </div>
            </div>
          </div>

          <div className="commitments-section">
            <h4>
              <i className="fas fa-shield-alt"></i>
              Notre engagement de transparence
            </h4>
            <div className="commitments-grid">
              {commitments.map((commitment, index) => (
                <div className="commitment-item" key={index}>
                  <i className={commitment.icon}></i>
                  <div>
                    <strong>{commitment.title}</strong>
                    <p>{commitment.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="transparency-actions">
          <a href="/Rapport.pdf" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            <i className="fas fa-file-pdf"></i> Rapport annuel 2023
          </a>
          <a href="/Rapport.pdf" className="donate-btn" target="_blank" rel="noopener noreferrer">
            <i className="fas fa-chart-bar"></i> Données financières
          </a>
        </div>
      </div>

      {/* Tooltip flottant */}
      <div 
        ref={tooltipRef}
        className="chart-tooltip"
        style={{
          position: 'fixed',
          display: 'none',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
          pointerEvents: 'none',
          maxWidth: '200px'
        }}
      />

      <style>{`
        .transparency-section {
          background-color: #f0f7ff;
        }

        .transparency-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 50px;
        }

        .transparency-card {
          background-color: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: var(--shadow);
          text-align: center;
          transition: var(--transition);
        }

        .transparency-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }

        .transparency-icon {
          font-size: 2.5rem;
          color: var(--primary-color);
          margin-bottom: 20px;
        }

        .transparency-card h3 {
          margin-bottom: 15px;
          color: var(--dark-color);
          font-size: 1.4rem;
        }

        .transparency-card p {
          color: var(--text-light);
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .transparency-value {
          font-size: 3rem;
          font-weight: 700;
          color: var(--secondary-color);
          margin: 20px 0 10px;
          line-height: 1;
        }

        .transparency-subtext {
          font-size: 1rem;
          color: var(--text-color);
          font-weight: 600;
        }

        .transparency-link a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--primary-color);
          font-weight: 600;
          text-decoration: none;
          margin-top: 20px;
          transition: var(--transition);
        }

        .transparency-link a:hover {
          color: var(--secondary-color);
        }

        .badge-container {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 25px;
          flex-wrap: wrap;
        }

        .transparency-badge {
          background-color: #e8f4ff;
          color: var(--primary-color);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 2px solid rgba(26, 115, 232, 0.2);
        }

        .financial-chart {
          background-color: white;
          border-radius: 15px;
          padding: 40px;
          box-shadow: var(--shadow);
          margin-top: 40px;
        }

        .financial-chart h3 {
          text-align: center;
          margin-bottom: 10px;
          color: var(--dark-color);
        }

        .chart-description {
          text-align: center;
          color: var(--text-light);
          margin-bottom: 40px;
          font-size: 1.1rem;
        }

        .pie-chart-container {
          display: flex;
          flex-wrap: wrap;
          gap: 40px;
          align-items: center;
          justify-content: center;
          margin-bottom: 40px;
        }

        .pie-chart-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pie-chart-canvas {
          max-width: 100%;
          height: auto;
          border-radius: 50%;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .selected-segment-info {
          margin-top: 20px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 10px;
          border-left: 4px solid var(--primary-color);
          display: flex;
          align-items: center;
          gap: 15px;
          max-width: 400px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .segment-color {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .segment-details h4 {
          margin: 0 0 5px 0;
          color: var(--dark-color);
        }

        .segment-percentage {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--dark-color);
          margin-bottom: 5px;
        }

        .segment-details p {
          margin: 0;
          color: var(--text-light);
          font-size: 0.95rem;
        }

        .chart-legend {
          flex: 1;
          min-width: 300px;
          max-width: 400px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 10px;
          margin-bottom: 10px;
          gap: 15px;
          transition: var(--transition);
          border: 2px solid transparent;
        }

        .legend-item:hover {
          background-color: #e8f4ff;
          transform: translateX(5px);
        }

        .legend-item.hovered {
          border-color: rgba(0, 0, 0, 0.1);
        }

        .legend-item.selected {
          border-color: var(--primary-color);
          background-color: #e8f4ff;
        }

        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .legend-details {
          flex: 1;
        }

        .legend-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }

        .legend-header strong {
          color: var(--dark-color);
          font-size: 1.1rem;
        }

        .legend-percentage {
          font-weight: 700;
          color: var(--primary-color);
          font-size: 1.2rem;
        }

        .legend-details small {
          color: var(--text-light);
          font-size: 0.9rem;
          display: block;
        }

        .chart-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 40px 0;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 10px;
          transition: var(--transition);
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .stat-card i {
          font-size: 2rem;
          color: var(--primary-color);
          flex-shrink: 0;
        }

        .stat-content h4 {
          margin: 0 0 5px 0;
          color: var(--dark-color);
        }

        .stat-content p {
          margin: 0;
          color: var(--text-light);
          font-size: 0.95rem;
        }

        .commitments-section {
          margin-top: 40px;
          background-color: #f8f9fa;
          padding: 30px;
          border-radius: 10px;
        }

        .commitments-section h4 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 25px;
          color: var(--dark-color);
        }

        .commitments-section h4 i {
          color: var(--primary-color);
        }

        .commitments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }

        .commitment-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .commitment-item i {
          font-size: 1.5rem;
          color: var(--primary-color);
          margin-top: 5px;
        }

        .commitment-item strong {
          display: block;
          margin-bottom: 5px;
          color: var(--dark-color);
        }

        .commitment-item p {
          color: var(--text-light);
          margin: 0;
          font-size: 0.95rem;
        }

        .transparency-actions {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 50px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .pie-chart-container {
            flex-direction: column;
          }
          
          .pie-chart-canvas {
            width: 300px;
            height: 300px;
          }
          
          .chart-legend {
            width: 100%;
            max-width: 400px;
          }
          
          .selected-segment-info {
            max-width: 300px;
          }
          
          .transparency-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .transparency-actions .btn {
            width: 100%;
            max-width: 300px;
          }
        }

        @media (max-width: 480px) {
          .transparency-grid {
            grid-template-columns: 1fr;
          }
          
          .financial-chart {
            padding: 25px;
          }
          
          .pie-chart-canvas {
            width: 250px;
            height: 250px;
          }
          
          .chart-stats {
            grid-template-columns: 1fr;
          }
          
          .commitments-grid {
            grid-template-columns: 1fr;
          }
          
          .stat-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
};

export default Transparency;