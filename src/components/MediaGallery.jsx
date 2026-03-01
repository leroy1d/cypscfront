import React, { useState, useEffect } from 'react';
import {
  FiImage, FiVideo, FiFileText, FiStar, FiSearch,
  FiX, FiGrid, FiList, FiDownload, FiCopy, FiTrash2,
  FiEye, FiExternalLink, FiPlayCircle, FiMaximize2,
  FiChevronLeft, FiChevronRight, FiFilter, FiRefreshCw,
  FiCalendar, FiCheck,FiEdit
} from 'react-icons/fi';

const MediaGallery = ({
  medias = [],
  loading = false,
  onSelect = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onCopyUrl = () => {},
  onDownload = () => {},
  enableActions = true,
  viewMode = 'grid',
  onViewModeChange = () => {},
  itemsPerPage = 12,
  showPagination = true,
  showFilters = true,
  showStats = true
}) => {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const mediaTypes = [
    { id: 'all', label: 'Tous les médias', icon: <FiGrid /> },
    { id: 'image', label: 'Images', icon: <FiImage /> },
    { id: 'video', label: 'Vidéos', icon: <FiVideo /> },
    { id: 'document', label: 'Documents', icon: <FiFileText /> },
    { id: 'featured', label: 'À la une', icon: <FiStar /> }
  ];

  // Filtrage des médias
  const getFilteredMedias = () => {
    let filtered = [...medias];
    
    if (filterType !== 'all') {
      if (filterType === 'featured') {
        filtered = filtered.filter(media => media.is_featured);
      } else {
        filtered = filtered.filter(media => media.type === filterType);
      }
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(media =>
        (media.titre && media.titre.toLowerCase().includes(term)) ||
        (media.description && media.description.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  };

  // Pagination
  const getPaginationData = () => {
    const filtered = getFilteredMedias();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      items: filtered.slice(startIndex, endIndex),
      totalPages,
      currentPage,
      totalItems: filtered.length,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, filtered.length)
    };
  };

  const pagination = getPaginationData();

  // Gérer la sélection et la prévisualisation
  const handleMediaClick = (media) => {
    if (onSelect) {
      onSelect(media);
    } else {
      setSelectedMedia(media);
      setShowPreview(true);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    onCopyUrl?.(url);
  };

  const handleDownload = (media) => {
    if (media.url.startsWith('http')) {
      window.open(media.url, '_blank');
    } else {
      window.open(`http://192.168.179.20:5005${media.url}`, '_blank');
    }
    onDownload?.(media);
  };

  // Rendu de l'item média
  const renderMediaItem = (media) => {
    const isImage = media.type === 'image';
    const isVideo = media.type === 'video';
    const isDocument = media.type === 'document';

    return (
      <div key={media.id} className="media-card">
        <div className="media-thumb" onClick={() => handleMediaClick(media)}>
          {isImage ? (
            <img 
              src={media.url.startsWith('http') ? media.url : `http://192.168.179.20:5005${media.url}`}
              alt={media.titre}
              onError={(e) => {
                e.target.src = '/images/default-media.jpg';
              }}
            />
          ) : isVideo ? (
            <div className="video-thumbnail">
              <FiVideo size={32} />
              <span>Vidéo</span>
            </div>
          ) : isDocument ? (
            <div className="doc-thumbnail">
              <FiFileText size={32} />
              <span>Document</span>
            </div>
          ) : (
            <div className="other-thumbnail">
              <FiFileText size={32} />
              <span>{media.type}</span>
            </div>
          )}
          
          {media.is_featured && (
            <div className="featured-badge">
              <FiCheck /> À la une
            </div>
          )}
          
          <div className="media-overlay">
            <span className="media-type-label">{media.type}</span>
            <button 
              className="preview-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleMediaClick(media);
              }}
            >
              <FiMaximize2 />
            </button>
          </div>
        </div>
        
        <div className="media-info">
          <h4>{media.titre || 'Sans titre'}</h4>
          <p className="media-desc">
            {media.description?.substring(0, 50) || 'Pas de description...'}
          </p>
          <div className="media-meta">
            <span className="type-badge">{media.type}</span>
            <span className="size">{media.taille}</span>
            <span className="date">
              <FiCalendar size={12} />
              {new Date(media.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
          
          {enableActions && (
            <div className="media-actions">
              <button onClick={() => handleMediaClick(media)} title="Aperçu">
                <FiEye />
              </button>
              <button onClick={() => handleCopyUrl(media.url)} title="Copier URL">
                <FiCopy />
              </button>
              <button onClick={() => handleDownload(media)} title="Télécharger">
                <FiDownload />
              </button>
              {onEdit && (
                <button onClick={() => onEdit(media)} title="Modifier">
                  <FiEdit />
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(media.id)} title="Supprimer" className="delete-btn">
                  <FiTrash2 />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Rendu de la vue liste
  const renderListView = () => (
    <div className="media-list">
      <table className="media-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Taille</th>
            <th>Date</th>
            {enableActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {pagination.items.map(media => (
            <tr key={media.id}>
              <td>
                <span className={`type-badge ${media.type}`}>
                  {media.type === 'image' ? <FiImage /> : 
                   media.type === 'video' ? <FiVideo /> : <FiFileText />}
                  {media.type}
                </span>
              </td>
              <td>
                <strong>{media.titre || 'Sans titre'}</strong>
                {media.is_featured && <FiStar className="featured-star" />}
              </td>
              <td>{media.description?.substring(0, 80) || '-'}</td>
              <td>{media.taille || '-'}</td>
              <td>{new Date(media.created_at).toLocaleDateString('fr-FR')}</td>
              {enableActions && (
                <td>
                  <div className="table-actions">
                    <button className="btn-sm" onClick={() => handleMediaClick(media)}>
                      <FiEye />
                    </button>
                    <button className="btn-sm" onClick={() => handleCopyUrl(media.url)}>
                      <FiCopy />
                    </button>
                    {onEdit && (
                      <button className="btn-sm" onClick={() => onEdit(media)}>
                        <FiEdit />
                      </button>
                    )}
                    {onDelete && (
                      <button className="btn-sm delete-btn" onClick={() => onDelete(media.id)}>
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Rendu de la vue grille
  const renderGridView = () => (
    <div className="media-grid">
      {pagination.items.map(media => renderMediaItem(media))}
    </div>
  );

  if (loading) {
    return (
      <div className="media-gallery loading">
        <div className="loading-spinner"></div>
        <p>Chargement des médias...</p>
      </div>
    );
  }

  if (medias.length === 0) {
    return (
      <div className="media-gallery empty">
        <FiImage size={64} />
        <h3>Aucun média disponible</h3>
        <p>Commencez par ajouter des médias à votre bibliothèque</p>
      </div>
    );
  }

  return (
    <div className="media-gallery">
      {/* Contrôles */}
      <div className="gallery-controls">
        {showFilters && (
          <>
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher un média..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <FiX />
                </button>
              )}
            </div>

            <div className="filter-buttons">
              {mediaTypes.map(type => (
                <button
                  key={type.id}
                  className={`filter-btn ${filterType === type.id ? 'active' : ''}`}
                  onClick={() => setFilterType(type.id)}
                >
                  {type.icon}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Vue grille"
          >
            <FiGrid />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="Vue liste"
          >
            <FiList />
          </button>
        </div>
      </div>

      {/* Statistiques */}
      {showStats && (
        <div className="gallery-stats">
          <div className="stat-item">
            <FiImage />
            <span className="stat-count">{medias.length}</span>
            <span>Total</span>
          </div>
          <div className="stat-item">
            <FiImage />
            <span className="stat-count">{medias.filter(m => m.type === 'image').length}</span>
            <span>Images</span>
          </div>
          <div className="stat-item">
            <FiVideo />
            <span className="stat-count">{medias.filter(m => m.type === 'video').length}</span>
            <span>Vidéos</span>
          </div>
          <div className="stat-item">
            <FiStar />
            <span className="stat-count">{medias.filter(m => m.is_featured).length}</span>
            <span>À la une</span>
          </div>
        </div>
      )}

      {/* Contenu */}
      <div className="gallery-content">
        {pagination.items.length === 0 ? (
          <div className="no-results">
            <FiSearch size={48} />
            <h3>Aucun résultat</h3>
            <p>Essayez d'autres termes de recherche ou filtres</p>
            <button 
              className="btn-reset"
              onClick={() => {
                setFilterType('all');
                setSearchTerm('');
              }}
            >
              <FiRefreshCw /> Réinitialiser
            </button>
          </div>
        ) : viewMode === 'grid' ? renderGridView() : renderListView()}
      </div>

      {/* Pagination */}
      {showPagination && pagination.totalPages > 1 && (
        <>
          <div className="gallery-pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft /> Précédent
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages}
            >
              Suivant <FiChevronRight />
            </button>
          </div>
          
          <div className="pagination-summary">
            Affichage de {pagination.startIndex} à {pagination.endIndex} sur {pagination.totalItems} média{pagination.totalItems !== 1 ? 's' : ''}
          </div>
        </>
      )}

      {/* Prévisualisation */}
      {showPreview && selectedMedia && (
        <div className="preview-modal">
          <div className="preview-overlay" onClick={() => setShowPreview(false)}></div>
          <div className="preview-content">
            <div className="preview-header">
              <h3>{selectedMedia.titre}</h3>
              <button className="close-btn" onClick={() => setShowPreview(false)}>
                <FiX />
              </button>
            </div>
            
            <div className="preview-body">
              {selectedMedia.type === 'image' ? (
                <img 
                  src={selectedMedia.url.startsWith('http') ? selectedMedia.url : `http://192.168.179.20:5005${selectedMedia.url}`}
                  alt={selectedMedia.titre}
                  className="preview-image"
                />
              ) : selectedMedia.type === 'video' ? (
                <div className="preview-video">
                  <video controls>
                    <source 
                      src={selectedMedia.url.startsWith('http') ? selectedMedia.url : `http://192.168.179.20:5005${selectedMedia.url}`}
                      type="video/mp4"
                    />
                  </video>
                </div>
              ) : (
                <div className="preview-document">
                  <FiFileText size={64} />
                  <p>Document: {selectedMedia.titre}</p>
                  <a 
                    href={selectedMedia.url.startsWith('http') ? selectedMedia.url : `http://192.168.179.20:5005${selectedMedia.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-open"
                  >
                    <FiExternalLink /> Ouvrir
                  </a>
                </div>
              )}
              
              <div className="preview-info">
                <p><strong>Description:</strong> {selectedMedia.description || 'Aucune'}</p>
                <div className="preview-meta">
                  <span><strong>Type:</strong> {selectedMedia.type}</span>
                  <span><strong>Taille:</strong> {selectedMedia.taille}</span>
                  <span><strong>Date:</strong> {new Date(selectedMedia.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
            
            <div className="preview-actions">
              <button onClick={() => handleCopyUrl(selectedMedia.url)}>
                <FiCopy /> Copier URL
              </button>
              <button onClick={() => handleDownload(selectedMedia)}>
                <FiDownload /> Télécharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
