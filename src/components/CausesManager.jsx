// components/CausesManager.jsx
import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiUpload,
  FiX,
  FiSave,
  FiArrowUp,
  FiArrowDown,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { apiService } from './api';
import axios from 'axios';

const CausesManager = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCause, setEditingCause] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    nb_projets: '',
    nb_projets_termines: '',
    statut: 'actif',
    ordre: 0,
    icone: null
  });

  // Charger les causes
  useEffect(() => {
    fetchCauses();
  }, []);

  const fetchCauses = async () => {
    try {
      setLoading(true);
      // Utiliser directement axios pour plus de contrôle
      const token = localStorage.getItem('token');
      const response = await axios.get('https://ypsbackend.vercel.app/api/admin/causes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCauses(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des piliers');
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer l'upload d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB');
        return;
      }

      // Vérifier le type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        icone: file
      }));

      // Prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      nb_projets: '',
      nb_projets_termines: '',
      statut: 'actif',
      ordre: causes.length > 0 ? Math.max(...causes.map(c => c.ordre)) + 1 : 1,
      icone: null
    });
    setPreviewImage(null);
    setEditingCause(null);
  };

  // Ouvrir le formulaire pour créer
  const handleCreateClick = () => {
    resetForm();
    setShowForm(true);
  };

  // Ouvrir le formulaire pour éditer
  const handleEditClick = async (cause) => {
    try {
      setLoadingAction(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://ypsbackend.vercel.app/api/admin/causes/${cause.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const causeData = response.data;
      
      setEditingCause(causeData);
      setFormData({
        nom: causeData.nom,
        description: causeData.description,
        nb_projets: causeData.nb_projets,
        nb_projets_termines: causeData.nb_projets_termines,
        statut: causeData.statut,
        ordre: causeData.ordre,
        icone: null
      });
      
      // Si la cause a une icône, l'afficher en prévisualisation
      if (causeData.icone) {
        setPreviewImage(causeData.icone);
      }
      
      setShowForm(true);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement du pilier');
    } finally {
      setLoadingAction(false);
    }
  };

  // Demander confirmation pour la suppression
  const handleDeleteClick = (cause) => {
    setDeleteConfirm(cause);
  };

  // Confirmer la suppression
  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setLoadingAction(true);
      const token = localStorage.getItem('token');
      await axios.delete(`https://ypsbackend.vercel.app/api/admin/causes/${deleteConfirm.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      alert('Pilier supprimée avec succès');
      setDeleteConfirm(null);
      fetchCauses();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setLoadingAction(false);
    }
  };

  // Annuler la suppression
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Soumettre le formulaire (création ou mise à jour)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loadingAction) return;
    
    try {
      setLoadingAction(true);
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Ajouter les champs texte
      Object.keys(formData).forEach(key => {
        if (key !== 'icone' && formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Ajouter l'image si elle existe
      if (formData.icone && typeof formData.icone !== 'string') {
        formDataToSend.append('icone', formData.icone);
      }

      let response;
      if (editingCause) {
        // Mise à jour
        response = await axios.put(`https://ypsbackend.vercel.app/api/admin/causes/${editingCause.id}`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Cause mise à jour avec succès');
      } else {
        // Création
        response = await axios.post('https://ypsbackend.vercel.app/api/admin/causes', formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Cause créée avec succès');
      }

      // Réinitialiser et rafraîchir
      setShowForm(false);
      resetForm();
      fetchCauses();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoadingAction(false);
    }
  };

  // Changer l'ordre
  const handleOrderChange = async (causeId, direction) => {
    try {
      setLoadingAction(true);
      const token = localStorage.getItem('token');
      await axios.put(`https://ypsbackend.vercel.app/api/admin/causes/${causeId}/order`, 
        { direction },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchCauses();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification de l\'ordre');
    } finally {
      setLoadingAction(false);
    }
  };

  // Toggle statut
  const handleToggleStatus = async (cause) => {
    try {
      setLoadingAction(true);
      const token = localStorage.getItem('token');
      const newStatus = cause.statut === 'actif' ? 'inactif' : 'actif';
      
      const formData = new FormData();
      formData.append('statut', newStatus);
      formData.append('nom', cause.nom);
      formData.append('description', cause.description);
      formData.append('nb_projets', cause.nb_projets);
      formData.append('nb_projets_termines', cause.nb_projets_termines);
      formData.append('ordre', cause.ordre);
      
      // Si la cause a une icône, il faut la renvoyer aussi
      if (cause.icone && cause.icone.includes('http')) {
        // C'est une URL, on ne peut pas l'envoyer dans FormData
        // On extrait juste le nom du fichier pour le backend
        const filename = cause.icone.split('/').pop();
        formData.append('icone', filename);
      }
      
      await axios.put(`https://ypsbackend.vercel.app/api/admin/causes/${cause.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      fetchCauses();
      alert(`Statut changé à: ${newStatus === 'actif' ? 'Actif' : 'Inactif'}`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de statut');
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des piliers...</p>
      </div>
    );
  }

  return (
    <div className="causes-manager">
      {/* Modal de confirmation de suppression */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirmer la suppression</h3>
              <button onClick={cancelDelete} className="modal-close">
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer la pilier :</p>
              <p className="delete-item-name"><strong>{deleteConfirm.nom}</strong></p>
              <p className="text-warning">Cette action est irréversible !</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={cancelDelete} 
                className="btn btn-secondary"
                disabled={loadingAction}
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete} 
                className="btn btn-danger"
                disabled={loadingAction}
              >
                {loadingAction ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">Gestion des Piliers</h2>
          <button 
            className="btn btn-primary"
            onClick={handleCreateClick}
            disabled={loadingAction}
          >
            <FiPlus /> Nouveau Pilier
          </button>
        </div>

        {showForm && (
          <div className="form-modal">
            <div className="form-content">
              <div className="form-header">
                <h3>{editingCause ? 'Modifier le Pilier' : 'Nouveau Pilier'}</h3>
                <button 
                  className="btn btn-icon"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={loadingAction}
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  {/* Nom */}
                  <div className="form-group">
                    <label>Nom du Pilier *</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                      placeholder="Ex: Sécurité alimentaire"
                      disabled={loadingAction}
                    />
                  </div>

                  {/* Ordre */}
                  <div className="form-group">
                    <label>Ordre d'affichage</label>
                    <input
                      type="number"
                      name="ordre"
                      value={formData.ordre}
                      onChange={handleInputChange}
                      className="form-control"
                      min="0"
                      disabled={loadingAction}
                    />
                    <small className="text-muted">Plus petit = affiché en premier</small>
                  </div>

                  {/* Statut */}
                  <div className="form-group">
                    <label>Statut</label>
                    <select
                      name="statut"
                      value={formData.statut}
                      onChange={handleInputChange}
                      className="form-control"
                      disabled={loadingAction}
                    >
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
                  </div>

                  {/* Image */}
                  <div className="form-group full-width">
                    <label>Image/icône</label>
                    <div className="image-upload-container">
                      <div className="image-preview">
                        {previewImage ? (
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="preview-image"
                          />
                        ) : (
                          <div className="placeholder">
                            <FiUpload size={40} />
                            <p>Aucune image sélectionnée</p>
                          </div>
                        )}
                      </div>
                      <div className="upload-actions">
                        <label className="btn btn-secondary" style={{ opacity: loadingAction ? 0.5 : 1 }}>
                          <FiUpload /> Choisir une image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            disabled={loadingAction}
                          />
                        </label>
                        {previewImage && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => {
                              setPreviewImage(null);
                              setFormData(prev => ({ ...prev, icone: null }));
                            }}
                            disabled={loadingAction}
                          >
                            <FiX /> Supprimer
                          </button>
                        )}
                      </div>
                      <small className="text-muted">
                        Taille max: 5MB. Formats: JPG, PNG, GIF, WebP
                      </small>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="form-group full-width">
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="4"
                      required
                      placeholder="Décrivez cette cause..."
                      disabled={loadingAction}
                    />
                  </div>

                  {/* Statistiques */}
                  <div className="form-group">
                    <label>Nombre de projets</label>
                    <input
                      type="number"
                      name="nb_projets"
                      value={formData.nb_projets}
                      onChange={handleInputChange}
                      className="form-control"
                      min="0"
                      disabled={loadingAction}
                    />
                  </div>

                  <div className="form-group">
                    <label>Projets terminés</label>
                    <input
                      type="number"
                      name="nb_projets_termines"
                      value={formData.nb_projets_termines}
                      onChange={handleInputChange}
                      className="form-control"
                      min="0"
                      disabled={loadingAction}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    disabled={loadingAction}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loadingAction}
                  >
                    {loadingAction ? (
                      <span>En cours...</span>
                    ) : (
                      <>
                        <FiSave /> {editingCause ? 'Mettre à jour' : 'Créer'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Liste des causes */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Ordre</th>
                <th>Image</th>
                <th>Nom</th>
                <th>Description</th>
                <th>Statistiques</th>
                <th>Statut</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {causes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="empty-state">
                      <FiEye size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                      <p>Aucune Pilier trouvée</p>
                      <button 
                        className="btn btn-primary"
                        onClick={handleCreateClick}
                      >
                        <FiPlus /> Créer votre première Pilier
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                causes.map(cause => (
                  <tr key={cause.id}>
                    <td>
                      <div className="order-controls">
                        <button
                          className="btn btn-icon btn-sm"
                          onClick={() => handleOrderChange(cause.id, 'up')}
                          title="Monter"
                          disabled={loadingAction}
                        >
                          <FiArrowUp />
                        </button>
                        <span className="order-value">{cause.ordre}</span>
                        <button
                          className="btn btn-icon btn-sm"
                          onClick={() => handleOrderChange(cause.id, 'down')}
                          title="Descendre"
                          disabled={loadingAction}
                        >
                          <FiArrowDown />
                        </button>
                      </div>
                    </td>
                    <td>
                      {cause.icone ? (
                        <img 
                          src={cause.icone} 
                          alt={cause.nom}
                          className="cause-thumbnail"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                          }}
                        />
                      ) : (
                        <div className="no-image">Aucune image</div>
                      )}
                    </td>
                    <td>
                      <strong>{cause.nom}</strong>
                      <small className="text-muted d-block">ID: {cause.id}</small>
                    </td>
                    <td>
                      <div className="description-truncate">
                        {cause.description ? cause.description.substring(0, 100) : 'Aucune description'}...
                      </div>
                    </td>
                    <td>
                      <div className="stats">
                        <div className="stat-item">
                          <span className="stat-label">Projets:</span>
                          <span className="stat-value">{cause.nb_projets || 0}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Terminés:</span>
                          <span className="stat-value">{cause.nb_projets_termines || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="statut-indicator">
                        <span className={`badge badge-${cause.statut === 'actif' ? 'success' : 'secondary'}`}>
                          {cause.statut === 'actif' ? (
                            <>
                              <FiCheckCircle style={{ marginRight: '5px' }} /> Actif
                            </>
                          ) : (
                            <>
                              <FiXCircle style={{ marginRight: '5px' }} /> Inactif
                            </>
                          )}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-icon btn-sm"
                          onClick={() => handleToggleStatus(cause)}
                          title={cause.statut === 'actif' ? 'Désactiver' : 'Activer'}
                          disabled={loadingAction}
                        >
                          {cause.statut === 'actif' ? <FiEyeOff /> : <FiEye />}
                        </button>
                        <button
                          className="btn btn-icon btn-sm"
                          onClick={() => handleEditClick(cause)}
                          title="Modifier"
                          disabled={loadingAction}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn btn-icon btn-sm btn-danger"
                          onClick={() => handleDeleteClick(cause)}
                          title="Supprimer"
                          disabled={loadingAction}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .causes-manager {
          position: relative;
        }

        .form-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .form-content {
          background: white;
          border-radius: 10px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          padding: 20px;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px;
          border-top: 1px solid #eee;
        }

        .image-upload-container {
          margin-top: 10px;
        }

        .image-preview {
          width: 200px;
          height: 150px;
          border: 2px dashed #ddd;
          border-radius: 8px;
          margin-bottom: 15px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder {
          text-align: center;
          color: #999;
        }

        .upload-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .order-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .order-value {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .cause-thumbnail {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 5px;
        }

        .no-image {
          width: 60px;
          height: 60px;
          background: #f5f5f5;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 0.8rem;
        }

        .description-truncate {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .stats {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
        }

        .stat-label {
          color: #666;
          font-size: 0.8rem;
        }

        .stat-value {
          font-weight: bold;
          color: #3498db;
        }

        .statut-indicator .badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 10px;
        }

        .action-buttons {
          display: flex;
          gap: 5px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 40px;
        }

        /* Modal de confirmation */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
        }

        .modal-content {
          background: white;
          border-radius: 10px;
          width: 90%;
          max-width: 500px;
          padding: 0;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h3 {
          margin: 0;
          color: #e74c3c;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 20px;
        }

        .delete-item-name {
          font-size: 1.2rem;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
          margin: 10px 0;
        }

        .text-warning {
          color: #e74c3c;
          font-weight: 500;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px;
          border-top: 1px solid #eee;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-content {
            margin: 10px;
            max-height: 80vh;
          }
        }

        /* Désactivation pendant le chargement */
        button:disabled,
        input:disabled,
        select:disabled,
        textarea:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn:disabled {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default CausesManager;