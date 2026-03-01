import React, { useState, useEffect } from 'react';
import { apiService } from '../../backend/api';

const FAQ = () => {
  const [faqItems, setFaqItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const data = await apiService.getFAQ();
        setFaqItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error('Erreur lors du chargement des FAQ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQ();
  }, []);

  useEffect(() => {
    let filtered = faqItems;

    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.categorie === activeCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.question.toLowerCase().includes(term) ||
        item.reponse.toLowerCase().includes(term)
      );
    }

    setFilteredItems(filtered);
  }, [faqItems, activeCategory, searchTerm]);

  const toggleItem = (id) => {
    setActiveItem(activeItem === id ? null : id);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Extraire les catégories uniques
  const categories = [
    { id: 'all', label: 'Toutes les questions' },
    ...Array.from(new Set(faqItems.map(item => item.categorie)))
      .filter(Boolean)
      .map(category => ({ id: category, label: category }))
  ];

  if (loading) {
    return (
      <section className="section-padding faq-section" id="faq">
        <div className="container">
          <div className="section-title">
            <h2>Questions Fréquentes</h2>
            <p>Chargement des questions...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding faq-section" id="faq">
      <div className="container">
        <div className="section-title">
          <h2>Questions Fréquentes</h2>
          <p>Trouvez rapidement des réponses à vos questions sur notre action aux service de la Paix, les dons et notre fonctionnement.</p>
        </div>

        <div className="faq-container">
          <div className="faq-categories">
            {categories.map(category => (
              <button
                key={category.id}
                className={`faq-category-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(category.id);
                  setSearchTerm('');
                }}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="faq-search">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="faq-accordion">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div 
                  className={`faq-item ${activeItem === item.id ? 'active' : ''}`} 
                  key={item.id}
                >
                  <div className="faq-question" onClick={() => toggleItem(item.id)}>
                    <h3>{item.question}</h3>
                    <i className={`fas fa-chevron-down faq-icon ${activeItem === item.id ? 'rotated' : ''}`}></i>
                  </div>
                  <div className="faq-answer">
                    <div dangerouslySetInnerHTML={{ __html: item.reponse }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <h3>Aucune question trouvée</h3>
                <p>Votre recherche n'a donné aucun résultat. Essayez d'autres mots-clés.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .faq-section {
          position: relative;
          background-image: url('/backg5.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        /* Overlay pour améliorer la lisibilité */
        .faq-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.79);
          z-index: 0;
        }

        .faq-section .container {
          position: relative;
          z-index: 1;
        }

        .faq-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-categories {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 40px;
        }

        .faq-category-btn {
          padding: 12px 25px;
          background-color: rgba(255, 255, 255, 0.95);
          border: 2px solid #e0e0e0;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          color: var(--text-color);
          backdrop-filter: blur(5px);
        }

        .faq-category-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .faq-category-btn.active {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .faq-search {
          margin-bottom: 40px;
        }

        .search-box {
          position: relative;
          max-width: 500px;
          margin: 0 auto;
        }

        .search-box input {
          width: 100%;
          padding: 15px 20px 15px 50px;
          border: 2px solid #e0e0e0;
          border-radius: 30px;
          font-size: 1rem;
          transition: var(--transition);
          background-color: rgba(255, 255, 255, 0.95);
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
          background-color: white;
        }

        .search-box i {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }

        .faq-accordion {
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: var(--shadow);
          backdrop-filter: blur(5px);
        }

        .faq-item {
          border-bottom: 1px solid #e0e0e0;
        }

        .faq-item:last-child {
          border-bottom: none;
        }

        .faq-question {
          padding: 25px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          background-color: transparent;
          transition: var(--transition);
        }

        .faq-question:hover {
          background-color: rgba(248, 249, 250, 0.8);
        }

        .faq-question h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--dark-color);
          margin-right: 20px;
        }

        .faq-icon {
          color: var(--primary-color);
          font-size: 1.2rem;
          transition: var(--transition);
        }

        .faq-icon.rotated {
          transform: rotate(180deg);
        }

        .faq-answer {
          padding: 0 30px;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
          background-color: rgba(248, 249, 250, 0.8);
        }

        .faq-item.active .faq-answer {
          padding: 0 30px 25px;
          max-height: 1000px;
        }

        .no-results {
          text-align: center;
          padding: 50px;
          color: var(--text-light);
        }

        .no-results i {
          font-size: 3rem;
          margin-bottom: 20px;
          color: #ccc;
        }

        @media (max-width: 768px) {
          .faq-question {
            padding: 20px;
          }

          .faq-question h3 {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default FAQ;