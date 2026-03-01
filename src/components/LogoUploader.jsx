import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUpload, FiImage, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const LogoUploader = () => {
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [currentLogo, setCurrentLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewUrl, setPreviewUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentLogo();
  }, []);

  const fetchCurrentLogo = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/logo');
      setCurrentLogo(response.data);
      setPreviewUrl(response.data.logo_url);
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('error', 'Erreur lors du chargement du logo');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!logoUrl) {
      showMessage('error', 'Veuillez entrer une URL pour le logo');
      return;
    }

    // Validation de l'URL
    try {
      new URL(logoUrl);
    } catch (error) {
      showMessage('error', 'Veuillez entrer une URL valide');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/logo/upload', {
        logo_url: logoUrl,
        description: description
      });
      
      showMessage('success', response.data.message);
      setLogoUrl('');
      setDescription('');
      fetchCurrentLogo();
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('error', error.response?.data?.error || 'Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer le logo personnalisé ?\nLe logo par défaut sera restauré.')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete('/api/logo');
      showMessage('success', 'Logo supprimé avec succès');
      fetchCurrentLogo();
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('error', error.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (e) => {
    const url = e.target.value;
    setLogoUrl(url);
    setPreviewUrl(url);
  };

  const handleResetPreview = () => {
    setPreviewUrl(currentLogo?.logo_url || '/assets/logo-default.png');
    setLogoUrl('');
  };

  if (loading && !currentLogo) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Chargement de la gestion du logo...</p>
      </div>
    );
  }

  return (
    <div className="logo-uploader-container">
      <div className="header">
        <div className="header-left">
          <button className="btn btn-sm" onClick={() => navigate('/')}>
            <FiArrowLeft /> Retour
          </button>
          <h1>Gestion du Logo</h1>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="logo-management-grid">
        <div className="card">
          <div className="card-header">
            <h3><FiImage /> Logo Actuel</h3>
          </div>
          <div className="card-body">
            <div className="current-logo-section">
              <div className="logo-preview-large">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Logo de l'association" 
                    className="logo-image-large"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/logo-default.png';
                    }}
                  />
                ) : (
                  <div className="logo-placeholder-large">
                    <FiImage size={80} />
                    <p>Aucun logo</p>
                  </div>
                )}
              </div>
              
              {currentLogo && (
                <div className="logo-details">
                  <h4>Détails du logo</h4>
                  <div className="detail-item">
                    <strong>URL:</strong>
                    <div className="logo-url">{currentLogo.logo_url}</div>
                  </div>
                  <div className="detail-item">
                    <strong>Description:</strong>
                    <p>{currentLogo.description}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Statut:</strong>
                    <span className={`badge ${currentLogo.is_default ? 'badge-warning' : 'badge-success'}`}>
                      {currentLogo.is_default ? 'Logo par défaut' : 'Logo personnalisé'}
                    </span>
                  </div>
                  {currentLogo.updated_at && (
                    <div className="detail-item">
                      <strong>Dernière mise à jour:</strong>
                      <p>{new Date(currentLogo.updated_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><FiUpload /> Modifier le Logo</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>URL du logo *</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://exemple.com/logo.png"
                  value={logoUrl}
                  onChange={handlePreview}
                  required
                  disabled={loading}
                />
                <small className="form-text">
                  Entrez l'URL complète de l'image (PNG, JPG ou SVG)
                </small>
              </div>

              <div className="form-group">
                <label>Description (optionnel)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Logo principal 2024"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="preview-section">
                <h5>Aperçu</h5>
                <div className="logo-preview-small">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Aperçu du logo" 
                      className="logo-image-small"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/logo-default.png';
                      }}
                    />
                  ) : (
                    <div className="logo-placeholder-small">
                      <FiImage size={30} />
                      <p>Aperçu</p>
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  className="btn btn-sm btn-secondary"
                  onClick={handleResetPreview}
                  disabled={loading || !logoUrl}
                >
                  Réinitialiser l'aperçu
                </button>
              </div>

              <div className="action-buttons">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || !logoUrl}
                >
                  <FiSave /> {loading ? 'En cours...' : 'Sauvegarder le logo'}
                </button>
                
                {currentLogo && !currentLogo.is_default && (
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <FiTrash2 /> Supprimer le logo personnalisé
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Conseils pour le logo</h3>
        </div>
        <div className="card-body">
          <div className="tips-grid">
            <div className="tip-item">
              <div className="tip-icon">📐</div>
              <div className="tip-content">
                <h5>Format recommandé</h5>
                <p>PNG avec fond transparent</p>
              </div>
            </div>
            
            <div className="tip-item">
              <div className="tip-icon">📏</div>
              <div className="tip-content">
                <h5>Dimensions</h5>
                <p>200x200 pixels minimum</p>
              </div>
            </div>
            
            <div className="tip-item">
              <div className="tip-icon">💾</div>
              <div className="tip-content">
                <h5>Taille maximale</h5>
                <p>2MB pour une bonne performance</p>
              </div>
            </div>
            
            <div className="tip-item">
              <div className="tip-icon">🌐</div>
              <div className="tip-content">
                <h5>Accessibilité</h5>
                <p>Assurez-vous que l'URL est accessible publiquement</p>
              </div>
            </div>
            
            <div className="tip-item">
              <div className="tip-icon">🎨</div>
              <div className="tip-content">
                <h5>Couleurs</h5>
                <p>Utilisez des couleurs cohérentes avec votre marque</p>
              </div>
            </div>
            
            <div className="tip-item">
              <div className="tip-icon">✨</div>
              <div className="tip-content">
                <h5>Qualité</h5>
                <p>Utilisez une image haute résolution pour tous les appareils</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoUploader;