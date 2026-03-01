import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiImage,
  FiEye,
  FiUser,
  FiTag,
  FiClock,
  FiX
} from 'react-icons/fi';
import '../App.css';
// import Headeract from './Headeract';

const Article = () => {
  const [activeTab, setActiveTab] = useState('actions');
  const [actions, setActions] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'developpement',
    date_debut: '',
    date_fin: '',
    budget: '',
    statut: 'planifie',
    photos: ''
  });

  useEffect(() => {
    if (activeTab === 'actions') {
      fetchActions();
    } else {
      fetchArticles();
    }
  }, [activeTab]);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/actions');
      const actionsWithParsedPhotos = response.data.map(action => ({
        ...action,
        photos: parseMediaField(action.photos)
      }));
      setActions(actionsWithParsedPhotos);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des actions');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/articles');
      const articlesWithParsedImages = response.data.map(article => ({
        ...article,
        images: parseMediaField(article.images),
        photos: article.image_url || parseMediaField(article.images)[0] || null
      }));
      setArticles(articlesWithParsedImages);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const parseMediaField = (field) => {
    if (!field) return [];

    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (typeof parsed === 'string') {
        return [parsed];
      }
    } catch (error) {
      if (typeof field === 'string' && field.trim() !== '') {
        return [field];
      }
    }

    return [];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (item, e) => {
    if (e) e.stopPropagation();
    setCurrentItem(item);
    if (activeTab === 'actions') {
      setFormData({
        titre: item.titre,
        description: item.description,
        type: item.type,
        date_debut: item.date_debut ? item.date_debut.split('T')[0] : '',
        date_fin: item.date_fin ? item.date_fin.split('T')[0] : '',
        budget: item.budget || '',
        statut: item.statut,
        photos: item.photos ? (Array.isArray(item.photos) ? item.photos[0] : item.photos) : ''
      });
    } else {
      setFormData({
        titre: item.titre,
        contenu: item.contenu,
        auteur: item.auteur,
        categorie: item.categorie || '',
        image_url: item.image_url || '',
        publie: item.publie
      });
    }
    setShowModal(true);
  };

  const getImageUrl = (item) => {
    if (activeTab === 'actions') {
      if (Array.isArray(item.photos) && item.photos.length > 0) {
        return item.photos[0];
      }
      return item.photos || '';
    } else {
      return item.image_url || item.photos || '';
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return '';

    if (url.startsWith('http')) {
      return url;
    }

    if (url.startsWith('/')) {
      return `http://192.168.179.20:5005${url}`;
    }

    if (url.startsWith('uploads/')) {
      return `http://192.168.179.20:5005/${url}`;
    }

    return url;
  };

  const handleDeleteClick = (item, e) => {
    if (e) e.stopPropagation();
    setCurrentItem(item);
    setShowDeleteModal(true);
  };

  const handleCardClick = (item) => {
    setSelectedDetail(item);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentItem) {
        if (activeTab === 'actions') {
          await axios.put(`/api/actions/${currentItem.id}`, formData);
          alert('Action mise à jour avec succès');
        } else {
          await axios.put(`/api/articles/${currentItem.id}`, formData);
          alert('Article mis à jour avec succès');
        }
      } else {
        if (activeTab === 'actions') {
          await axios.post('/api/actions', formData);
          alert('Action créée avec succès');
        } else {
          await axios.post('/api/articles', formData);
          alert('Article créé avec succès');
        }
      }
      setShowModal(false);
      setCurrentItem(null);
      setFormData({
        titre: '',
        description: '',
        type: 'developpement',
        date_debut: '',
        date_fin: '',
        budget: '',
        statut: 'planifie',
        photos: ''
      });

      if (activeTab === 'actions') {
        fetchActions();
      } else {
        fetchArticles();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async () => {
    try {
      if (activeTab === 'actions') {
        await axios.delete(`/api/actions/${currentItem.id}`);
        alert('Action supprimée avec succès');
      } else {
        await axios.delete(`/api/articles/${currentItem.id}`);
        alert('Article supprimé avec succès');
      }
      setShowDeleteModal(false);
      setCurrentItem(null);

      if (activeTab === 'actions') {
        fetchActions();
      } else {
        fetchArticles();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const stats = {
    totalActions: actions.length,
    actionsEnCours: actions.filter(a => a.statut === 'en_cours').length,
    actionsTerminees: actions.filter(a => a.statut === 'termine').length,
    totalArticles: articles.length,
    articlesPublies: articles.filter(a => a.publie).length
  };

  const filteredItems = activeTab === 'actions'
    ? actions.filter(action => {
      if (filterStatut !== 'tous' && action.statut !== filterStatut) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          action.titre.toLowerCase().includes(term) ||
          action.description.toLowerCase().includes(term) ||
          action.type.toLowerCase().includes(term)
        );
      }
      return true;
    })
    : articles.filter(article => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          article.titre.toLowerCase().includes(term) ||
          article.contenu.toLowerCase().includes(term) ||
          (article.categorie && article.categorie.toLowerCase().includes(term))
        );
      }
      return true;
    });

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'planifie': return 'warning';
      case 'en_cours': return 'success';
      case 'termine': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'urgence': return 'danger';
      case 'developpement': return 'primary';
      case 'education': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <div>
      {/* <Headeract /> */}
      {/* Barre de recherche et filtres */}
      <div className="card" style={{ marginTop: '30px', marginBottom: '30px', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666'
            }} />
            <input
              type="text"
              className="form-control"
              placeholder={`Rechercher ${activeTab === 'actions' ? 'une action...' : 'un article...'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          {activeTab === 'actions' && (
            <select
              className="form-control"
              style={{ width: '150px' }}
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <option value="tous">Tous les statuts</option>
              <option value="planifie">Planifiées</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminées</option>
            </select>
          )}
          {/* <button
            className="btn btn-primary"
            onClick={() => {
              setCurrentItem(null);
              setFormData({
                titre: '',
                description: '',
                type: 'developpement',
                date_debut: '',
                date_fin: '',
                budget: '',
                statut: 'planifie',
                photos: ''
              });
              setShowModal(true);
            }}
          >
            <FiPlus style={{ marginRight: '5px' }} />
            Ajouter
          </button> */}
        </div>
      </div>

      {/* Onglets */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              className={`btn ${activeTab === 'actions' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('actions')}
            >
              Actions & Projets ({stats.totalActions})
            </button>
            <button
              className={`btn ${activeTab === 'articles' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('articles')}
            >
              Articles & Actualités ({stats.totalArticles})
            </button>
          </div>
        </div>

        {/* Contenu principal - Cartes */}
        <div style={{ padding: '0px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="spinner"></div>
              <p>Chargement...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              {activeTab === 'actions' ? (
                <>
                  <FiCalendar size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.2rem', color: '#666' }}>Aucune action trouvée</p>
                  <p style={{ color: '#999' }}>Essayez de modifier vos critères de recherche</p>
                </>
              ) : (
                <>
                  <FiFileText size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.2rem', color: '#666' }}>Aucun article trouvé</p>
                  <p style={{ color: '#999' }}>Essayez de modifier vos critères de recherche</p>
                </>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '25px',

            }}>
              {filteredItems.map(item => {
                const imageUrl = getImageUrl(item);
                const fullImageUrl = getFullImageUrl(imageUrl);

                return (
                  <div
                    key={item.id}
                    className="card shadow-sm"
                    style={{
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      height: '100%',
                      border: '1px solid #eaeaea'
                    }}
                    onClick={() => handleCardClick(item)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    }}
                  >
                    {/* Image */}
                    {imageUrl ? (
                      <div style={{
                        width: '100%',
                        height: '180px',
                        overflow: 'hidden',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px'
                      }}>
                        <img
                          src={fullImageUrl}
                          alt={item.titre}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); display: flex; align-items: center; justify-content: center;">
                                <FiImage size={40} style="opacity: 0.3" />
                              </div>
                            `;
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '180px',
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px'
                      }}>
                        <FiImage size={40} style={{ opacity: 0.3 }} />
                      </div>
                    )}

                    {/* Corps de la carte */}
                    <div className="card-body" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h5 style={{
                          margin: 0,
                          flex: 1,
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#2c3e50'
                        }}>
                          {item.titre}
                        </h5>

                        {/* Badges */}
                        {activeTab === 'actions' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '10px' }}>
                            <span className={`badge badge-${getTypeColor(item.type)}`} style={{
                              fontSize: '0.7rem',
                              padding: '4px 8px'
                            }}>
                              {item.type === 'urgence' ? 'Urgence' :
                                item.type === 'developpement' ? 'Développement' : 'Éducation'}
                            </span>
                            <span className={`badge badge-${getStatutColor(item.statut)}`} style={{
                              fontSize: '0.7rem',
                              padding: '4px 8px'
                            }}>
                              {item.statut === 'planifie' ? 'Planifié' :
                                item.statut === 'en_cours' ? 'En cours' : 'Terminé'}
                            </span>
                          </div>
                        ) : (
                          <span className={`badge ${item.publie ? 'badge-success' : 'badge-secondary'}`} style={{
                            fontSize: '0.7rem',
                            padding: '4px 8px'
                          }}>
                            {item.publie ? 'Publié' : 'Brouillon'}
                          </span>
                        )}
                      </div>

                      {/* Métadonnées */}
                      <div style={{ marginBottom: '15px', fontSize: '0.85rem', color: '#666' }}>
                        {activeTab === 'actions' ? (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                              <FiCalendar size={12} style={{ marginRight: '8px', color: '#7f8c8d' }} />
                              <span>
                                {item.date_debut ? new Date(item.date_debut).toLocaleDateString('fr-FR') : 'Non définie'}
                                {item.date_fin && ` → ${new Date(item.date_fin).toLocaleDateString('fr-FR')}`}
                              </span>
                            </div>
                            {item.budget && (
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <FiDollarSign size={12} style={{ marginRight: '8px', color: '#27ae60' }} />
                                <span style={{ color: '#27ae60', fontWeight: '500' }}>
                                  {parseFloat(item.budget).toLocaleString('fr-FR')} €
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                              <FiUser size={12} style={{ marginRight: '8px', color: '#7f8c8d' }} />
                              <span>{item.auteur || 'Non défini'}</span>
                            </div>
                            {item.categorie && (
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <FiTag size={12} style={{ marginRight: '8px', color: '#3498db' }} />
                                <span style={{ color: '#3498db' }}>{item.categorie}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Description/contenu tronqué */}
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#555',
                        marginBottom: '15px',
                        lineHeight: '1.5',
                        maxHeight: '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '3',
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {activeTab === 'actions' ? item.description : item.contenu}
                      </div>

                      {/* Footer de la carte */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 'auto',
                        paddingTop: '15px',
                        borderTop: '1px solid #f0f0f0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: '#95a5a6' }}>
                          <FiClock size={11} style={{ marginRight: '5px' }} />
                          <span>Créé le {new Date(item.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>


                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {showDetailModal && selectedDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #eaeaea',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ margin: 0, color: '#2c3e50', fontWeight: '600' }}>
                {selectedDetail.titre}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#7f8c8d',
                  padding: '5px',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FiX />
              </button>
            </div>

            {/* Body */}
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 140px)'
            }}>
              {/* Image principale */}
              {getImageUrl(selectedDetail) && (
                <div style={{
                  marginBottom: '24px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <img
                    src={getFullImageUrl(getImageUrl(selectedDetail))}
                    alt={selectedDetail.titre}
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}

              {/* Métadonnées */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '24px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                {activeTab === 'actions' ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Type</span>
                      <span className={`badge badge-${getTypeColor(selectedDetail.type)}`} style={{
                        alignSelf: 'flex-start',
                        fontSize: '0.85rem',
                        padding: '6px 12px'
                      }}>
                        {selectedDetail.type === 'urgence' ? 'Urgence' :
                          selectedDetail.type === 'developpement' ? 'Développement' : 'Éducation'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Statut</span>
                      <span className={`badge badge-${getStatutColor(selectedDetail.statut)}`} style={{
                        alignSelf: 'flex-start',
                        fontSize: '0.85rem',
                        padding: '6px 12px'
                      }}>
                        {selectedDetail.statut === 'planifie' ? 'Planifié' :
                          selectedDetail.statut === 'en_cours' ? 'En cours' : 'Terminé'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Date début</span>
                      <span style={{ fontWeight: '500' }}>
                        {selectedDetail.date_debut ? new Date(selectedDetail.date_debut).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Non définie'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Date fin</span>
                      <span style={{ fontWeight: '500' }}>
                        {selectedDetail.date_fin ? new Date(selectedDetail.date_fin).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Non définie'}
                      </span>
                    </div>

                    {selectedDetail.budget && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Budget</span>
                        <span style={{
                          color: '#27ae60',
                          fontWeight: '600',
                          fontSize: '1.1rem'
                        }}>
                          {parseFloat(selectedDetail.budget).toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Auteur</span>
                      <span style={{ fontWeight: '500' }}>{selectedDetail.auteur || 'Non défini'}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Catégorie</span>
                      {selectedDetail.categorie ? (
                        <span className="badge" style={{
                          alignSelf: 'flex-start',
                          backgroundColor: '#ebf5fb',
                          color: '#3498db',
                          fontSize: '0.85rem',
                          padding: '6px 12px'
                        }}>
                          {selectedDetail.categorie}
                        </span>
                      ) : (
                        <span style={{ fontStyle: 'italic', color: '#999' }}>Non catégorisé</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Statut</span>
                      <span className={`badge ${selectedDetail.publie ? 'badge-success' : 'badge-secondary'}`} style={{
                        alignSelf: 'flex-start',
                        fontSize: '0.85rem',
                        padding: '6px 12px'
                      }}>
                        {selectedDetail.publie ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Date de création</span>
                      <span style={{ fontWeight: '500' }}>
                        {new Date(selectedDetail.created_at).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Contenu complet */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  marginBottom: '16px',
                  marginRight: '20px',
                  color: '#2c3e50',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  Description complète
                </h4>
                <div style={{
                  lineHeight: '1.8',
                  fontSize: '1rem',
                  color: '#34495e',
                  whiteSpace: 'pre-wrap',
                  padding: '20px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #eaeaea'
                }}>
                  {activeTab === 'actions' ? selectedDetail.description : selectedDetail.contenu}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #eaeaea',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '8px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Fermer
              </button>
              {/* <button
                className="btn btn-primary"
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditClick(selectedDetail);
                }}
                style={{
                  padding: '8px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FiEdit size={16} />
                Modifier
              </button> */}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition/création */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #eaeaea',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <h4 style={{ margin: 0, color: '#2c3e50' }}>
                {currentItem ? `Modifier ${activeTab === 'actions' ? 'l\'action' : 'l\'article'}` : `Créer une nouvelle ${activeTab === 'actions' ? 'action' : 'article'}`}
              </h4>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#7f8c8d',
                  padding: '5px',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {activeTab === 'actions' ? (
                    <>
                      <div>
                        <label className="form-label">Titre *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="titre"
                          value={formData.titre}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">Description *</label>
                        <textarea
                          className="form-control"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="4"
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label className="form-label">Type</label>
                          <select
                            className="form-control"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                          >
                            <option value="developpement">Développement</option>
                            <option value="urgence">Urgence</option>
                            <option value="education">Éducation</option>
                          </select>
                        </div>

                        <div>
                          <label className="form-label">Statut</label>
                          <select
                            className="form-control"
                            name="statut"
                            value={formData.statut}
                            onChange={handleInputChange}
                          >
                            <option value="planifie">Planifié</option>
                            <option value="en_cours">En cours</option>
                            <option value="termine">Terminé</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label className="form-label">Date début</label>
                          <input
                            type="date"
                            className="form-control"
                            name="date_debut"
                            value={formData.date_debut}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div>
                          <label className="form-label">Date fin</label>
                          <input
                            type="date"
                            className="form-control"
                            name="date_fin"
                            value={formData.date_fin}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label">Budget (€)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="form-label">URL de la photo</label>
                        <input
                          type="text"
                          className="form-control"
                          name="photos"
                          value={formData.photos}
                          onChange={handleInputChange}
                          placeholder="https://exemple.com/image.jpg"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="form-label">Titre *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="titre"
                          value={formData.titre}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">Contenu *</label>
                        <textarea
                          className="form-control"
                          name="contenu"
                          value={formData.contenu}
                          onChange={handleInputChange}
                          rows="6"
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label className="form-label">Auteur</label>
                          <input
                            type="text"
                            className="form-control"
                            name="auteur"
                            value={formData.auteur}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div>
                          <label className="form-label">Catégorie</label>
                          <input
                            type="text"
                            className="form-control"
                            name="categorie"
                            value={formData.categorie}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label">URL de l'image</label>
                        <input
                          type="text"
                          className="form-control"
                          name="image_url"
                          value={formData.image_url}
                          onChange={handleInputChange}
                          placeholder="https://exemple.com/image.jpg"
                        />
                      </div>

                      <div>
                        <label className="form-label">Statut de publication</label>
                        <div>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="publie"
                              id="publie_oui"
                              value={true}
                              checked={formData.publie === true}
                              onChange={() => setFormData(prev => ({ ...prev, publie: true }))}
                            />
                            <label className="form-check-label" htmlFor="publie_oui">
                              Publié
                            </label>
                          </div>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="publie"
                              id="publie_non"
                              value={false}
                              checked={formData.publie === false}
                              onChange={() => setFormData(prev => ({ ...prev, publie: false }))}
                            />
                            <label className="form-check-label" htmlFor="publie_non">
                              Brouillon
                            </label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div style={{
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid #eaeaea',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px'
                }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {currentItem ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && currentItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            padding: '30px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 20px',
                backgroundColor: '#fee',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiTrash2 size={36} color="#e74c3c" />
              </div>
              <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>
                Confirmer la suppression
              </h4>
              <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>
                Êtes-vous sûr de vouloir supprimer <strong>"{currentItem.titre}"</strong> ?<br />
                Cette action est irréversible.
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '30px'
            }}>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowDeleteModal(false)}
                style={{ padding: '10px 30px' }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                style={{ padding: '10px 30px' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Article;