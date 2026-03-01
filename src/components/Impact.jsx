// components/Impact.jsx
import React from 'react';
import structureImage from '../assets/structurecoordination.png';



const Impact = () => {
  return (
    <section className="impact-section">
      <div className="container">
        <div className="section-title">
          <h2>Structure de la Coordination</h2>
          {/* <p>Organisation et gouvernance de la Commission Nationale Jeunesse, Paix et Sécurité</p> */}
        </div>

        <div className="image-container">
          <img src={structureImage} className="structure-image" alt="Structure de la coordination" />
        </div>
      </div>

      <style>{`
        .impact-section {
          padding: 60px 0;
          background-color: #f8f9fa;
        }

        .section-title {
          text-align: center;
          margin-bottom: 40px;
        }

        .section-title h2 {
          font-size: 2.5rem;
          color: #00a859;
          margin-bottom: 15px;
          position: relative;
          display: inline-block;
        }

        .section-title h2::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: #00a859;
          border-radius: 2px;
        }

        .section-title p {
          font-size: 1.1rem;
          color: #6c757d;
          max-width: 700px;
          margin: 20px auto 0;
        }

        .image-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .image-container:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 168, 89, 0.2);
        }

        .structure-image {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 10px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .impact-section {
            padding: 40px 0;
          }

          .section-title h2 {
            font-size: 2rem;
          }

          .section-title p {
            font-size: 1rem;
          }

          .image-container {
            padding: 15px;
          }
        }

        @media (max-width: 576px) {
          .section-title h2 {
            font-size: 1.5rem;
          }

          .section-title p {
            font-size: 0.9rem;
          }

          .image-container {
            padding: 10px;
          }
        }

        /* Animation d'entrée */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .image-container {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </section>
  );
};

export default Impact;