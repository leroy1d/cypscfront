import { apiService } from './api';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FiUpload, FiLink, FiImage, FiVideo, FiFile, FiX,
  FiSearch, FiFilter, FiDownload, FiCopy, FiTrash2,
  FiEye, FiCheck, FiGlobe, FiExternalLink, FiPlay,
  FiPause, FiMaximize, FiPlus, FiRefreshCw, FiGrid, FiList
} from 'react-icons/fi';

const Gallery = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'image', 'video', 'document'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name', 'size'

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'image',
    projet_id: '',
    article_id: '',
    is_featured: false,
    ordre: 0
  });

  const [urlForm, setUrlForm] = useState({
    url: '',
    titre: '',
    description: '',
    type: 'image'
  });

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const token = localStorage.getItem('token');
  const API_BASE_URL = 'https://ypsbackend.vercel.app';

  // Charger la bibliothèque média
  useEffect(() => {
    if (activeTab === 'library') {
      fetchMediaLibrary();
    }
  }, [activeTab]);

  const fetchMediaLibrary = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/media/all`);
      setMediaLibrary(response.data.items || []);
    } catch (error) {
      console.error('Erreur chargement bibliothèque:', error);
      alert('Erreur lors du chargement de la bibliothèque');
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement de fichier
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      preview: file.type.startsWith('video/') ? null : URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' :
        file.type.startsWith('video/') ? 'video' : 'document',
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      id: Date.now() + Math.random(),
      extension: file.name.split('.').pop().toLowerCase()
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // Upload depuis l'appareil
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert('Veuillez sélectionner des fichiers');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const uploadPromises = uploadedFiles.map((fileData, index) => {
        const formDataObj = new FormData();
        
        formDataObj.append('file', fileData.file);
        formDataObj.append('titre', formData.titre || fileData.name);
        formDataObj.append('description', formData.description);
        formDataObj.append('type', fileData.type);
        formDataObj.append('is_featured', formData.is_featured);
        formDataObj.append('ordre', formData.ordre);

        return axios.post(`${API_BASE_URL}/api/media/upload`, formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          }
        });
      });

      await Promise.all(uploadPromises);

      // Libérer les URLs de prévisualisation
      uploadedFiles.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });

      alert(`${uploadedFiles.length} fichier(s) uploadé(s) avec succès!`);
      setUploadedFiles([]);
      resetForm();
      fetchMediaLibrary();
      setActiveTab('library');

    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload via URL
  const handleUrlUpload = async () => {
    if (!urlForm.url) {
      alert('Veuillez entrer une URL');
      return;
    }

    try {
      setUploading(true);

      const response = await axios.post(`${API_BASE_URL}/api/media/url`, {
        url: urlForm.url,
        titre: urlForm.titre || `Média de ${new Date().toLocaleDateString()}`,
        description: urlForm.description,
        type: urlForm.type,
        is_featured: formData.is_featured,
        ordre: formData.ordre
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      alert('Média ajouté avec succès!');
      resetUrlForm();
      fetchMediaLibrary();
      setActiveTab('library');

    } catch (error) {
      console.error('Erreur URL upload:', error);
      alert('Erreur: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  // Supprimer un fichier de la liste d'upload
  const removeFile = (id) => {
    const fileToRemove = uploadedFiles.find(f => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  // Aperçu média
  const previewMedia = async (media) => {
    setSelectedMedia(media);
    setShowPreview(true);
    setVideoPlaying(false);
  };

  // Contrôles vidéo
  const toggleVideoPlay = () => {
    if (previewVideoRef.current) {
      if (previewVideoRef.current.paused) {
        previewVideoRef.current.play();
        setVideoPlaying(true);
      } else {
        previewVideoRef.current.pause();
        setVideoPlaying(false);
      }
    }
  };

  // Copier l'URL
  const copyUrl = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = 'URL copiée dans le presse-papier !';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      })
      .catch(err => console.error('Erreur copie:', err));
  };

  // Télécharger média avec détection intelligente
const downloadMedia = async (media) => {
  try {
    let mediaUrl = media.url;
    
    if (!media.url.startsWith('http')) {
      mediaUrl = `${API_BASE_URL}${media.url.startsWith('/') ? media.url : '/' + media.url}`;
    }

    const response = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    
    const contentDisposition = response.headers.get('content-disposition');
    let fileName = media.titre || 'media';
    
    // 🔍 FONCTION DE DÉTECTION D'EXTENSION
    const getExtensionFromUrl = (url) => {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        // Récupérer l'extension du fichier
        const match = pathname.match(/\.([a-zA-Z0-9]+)(?:$|\/)/);
        if (match && match[1]) {
          return match[1].toLowerCase();
        }
        
        // Essayer avec le nom du fichier
        const filename = pathname.split('/').pop();
        if (filename && filename.includes('.')) {
          return filename.split('.').pop().toLowerCase();
        }
      } catch (e) {
        // Si URL invalide, utiliser une méthode plus simple
        const match = url.match(/\.([a-zA-Z0-9]+)(?:$|\?|#)/);
        if (match && match[1]) {
          return match[1].toLowerCase();
        }
      }
      return null;
    };
    
    // 📋 MAPPING DES EXTENSIONS PAR TYPE
    const extensionMap = {
      // Images
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image',
      'webp': 'image', 'svg': 'image', 'bmp': 'image', 'tiff': 'image',
      
      // Vidéos
      'mp4': 'video', 'mpeg': 'video', 'ogv': 'video', 'webm': 'video',
      'mov': 'video', 'avi': 'video', 'mkv': 'video', '3gp': 'video',
      
      // Documents
      'pdf': 'document pdf',
      'doc': 'word', 'docx': 'word', 'dot': 'word', 'dotx': 'word',
      'ppt': 'powerpoint', 'pptx': 'powerpoint', 'pps': 'powerpoint', 'ppsx': 'powerpoint',
      'rtf': 'texte', 'txt': 'texte', 'odt': 'texte',
      
      // Audio
      'mp3': 'audio', 'wav': 'audio', 'ogg': 'audio', 'flac': 'audio',
      
      // Archives
      'zip': 'archive', 'rar': 'archive', '7z': 'archive', 'tar': 'archive', 'gz': 'archive'
    };
    
    if (contentDisposition) {
      // Option 1: Utiliser le nom fourni par le serveur
      const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1];
      }
    } else {
      // Option 2: Détecter l'extension depuis l'URL
      const extension = getExtensionFromUrl(mediaUrl);
      
      if (extension) {
        const detectedType = extensionMap[extension] || 'fichier';
        
        // Si le titre n'a pas déjà l'extension, l'ajouter
        if (!fileName.toLowerCase().endsWith(`.${extension}`)) {
          fileName = `${fileName}.${extension}`;
        }
        
        console.log(`📁 Extension détectée: .${extension} (${detectedType})`);
      } else {
        // Option 3: Fallback sur le type fourni
        const defaultExtension = Object.keys(extensionMap).find(
          key => extensionMap[key] === media.type
        ) || 'bin';
        
        if (!fileName.endsWith(`.${defaultExtension}`)) {
          fileName = `${fileName}.${defaultExtension}`;
        }
      }
    }
    
    // Nettoyer le nom du fichier (enlever les caractères problématiques)
    fileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
    
    return { success: true, fileName };
    
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    
    // Fallback simple
    let mediaUrl = media.url;
    if (!media.url.startsWith('http')) {
      mediaUrl = `${API_BASE_URL}${media.url.startsWith('/') ? media.url : '/' + media.url}`;
    }
    window.open(mediaUrl, '_blank');
    
    return { success: false, error: error.message };
  }
};

  // Supprimer média
  const deleteMedia = async (id) => {
    if (!confirm('Supprimer ce média ?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/media/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const toast = document.createElement('div');
      toast.className = 'toast-notification success';
      toast.textContent = 'Média supprimé avec succès !';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      fetchMediaLibrary();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression: ' + (error.response?.data?.error || error.message));
    }
  };

  // Filtrer et trier les médias
  const filteredMedia = mediaLibrary
    .filter(media => {
      if (selectedFilter !== 'all' && media.type !== selectedFilter) return false;
      
      return (
        (media.titre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (media.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name':
          return (a.titre || '').localeCompare(b.titre || '');
        case 'size':
          return (b.taille || 0) - (a.taille || 0);
        default:
          return 0;
      }
    });

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      type: 'image',
      projet_id: '',
      article_id: '',
      is_featured: false,
      ordre: 0
    });
  };

  const resetUrlForm = () => {
    setUrlForm({
      url: '',
      titre: '',
      description: '',
      type: 'image'
    });
  };

  // Construire l'URL complète pour l'affichage
  const buildMediaUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=Image+non+disponible';
    
    if (url.startsWith('http')) {
      return url;
    }
    
    return `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  };

  // Rendu de l'onglet Upload
  const renderUploadTab = () => (
    <div className="upload-tab">
      <div className="upload-section">
        <div className="section-header">
          <div className="header-icon">
            <FiUpload />
          </div>
          <div>
            <h3>Upload depuis votre appareil</h3>
            <p className="section-subtitle">Ajoutez vos fichiers locaux</p>
          </div>
        </div>

        {/* Zone de drop */}
        <div
          className="drop-zone"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            if (e.dataTransfer.files.length) {
              handleFileChange({ target: { files: e.dataTransfer.files } });
            }
          }}
        >
          <div className="drop-zone-content">
            <FiUpload size={64} />
            <h4>Cliquez ou glissez-déposez vos fichiers</h4>
            <p className="formats-info">
              Formats supportés: Images (JPG, PNG, GIF, WebP, SVG),
              Vidéos (MP4, WebM, AVI, MOV),
              Documents (PDF, DOC, DOCX, TXT)
            </p>
            <button className="browse-btn">
              Parcourir les fichiers
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Fichiers sélectionnés */}
        {uploadedFiles.length > 0 && (
          <div className="selected-files">
            <div className="files-header">
              <h4>Fichiers sélectionnés ({uploadedFiles.length})</h4>
              <button 
                className="clear-btn"
                onClick={() => {
                  uploadedFiles.forEach(f => {
                    if (f.preview) URL.revokeObjectURL(f.preview);
                  });
                  setUploadedFiles([]);
                }}
              >
                Tout effacer
              </button>
            </div>
            <div className="files-grid">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-preview" onClick={() => file.preview && window.open(file.preview, '_blank')}>
                    {file.type === 'image' ? (
                      <img src={file.preview} alt={file.name} />
                    ) : file.type === 'video' ? (
                      <div className="video-thumb">
                        <div className="video-play-icon">
                          <FiPlay size={32} />
                        </div>
                        <FiVideo size={24} />
                        <span>Vidéo</span>
                      </div>
                    ) : (
                      <div className="doc-thumb">
                        <FiFile size={24} />
                        <span>Document</span>
                      </div>
                    )}
                    <div className="file-overlay">
                      <FiEye size={20} />
                    </div>
                  </div>
                  <div className="file-info">
                    <div className="file-name" title={file.name}>{file.name}</div>
                    <div className="file-meta">
                      <span className="file-type">{file.type}</span>
                      <span className="file-size">{file.size}</span>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => removeFile(file.id)} title="Supprimer">
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire de métadonnées */}
        <div className="metadata-form">
          <h4>Métadonnées (appliquées à tous les fichiers)</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Titre (optionnel)</label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Titre du média"
              />
            </div>
            <div className="form-group full-width">
              <label>Description (optionnel)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du média"
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <span className="checkbox-text">Mettre en avant</span>
                </label>
              </div>
              <div className="form-group">
                <label>Ordre d'affichage</label>
                <input
                  type="number"
                  value={formData.ordre}
                  onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bouton d'upload */}
        {uploadedFiles.length > 0 && (
          <div className="upload-actions">
            {uploading && (
              <div className="progress-container">
                <div className="progress-label">
                  <span>Upload en cours...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            <button
              className="btn-upload"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="spinner"></div>
                  Upload en cours...
                </>
              ) : (
                `Uploader ${uploadedFiles.length} fichier(s)`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Rendu de l'onglet URL
  const renderUrlTab = () => (
    <div className="url-tab">
      <div className="section-header">
        <div className="header-icon">
          <FiLink />
        </div>
        <div>
          <h3>Ajouter via URL</h3>
          <p className="section-subtitle">Importez des médias depuis une URL</p>
        </div>
      </div>

      <div className="url-form">
        <div className="form-grid">
          <div className="form-group full-width">
            <label>URL du média *</label>
            <div className="input-with-icon">
              <FiGlobe className="input-icon" />
              <input
                type="url"
                value={urlForm.url}
                onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })}
                placeholder="https://exemple.com/image.jpg"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Type de média</label>
            <select
              value={urlForm.type}
              onChange={(e) => setUrlForm({ ...urlForm, type: e.target.value })}
            >
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
              <option value="document">Document</option>
            </select>
          </div>

          <div className="form-group">
            <label>Titre (optionnel)</label>
            <input
              type="text"
              value={urlForm.titre}
              onChange={(e) => setUrlForm({ ...urlForm, titre: e.target.value })}
              placeholder="Titre du média"
            />
          </div>

          <div className="form-group full-width">
            <label>Description (optionnel)</label>
            <textarea
              value={urlForm.description}
              onChange={(e) => setUrlForm({ ...urlForm, description: e.target.value })}
              placeholder="Description du média"
              rows="3"
            />
          </div>
        </div>

        <button
          className="btn-add-url"
          onClick={handleUrlUpload}
          disabled={uploading || !urlForm.url}
        >
          {uploading ? (
            <>
              <div className="spinner"></div>
              Ajout en cours...
            </>
          ) : (
            'Ajouter le média'
          )}
        </button>
      </div>
    </div>
  );

  // Rendu de l'onglet Bibliothèque
  const renderLibraryTab = () => (
    <div className="library-tab">
      <div className="library-header">
        <div className="header-main">
          <div className="section-header">
            <div className="header-icon">
              <FiImage />
            </div>
            <div>
              <h3>Bibliothèque de médias</h3>
              <p className="section-subtitle">Gérez tous vos médias</p>
            </div>
          </div>
          
          <div className="library-stats">
            <div className="stat-card" onClick={() => setSelectedFilter('all')}>
              <div className="stat-icon all">
                <FiGrid />
              </div>
              <div className="stat-info">
                <span className="stat-count">{mediaLibrary.length}</span>
                <span className="stat-label">Tous</span>
              </div>
            </div>
            <div className="stat-card" onClick={() => setSelectedFilter('image')}>
              <div className="stat-icon image">
                <FiImage />
              </div>
              <div className="stat-info">
                <span className="stat-count">{mediaLibrary.filter(m => m.type === 'image').length}</span>
                <span className="stat-label">Images</span>
              </div>
            </div>
            <div className="stat-card" onClick={() => setSelectedFilter('video')}>
              <div className="stat-icon video">
                <FiVideo />
              </div>
              <div className="stat-info">
                <span className="stat-count">{mediaLibrary.filter(m => m.type === 'video').length}</span>
                <span className="stat-label">Vidéos</span>
              </div>
            </div>
            <div className="stat-card" onClick={() => setSelectedFilter('document')}>
              <div className="stat-icon document">
                <FiFile />
              </div>
              <div className="stat-info">
                <span className="stat-count">{mediaLibrary.filter(m => m.type === 'document').length}</span>
                <span className="stat-label">Documents</span>
              </div>
            </div>
          </div>
        </div>

        <div className="library-controls">
          <div className="controls-left">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher un média..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-dropdown">
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous les types</option>
                <option value="image">Images</option>
                <option value="video">Vidéos</option>
                <option value="document">Documents</option>
              </select>
            </div>
            
            <div className="sort-dropdown">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="name">Par nom</option>
                <option value="size">Par taille</option>
              </select>
            </div>
          </div>
          
          <div className="controls-right">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Vue grille"
              >
                <FiGrid />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Vue liste"
              >
                <FiList />
              </button>
            </div>
            
            <button 
              className="refresh-btn" 
              onClick={fetchMediaLibrary} 
              title="Actualiser"
            >
              <FiRefreshCw />
            </button>
            
            <button 
              className="btn-add-new"
              onClick={() => setActiveTab('upload')}
            >
              <FiPlus /> Ajouter
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement de la bibliothèque...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="empty-library">
          <FiImage size={80} />
          <h4>Aucun média trouvé</h4>
          <p>{searchTerm ? 'Aucun résultat pour votre recherche' : 'Commencez par uploader votre premier média'}</p>
          {!searchTerm && (
            <button className="btn-primary" onClick={() => setActiveTab('upload')}>
              <FiUpload /> Uploader un média
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="media-count">
            <span>{filteredMedia.length} média{filteredMedia.length > 1 ? 's' : ''} trouvé{filteredMedia.length > 1 ? 's' : ''}</span>
            {selectedFilter !== 'all' && (
              <span className="filter-tag">
                Filtre: {selectedFilter === 'image' ? 'Images' : selectedFilter === 'video' ? 'Vidéos' : 'Documents'}
                <button onClick={() => setSelectedFilter('all')} className="clear-filter">
                  <FiX />
                </button>
              </span>
            )}
          </div>
          
          <div className={`media-container ${viewMode}`}>
            {viewMode === 'grid' ? (
              <div className="media-grid">
                {filteredMedia.map(media => (
                  <div key={media.id} className="media-card">
                    <div className="media-thumb" onClick={() => previewMedia(media)}>
                      {media.type === 'image' ? (
                        <img
                          src={buildMediaUrl(media.url)}
                          alt={media.titre}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                          }}
                        />
                      ) : media.type === 'video' ? (
                        <div className="video-thumbnail">
                          <div className="video-play-overlay">
                            <FiPlay size={48} />
                          </div>
                          <div className="video-type-indicator">
                            <FiVideo size={24} />
                            <span>Vidéo</span>
                          </div>
                        </div>
                      ) : (
                        <div className="doc-thumbnail">
                          <div className="doc-icon-large">
                            <FiFile size={48} />
                          </div>
                          <span>Document</span>
                        </div>
                      )}
                      {media.is_featured && (
                        <div className="featured-badge">
                          <FiCheck /> À la une
                        </div>
                      )}
                      <div className="media-overlay">
                        <FiEye size={24} />
                        <span>Voir</span>
                      </div>
                    </div>

                    <div className="media-info">
                      <h4 title={media.titre || 'Sans titre'}>{media.titre || 'Sans titre'}</h4>
                      <p className="media-desc" title={media.description}>
                        {media.description?.substring(0, 60) || 'Pas de description...'}
                        {media.description?.length > 60 && '...'}
                      </p>
                      <div className="media-meta">
                        <span className={`type-badge ${media.type}`}>{media.type}</span>
                        <span className="size">{media.taille || 'N/A'}</span>
                      </div>

                      <div className="media-actions">
                        <button onClick={() => previewMedia(media)} title="Aperçu" className="action-btn preview">
                          <FiEye />
                        </button>
                        <button onClick={() => copyUrl(buildMediaUrl(media.url))} title="Copier URL" className="action-btn copy">
                          <FiCopy />
                        </button>
                        <button onClick={() => downloadMedia(media)} title="Télécharger" className="action-btn download">
                          <FiDownload />
                        </button>
                        <button onClick={() => deleteMedia(media.id)} title="Supprimer" className="action-btn delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="media-list">
                {filteredMedia.map(media => (
                  <div key={media.id} className="media-list-item">
                    <div className="list-thumb" onClick={() => previewMedia(media)}>
                      {media.type === 'image' ? (
                        <img
                          src={buildMediaUrl(media.url)}
                          alt={media.titre}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/80x60?text=Image';
                          }}
                        />
                      ) : media.type === 'video' ? (
                        <div className="list-video-thumb">
                          <FiVideo size={24} />
                        </div>
                      ) : (
                        <div className="list-doc-thumb">
                          <FiFile size={24} />
                        </div>
                      )}
                    </div>
                    
                    <div className="list-info">
                      <div className="list-main">
                        <h4 title={media.titre || 'Sans titre'}>{media.titre || 'Sans titre'}</h4>
                        <p className="list-desc" title={media.description}>
                          {media.description || 'Pas de description...'}
                        </p>
                      </div>
                      
                      <div className="list-meta">
                        <span className={`list-type ${media.type}`}>{media.type}</span>
                        <span className="list-size">{media.taille || 'N/A'}</span>
                        <span className="list-date">
                          {media.created_at ? new Date(media.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="list-actions">
                      <button onClick={() => previewMedia(media)} title="Aperçu">
                        <FiEye />
                      </button>
                      <button onClick={() => copyUrl(buildMediaUrl(media.url))} title="Copier URL">
                        <FiCopy />
                      </button>
                      <button onClick={() => downloadMedia(media)} title="Télécharger">
                        <FiDownload />
                      </button>
                      <button onClick={() => deleteMedia(media.id)} title="Supprimer">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="media-manager">
      {/* Navigation */}
      <div className="media-nav">
        <button
          className={`nav-btn ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          <FiImage /> Bibliothèque
        </button>
        <button
          className={`nav-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <FiUpload /> Upload
        </button>
        <button
          className={`nav-btn ${activeTab === 'url' ? 'active' : ''}`}
          onClick={() => setActiveTab('url')}
        >
          <FiLink /> Via URL
        </button>
      </div>

      {/* Contenu principal */}
      <div className="media-content">
        {activeTab === 'library' && renderLibraryTab()}
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'url' && renderUrlTab()}
      </div>

      {/* Modal d'aperçu */}
      {showPreview && selectedMedia && (
        <div className="preview-modal">
          <div className="preview-overlay" onClick={() => setShowPreview(false)}></div>
          <div className="preview-content">
            <div className="preview-header">
              <div className="preview-title">
                <h3>{selectedMedia.titre || 'Sans titre'}</h3>
                <span className="preview-type">{selectedMedia.type}</span>
              </div>
              <button className="close-btn" onClick={() => setShowPreview(false)}>
                <FiX />
              </button>
            </div>

            <div className="preview-body">
              {selectedMedia.type === 'image' ? (
                <div className="preview-image-container">
                  <img
                    src={buildMediaUrl(selectedMedia.url)}
                    alt={selectedMedia.titre}
                    className="preview-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/800x600?text=Image+non+disponible';
                    }}
                  />
                </div>
              ) : selectedMedia.type === 'video' ? (
                <div className="preview-video-container">
                  <div className="video-wrapper">
                    <video 
                      ref={previewVideoRef}
                      controls 
                      autoPlay
                      className="preview-video"
                      onPlay={() => setVideoPlaying(true)}
                      onPause={() => setVideoPlaying(false)}
                      onEnded={() => setVideoPlaying(false)}
                    >
                      <source
                        src={buildMediaUrl(selectedMedia.url)}
                        type="video/mp4"
                      />
                      <source
                        src={buildMediaUrl(selectedMedia.url)}
                        type="video/webm"
                      />
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                    <div className="video-controls-overlay">
                      <button className="video-control-btn" onClick={toggleVideoPlay}>
                        {videoPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
                      </button>
                      <button className="video-control-btn" onClick={() => previewVideoRef.current?.requestFullscreen()}>
                        <FiMaximize size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="video-info">
                    <span>Cliquez sur la vidéo pour contrôler la lecture</span>
                  </div>
                </div>
              ) : (
                <div className="preview-document">
                  <div className="doc-icon-preview">
                    <FiFile size={120} />
                  </div>
                  <h4>{selectedMedia.titre}</h4>
                  <p className="document-type">Document {selectedMedia.type}</p>
                  <a
                    href={buildMediaUrl(selectedMedia.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-open"
                  >
                    <FiExternalLink /> Ouvrir le document
                  </a>
                </div>
              )}

              <div className="preview-info">
                <div className="info-section">
                  <h4>Description</h4>
                  <p>{selectedMedia.description || 'Aucune description'}</p>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Type</span>
                    <span className="info-value">{selectedMedia.type}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Taille</span>
                    <span className="info-value">{selectedMedia.taille || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date d'ajout</span>
                    <span className="info-value">
                      {selectedMedia.created_at ? new Date(selectedMedia.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">URL</span>
                    <span className="info-value url" title={buildMediaUrl(selectedMedia.url)}>
                      {buildMediaUrl(selectedMedia.url).substring(0, 80)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="preview-actions">
              <button onClick={() => copyUrl(buildMediaUrl(selectedMedia.url))} className="action-btn secondary">
                <FiCopy /> Copier URL
              </button>
              <button onClick={() => downloadMedia(selectedMedia)} className="action-btn primary">
                <FiDownload /> Télécharger
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .media-manager {
          padding: 24px;
          min-height: 100vh;
          background: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        
        /* Navigation */
        .media-nav {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .nav-btn {
          flex: 1;
          padding: 14px 20px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .nav-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }
        
        .nav-btn.active {
          background: #3b82f6;
          color: white;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }
        
        /* Contenu principal */
        .media-content {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        /* En-têtes */
        .section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .header-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: #eff6ff;
          color: #3b82f6;
        }
        
        .section-subtitle {
          color: #64748b;
          margin-top: 4px;
          font-size: 14px;
        }
        
        /* Zone de drop */
        .drop-zone {
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: 48px 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 32px;
          background: #f8fafc;
        }
        
        .drop-zone.drag-over {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .drop-zone svg {
          color: #94a3b8;
          margin-bottom: 16px;
        }
        
        .drop-zone-content h4 {
          margin: 16px 0 8px;
          color: #1e293b;
          font-size: 18px;
          font-weight: 600;
        }
        
        .formats-info {
          color: #64748b;
          font-size: 14px;
          margin: 16px auto;
          max-width: 600px;
          line-height: 1.5;
        }
        
        .browse-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        
        .browse-btn:hover {
          background: #2563eb;
        }
        
        /* Grille de fichiers */
        .files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          margin: 24px 0;
        }
        
        .file-item {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
          position: relative;
          background: white;
        }
        
        .file-item:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .file-preview {
          height: 140px;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .file-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .file-item:hover .file-preview img {
          transform: scale(1.05);
        }
        
        .file-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          color: white;
        }
        
        .file-preview:hover .file-overlay {
          opacity: 1;
        }
        
        .video-thumb, .doc-thumb {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #64748b;
        }
        
        .video-play-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.7);
          padding: 12px;
          border-radius: 50%;
          color: white;
        }
        
        .file-info {
          padding: 16px;
          background: white;
        }
        
        .file-name {
          font-weight: 600;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #1e293b;
          font-size: 14px;
        }
        
        .file-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #64748b;
        }
        
        .remove-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        
        .remove-btn:hover {
          background: #dc2626;
        }
        
        /* Formulaire */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .full-width {
          grid-column: 1 / -1;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #334155;
          font-size: 14px;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: white;
          font-family: inherit;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .input-with-icon {
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        
        .input-with-icon input {
          padding-left: 40px;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          gap: 10px;
        }
        
        .checkbox-text {
          font-size: 14px;
          color: #334155;
        }
        
        /* Statistiques améliorées */
        .library-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          min-width: 160px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
          flex: 1;
        }
        
        .stat-card:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        
        .stat-icon.all { background: #f3f4f6; color: #374151; }
        .stat-icon.image { background: #dbeafe; color: #1d4ed8; }
        .stat-icon.video { background: #fee2e2; color: #dc2626; }
        .stat-icon.document { background: #dcfce7; color: #15803d; }
        
        .stat-count {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          display: block;
        }
        
        .stat-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Contrôles améliorés */
        .library-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          flex-wrap: wrap;
        }
        
        .controls-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          flex-wrap: wrap;
        }
        
        .controls-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .search-box {
          position: relative;
          min-width: 300px;
          flex: 1;
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        
        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: white;
        }
        
        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .filter-dropdown, .sort-dropdown {
          position: relative;
        }
        
        .filter-select, .sort-select {
          padding: 10px 36px 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          color: #334155;
          cursor: pointer;
          appearance: none;
          min-width: 140px;
        }
        
        .view-toggle {
          display: flex;
          gap: 4px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 8px;
        }
        
        .view-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s ease;
        }
        
        .view-btn:hover {
          background: #e2e8f0;
          color: #475569;
        }
        
        .view-btn.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .refresh-btn {
          width: 48px;
          height: 48px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s ease;
        }
        
        .refresh-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          transform: rotate(45deg);
        }
        
        .btn-add-new {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .btn-add-new:hover {
          background: #2563eb;
        }
        
        /* Compteur média */
        .media-count {
          margin-bottom: 20px;
          color: #64748b;
          font-size: 14px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #e2e8f0;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          color: #475569;
        }
        
        .clear-filter {
          background: none;
          border: none;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          border-radius: 50%;
          padding: 0;
        }
        
        .clear-filter:hover {
          background: #cbd5e1;
          color: #475569;
        }
        
        /* Boutons */
        .btn-upload,
        .btn-add-url {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          margin-top: 32px;
        }
        
        .btn-upload:hover:not(:disabled),
        .btn-add-url:hover:not(:disabled) {
          background: #2563eb;
        }
        
        .btn-upload:disabled,
        .btn-add-url:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .clear-btn {
          background: transparent;
          color: #64748b;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .clear-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }
        
        /* Grille média */
        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        
        .media-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
          background: white;
        }
        
        .media-card:hover {
          border-color: #3b82f6;
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .media-thumb {
          height: 180px;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .media-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
       
        
        .video-thumbnail, .doc-thumbnail {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #64748b;
          position: relative;
        }
        
        .video-play-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.7);
          padding: 16px;
          border-radius: 50%;
          color: white;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .media-card:hover .video-play-overlay {
          opacity: 1;
        }
        
        .doc-icon-large {
          color: #3b82f6;
        }
        
        .media-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          color: white;
          gap: 8px;
          font-weight: 500;
        }
        
        .media-card:hover .media-overlay {
          opacity: 1;
        }
        
        .featured-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #fef3c7;
          color: #92400e;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .media-info {
          padding: 20px;
          background: white;
        }
        
        .media-info h4 {
          margin: 0 0 8px 0;
          font-size: 15px;
          color: #1e293b;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .media-desc {
          color: #64748b;
          font-size: 13px;
          margin-bottom: 16px;
          line-height: 1.4;
          height: 36px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .media-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .type-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .type-badge.image { background: #dbeafe; color: #1d4ed8; }
        .type-badge.video { background: #fee2e2; color: #dc2626; }
        .type-badge.document { background: #dcfce7; color: #15803d; }
        
        .media-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        
        .action-btn {
          padding: 10px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #64748b;
        }
        
        .action-btn.preview:hover { background: #eff6ff; color: #3b82f6; border-color: #bfdbfe; }
        .action-btn.copy:hover { background: #f8fafc; color: #475569; border-color: #e2e8f0; }
        .action-btn.download:hover { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
        .action-btn.delete:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        
        .action-btn:hover {
          transform: translateY(-2px);
        }
        
        /* Vue liste */
        .media-container.list {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .media-list {
          background: white;
        }
        
        .media-list-item {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          transition: all 0.2s ease;
          gap: 20px;
        }
        
        .media-list-item:hover {
          background: #f8fafc;
        }
        
        .media-list-item:last-child {
          border-bottom: none;
        }
        
        .list-thumb {
          width: 80px;
          height: 60px;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
        }
        
        .list-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .list-video-thumb, .list-doc-thumb {
          color: #64748b;
        }
        
        .list-info {
          flex: 1;
          min-width: 0;
        }
        
        .list-main {
          margin-bottom: 8px;
        }
        
        .list-info h4 {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .list-desc {
          color: #64748b;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .list-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .list-type {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2px 8px;
          border-radius: 12px;
        }
        
        .list-type.image { background: #dbeafe; color: #1d4ed8; }
        .list-type.video { background: #fee2e2; color: #dc2626; }
        .list-type.document { background: #dcfce7; color: #15803d; }
        
        .list-size, .list-date {
          font-size: 12px;
          color: #64748b;
        }
        
        .list-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        
        .list-actions button {
          width: 36px;
          height: 36px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s ease;
        }
        
        .list-actions button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        
        /* Modal d'aperçu */
        .preview-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
        }
        
        .preview-content {
        display: flex;
          flex-direction: column;
          position: relative;
          background: white;
          border-radius: 16px;
          justify-self: center;
          width: 100%;
          max-width: 1000px;
          max-height: 90vh;
          overflow: hidden;
          z-index: 1001;
          animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid #e2e8f0;
          background: white;
        }
        
        .preview-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .preview-title h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }
        
        .preview-type {
          background: #f1f5f9;
          color: #64748b;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .close-btn {
          background: #f1f5f9;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s ease;
        }
        
        .close-btn:hover {
          background: #e2e8f0;
          color: #475569;
        }
        
        .preview-body {
          padding: 32px;
          overflow-y: auto;
          max-height: 70vh;
        }
        
        /* Prévisualisation vidéo */
        .preview-video-container {
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .preview-image-container {
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .preview-image {
          width: 100%;
          max-height: 500px;
          display: block;
        }
        
        .video-wrapper {
          position: relative;
          background: #000;
        }
        
        .preview-video {
          width: 100%;
          max-height: 500px;
          display: block;
        }

        
        
        .video-controls-overlay {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          background: rgba(0,0,0,0.7);
          padding: 10px 20px;
          border-radius: 50px;
        }
        
        .video-control-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.2s ease;
        }
        
        .video-control-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .video-info {
          padding: 12px 20px;
          background: rgba(0,0,0,0.8);
          color: white;
          font-size: 14px;
          text-align: center;
        }
        
        .preview-document {
          text-align: center;
          padding: 48px 32px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        
        .doc-icon-preview {
          margin-bottom: 16px;
          color: #3b82f6;
        }
        
        .preview-document h4 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 18px;
        }
        
        .document-type {
          color: #64748b;
          margin-bottom: 24px;
          font-size: 14px;
        }
        
        .btn-open {
          display: inline-block;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        
        .btn-open:hover {
          background: #2563eb;
        }
        
        .preview-info {
          padding: 24px;
          background: #f8fafc;
          border-radius: 12px;
          margin-top: 24px;
        }
        
        .info-section h4 {
          margin: 0 0 12px 0;
          color: #1e293b;
          font-size: 16px;
          font-weight: 600;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .info-item.full-width {
          grid-column: 1 / -1;
        }
        
        .info-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          font-weight: 500;
          color: #1e293b;
          word-break: break-word;
          font-size: 14px;
        }
        
        .info-value.url {
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 12px;
          color: #3b82f6;
          padding: 8px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .preview-actions {
          padding: 24px 32px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          background: white;
        }
        
        .preview-actions button {
          padding: 12px 24px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          color: #475569;
        }
        
        .preview-actions .secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        
        .preview-actions .primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .preview-actions .primary:hover {
          background: #2563eb;
          border-color: #2563eb;
        }
        
        /* Barre de progression */
        .progress-container {
          margin: 24px 0;
        }
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: #64748b;
        }
        
        .progress-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
          border-radius: 4px;
        }
        
        /* Spinner */
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* États */
        .loading-state {
          text-align: center;
          padding: 60px 30px;
        }
        
        .loading-state .spinner {
          width: 32px;
          height: 32px;
          border-width: 3px;
          margin: 0 auto 16px;
          border-color: #cbd5e1;
          border-top-color: #3b82f6;
        }
        
        .empty-library {
          text-align: center;
          padding: 60px 30px;
          color: #64748b;
        }
        
        .empty-library svg {
          margin-bottom: 16px;
          color: #cbd5e1;
        }
        
        .empty-library h4 {
          margin: 0 0 8px 0;
          color: #475569;
          font-size: 18px;
        }
        
        .empty-library p {
          margin-bottom: 24px;
          font-size: 14px;
        }
        
        .btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .btn-primary:hover {
          background: #2563eb;
        }
        
        /* Notifications toast */
        .toast-notification {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #10b981;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1002;
          animation: slideIn 0.3s ease;
        }
        
        .toast-notification.success {
          background: #10b981;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        /* Responsive */
        @media (max-width: 1200px) {
          .library-stats {
            flex-wrap: wrap;
          }
          
          .stat-card {
            min-width: calc(50% - 8px);
          }
        }
        
        @media (max-width: 768px) {
          .media-manager {
            padding: 16px;
          }
          
          .media-nav {
            flex-direction: column;
          }
          
          .nav-btn {
            width: 100%;
          }
          
          .media-content {
            padding: 20px;
          }
          
          .library-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .controls-left, .controls-right {
            width: 100%;
          }
          
          .controls-right {
            justify-content: space-between;
          }
          
          .search-box {
            min-width: 100%;
          }
          
          .library-stats {
            flex-direction: column;
          }
          
          .stat-card {
            width: 100%;
          }
          
          .media-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }
          
          .files-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }
          
          .form-row {
            flex-direction: column;
            gap: 12px;
          }
          
          .media-container.list .media-list-item {
            flex-wrap: wrap;
            gap: 12px;
          }
          
          .list-actions {
            width: 100%;
            justify-content: flex-end;
          }
          
          .preview-content {
            margin: 0;
          }
          
          .preview-actions {
            flex-direction: column;
          }
          
          .preview-actions button {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          .media-grid {
            grid-template-columns: 1fr;
          }
          
          .drop-zone {
            padding: 32px 20px;
          }
          
          .section-header {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }
          
          .header-icon {
            margin: 0 auto;
          }
        }

        
      `}</style>
    </div>
  );
};

export default Gallery;