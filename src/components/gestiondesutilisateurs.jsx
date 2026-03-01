import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiUserPlus, 
  FiToggleLeft, 
  FiToggleRight, 
  FiMail, 
  FiPhone, 
  FiEdit, 
  FiTrash2,
  FiSearch,
  FiDownload,
  FiUser,
  FiCalendar,
  FiStar
} from 'react-icons/fi';
import '../App.css';

const GestionUtilisateurs = () => {
  const [activeTab, setActiveTab] = useState('benevoles');
  const [benevoles, setBenevoles] = useState([]);
  const [membres, setMembres] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showModalMembre, setShowModalMembre] = useState(false);
  const [showEditModalMembre, setShowEditModalMembre] = useState(false);
  const [showDeleteModalMembre, setShowDeleteModalMembre] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    competences: '',
    disponibilite: 'ponctuel',
    statut: 'actif'
  });
  const [formDataMembre, setFormDataMembre] = useState({
    nom: '',
    email: '',
    date_adhesion: '',
    cotisation_payee: false
  });

  useEffect(() => {
    if (activeTab === 'benevoles') {
      fetchBenevoles();
    } else {
      fetchMembres();
    }
  }, [activeTab]);

  const fetchBenevoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/benevoles');
      setBenevoles(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des bénévoles');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembres = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/membres');
      setMembres(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    if (activeTab === 'benevoles') {
      setFormData(prev => ({
        ...prev,
        [name]: inputValue
      }));
    } else {
      setFormDataMembre(prev => ({
        ...prev,
        [name]: inputValue
      }));
    }
  };

  // CREATE - Ajouter un bénévole
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/benevoles', formData);
      alert('Bénévole ajouté avec succès');
      setShowModal(false);
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        competences: '',
        disponibilite: 'ponctuel',
        statut: 'actif'
      });
      fetchBenevoles();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout du bénévole');
    }
  };

  // CREATE - Ajouter un membre
  const handleSubmitMembre = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/membres', formDataMembre);
      alert('Membre ajouté avec succès');
      setShowModalMembre(false);
      setFormDataMembre({
        nom: '',
        email: '',
        date_adhesion: '',
        cotisation_payee: false
      });
      fetchMembres();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout du membre');
    }
  };

  // UPDATE - Modifier un bénévole
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/benevoles/${selectedUser.id}`, formData);
      alert('Bénévole modifié avec succès');
      setShowEditModal(false);
      fetchBenevoles();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification du bénévole');
    }
  };

  // UPDATE - Modifier un membre
  const handleUpdateMembre = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/membres/${selectedUser.id}`, formDataMembre);
      alert('Membre modifié avec succès');
      setShowEditModalMembre(false);
      fetchMembres();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification du membre');
    }
  };

  // DELETE - Supprimer un bénévole
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/benevoles/${selectedUser.id}`);
      alert('Bénévole supprimé avec succès');
      setShowDeleteModal(false);
      fetchBenevoles();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du bénévole');
    }
  };

  // DELETE - Supprimer un membre
  const handleDeleteMembre = async () => {
    try {
      await axios.delete(`/api/membres/${selectedUser.id}`);
      alert('Membre supprimé avec succès');
      setShowDeleteModalMembre(false);
      fetchMembres();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du membre');
    }
  };

  const toggleStatut = async (id, currentStatut) => {
    try {
      const newStatut = currentStatut === 'actif' ? 'inactif' : 'actif';
      await axios.put(`/api/benevoles/${id}/statut`, { statut: newStatut });
      fetchBenevoles();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  // Toggle cotisation
  const toggleCotisation = async (id, currentStatus) => {
    try {
      await axios.put(`/api/membres/${id}/cotisation`, { 
        cotisation_payee: !currentStatus 
      });
      fetchMembres();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de statut de cotisation');
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    if (activeTab === 'benevoles') {
      setFormData({
        nom: user.nom,
        email: user.email,
        telephone: user.telephone || '',
        competences: user.competences || '',
        disponibilite: user.disponibilite,
        statut: user.statut
      });
      setShowEditModal(true);
    } else {
      setFormDataMembre({
        nom: user.nom,
        email: user.email,
        date_adhesion: user.date_adhesion ? new Date(user.date_adhesion).toISOString().split('T')[0] : '',
        cotisation_payee: user.cotisation_payee
      });
      setShowEditModalMembre(true);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    if (activeTab === 'benevoles') {
      setShowDeleteModal(true);
    } else {
      setShowDeleteModalMembre(true);
    }
  };

  const exporterCSV = () => {
    const data = activeTab === 'benevoles' ? benevoles : membres;
    const headers = activeTab === 'benevoles' 
      ? ['ID', 'Nom', 'Email', 'Téléphone', 'Compétences', 'Disponibilité', 'Statut', 'Date Inscription']
      : ['ID', 'Nom', 'Email', 'Date Adhésion', 'Cotisation', 'Date Inscription'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        if (activeTab === 'benevoles') {
          return [
            item.id,
            `"${item.nom}"`,
            `"${item.email}"`,
            `"${item.telephone || ''}"`,
            `"${item.competences || ''}"`,
            item.disponibilite,
            item.statut,
            new Date(item.date_inscription).toLocaleDateString('fr-FR')
          ].join(',');
        } else {
          return [
            item.id,
            `"${item.nom}"`,
            `"${item.email}"`,
            item.date_adhesion || '',
            item.cotisation_payee ? 'Payée' : 'En attente',
            new Date(item.created_at).toLocaleDateString('fr-FR')
          ].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrer les bénévoles
  const filteredBenevoles = benevoles.filter(benevole => {
    if (filterStatut !== 'tous' && benevole.statut !== filterStatut) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        benevole.nom.toLowerCase().includes(term) ||
        benevole.email.toLowerCase().includes(term) ||
        (benevole.competences && benevole.competences.toLowerCase().includes(term))
      );
    }
    return true;
  });

  // Filtrer les membres
  const filteredMembres = membres.filter(membre => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        membre.nom.toLowerCase().includes(term) ||
        membre.email.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Calculer les statistiques
  const stats = {
    totalBenevoles: benevoles.length,
    benevolesActifs: benevoles.filter(b => b.statut === 'actif').length,
    benevolesReguliers: benevoles.filter(b => b.disponibilite === 'regulier').length,
    totalMembres: membres.length,
    membresActifs: membres.filter(m => m.cotisation_payee).length
  };

  return (
    <div>
      <div className="header">
        <h1>Gestion des Utilisateurs</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="btn btn-success"
            onClick={() => {
              if (activeTab === 'benevoles') {
                setFormData({
                  nom: '',
                  email: '',
                  telephone: '',
                  competences: '',
                  disponibilite: 'ponctuel',
                  statut: 'actif'
                });
                setShowModal(true);
              } else {
                setFormDataMembre({
                  nom: '',
                  email: '',
                  date_adhesion: '',
                  cotisation_payee: false
                });
                setShowModalMembre(true);
              }
            }}
          >
            <FiUserPlus /> Ajouter {activeTab === 'benevoles' ? 'Bénévole' : 'Membre'}
          </button>
          <button className="btn btn-primary" onClick={exporterCSV}>
            <FiDownload /> Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eafaf1', color: '#27ae60' }}>
            <FiUser />
          </div>
          <div className="stat-info">
            <h3>{stats.totalBenevoles}</h3>
            <p>Total Bénévoles</p>
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              {stats.benevolesActifs} actifs
            </small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ebf5fb', color: '#3498db' }}>
            <FiStar />
          </div>
          <div className="stat-info">
            <h3>{stats.benevolesReguliers}</h3>
            <p>Bénévoles Réguliers</p>
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              {Math.round((stats.benevolesReguliers / stats.totalBenevoles) * 100) || 0}%
            </small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef5e7', color: '#f39c12' }}>
            <FiUser />
          </div>
          <div className="stat-info">
            <h3>{stats.totalMembres}</h3>
            <p>Total Membres</p>
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              {stats.membresActifs} cotisations payées
            </small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f5eef8', color: '#9b59b6' }}>
            <FiCalendar />
          </div>
          <div className="stat-info">
            <h3>{benevoles.length > 0 ? new Date(benevoles[0].date_inscription).toLocaleDateString('fr-FR', { month: 'short' }) : '-'}</h3>
            <p>Dernière inscription</p>
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              {benevoles.length} ce mois
            </small>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card" style={{ marginBottom: '20px' }}>
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
              placeholder={`Rechercher ${activeTab === 'benevoles' ? 'un bénévole...' : 'un membre...'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          {activeTab === 'benevoles' && (
            <select 
              className="form-control"
              style={{ width: '150px' }}
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <option value="tous">Tous les statuts</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Inactifs</option>
            </select>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              className={`btn ${activeTab === 'benevoles' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('benevoles')}
            >
              Bénévoles ({stats.totalBenevoles})
            </button>
            <button 
              className={`btn ${activeTab === 'membres' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('membres')}
            >
              Membres ({stats.totalMembres})
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p>Chargement...</p>
          </div>
        ) : activeTab === 'benevoles' ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Contact</th>
                  <th>Compétences</th>
                  <th>Disponibilité</th>
                  <th>Statut</th>
                  <th>Inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBenevoles.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                      <FiUser size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                      <p>Aucun bénévole trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredBenevoles.map(benevole => (
                    <tr key={benevole.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', color: '#666' }}>
                          #{benevole.id.toString().padStart(3, '0')}
                        </span>
                      </td>
                      <td>
                        <strong>{benevole.nom}</strong>
                      </td>
                      <td>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FiMail size={14} /> {benevole.email}
                          </div>
                          {benevole.telephone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                              <FiPhone size={14} /> {benevole.telephone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px' }}>
                          {benevole.competences ? (
                            <span style={{
                              display: 'inline-block',
                              backgroundColor: '#ebf5fb',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.85rem'
                            }}>
                              {benevole.competences.split(',').slice(0, 2).join(', ')}
                              {benevole.competences.split(',').length > 2 && '...'}
                            </span>
                          ) : (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>Non renseigné</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${benevole.disponibilite === 'regulier' ? 'badge-success' : 'badge-warning'}`}>
                          {benevole.disponibilite === 'regulier' ? 'Régulier' : 'Ponctuel'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${benevole.statut === 'actif' ? 'badge-success' : 'badge-danger'}`}>
                          {benevole.statut === 'actif' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        {new Date(benevole.date_inscription).toLocaleDateString('fr-FR')}
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          il y a {Math.floor((new Date() - new Date(benevole.date_inscription)) / (1000 * 60 * 60 * 24))} jours
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            className="btn btn-sm"
                            onClick={() => handleEditClick(benevole)}
                            title="Modifier"
                          >
                            <FiEdit />
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteClick(benevole)}
                            title="Supprimer"
                          >
                            <FiTrash2 />
                          </button>
                          <button 
                            className="btn btn-sm"
                            onClick={() => toggleStatut(benevole.id, benevole.statut)}
                            title={benevole.statut === 'actif' ? 'Désactiver' : 'Activer'}
                            style={{ 
                              backgroundColor: benevole.statut === 'actif' ? '#f8d7da' : '#d4edda',
                              color: benevole.statut === 'actif' ? '#721c24' : '#155724'
                            }}
                          >
                            {benevole.statut === 'actif' ? <FiToggleRight /> : <FiToggleLeft />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Date d'adhésion</th>
                  <th>Cotisation</th>
                  <th>Inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembres.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      <FiUser size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                      <p>Aucun membre trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredMembres.map(membre => (
                    <tr key={membre.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', color: '#666' }}>
                          #{membre.id.toString().padStart(3, '0')}
                        </span>
                      </td>
                      <td><strong>{membre.nom}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FiMail size={14} /> {membre.email}
                        </div>
                      </td>
                      <td>
                        {membre.date_adhesion ? (
                          new Date(membre.date_adhesion).toLocaleDateString('fr-FR')
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>Non définie</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className={`badge ${membre.cotisation_payee ? 'badge-success' : 'badge-warning'}`}
                          onClick={() => toggleCotisation(membre.id, membre.cotisation_payee)}
                          style={{ cursor: 'pointer' }}
                        >
                          {membre.cotisation_payee ? 'Payée' : 'En attente'}
                        </button>
                      </td>
                      <td>
                        {new Date(membre.created_at).toLocaleDateString('fr-FR')}
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          il y a {Math.floor((new Date() - new Date(membre.created_at)) / (1000 * 60 * 60 * 24))} jours
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            className="btn btn-sm"
                            onClick={() => handleEditClick(membre)}
                            title="Modifier"
                          >
                            <FiEdit />
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteClick(membre)}
                            title="Supprimer"
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
        )}
      </div>

      {/* MODAL - Ajouter un bénévole */}
      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Ajouter un nouveau bénévole</h3>
              <button className="btn btn-sm" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    name="nom"
                    className="form-control"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    className="form-control"
                    value={formData.telephone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Compétences</label>
                  <textarea
                    name="competences"
                    className="form-control"
                    rows="3"
                    value={formData.competences}
                    onChange={handleInputChange}
                    placeholder="Ex: Logistique, Communication, Médical, Informatique..."
                  />
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Disponibilité</label>
                    <select
                      name="disponibilite"
                      className="form-control"
                      value={formData.disponibilite}
                      onChange={handleInputChange}
                    >
                      <option value="ponctuel">Ponctuel</option>
                      <option value="regulier">Régulier</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Statut initial</label>
                    <select
                      name="statut"
                      className="form-control"
                      value={formData.statut}
                      onChange={handleInputChange}
                    >
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Ajouter le bénévole
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Ajouter un membre */}
      {showModalMembre && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Ajouter un nouveau membre</h3>
              <button className="btn btn-sm" onClick={() => setShowModalMembre(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitMembre}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    name="nom"
                    className="form-control"
                    value={formDataMembre.nom}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formDataMembre.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date d'adhésion</label>
                  <input
                    type="date"
                    name="date_adhesion"
                    className="form-control"
                    value={formDataMembre.date_adhesion}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="cotisation_payee"
                      checked={formDataMembre.cotisation_payee}
                      onChange={handleInputChange}
                    />
                    <span style={{ marginLeft: '8px' }}>Cotisation payée</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModalMembre(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Ajouter le membre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Modifier un bénévole */}
      {showEditModal && selectedUser && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Modifier le bénévole #{selectedUser.id}</h3>
              <button className="btn btn-sm" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    name="nom"
                    className="form-control"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    className="form-control"
                    value={formData.telephone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Compétences</label>
                  <textarea
                    name="competences"
                    className="form-control"
                    rows="3"
                    value={formData.competences}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Disponibilité</label>
                    <select
                      name="disponibilite"
                      className="form-control"
                      value={formData.disponibilite}
                      onChange={handleInputChange}
                    >
                      <option value="ponctuel">Ponctuel</option>
                      <option value="regulier">Régulier</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Statut</label>
                    <select
                      name="statut"
                      className="form-control"
                      value={formData.statut}
                      onChange={handleInputChange}
                    >
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ fontSize: '0.9rem', color: '#666', padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
                  <div>Date d'inscription: {new Date(selectedUser.date_inscription).toLocaleDateString('fr-FR')}</div>
                  <div>Inscrit depuis: {Math.floor((new Date() - new Date(selectedUser.date_inscription)) / (1000 * 60 * 60 * 24))} jours</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowEditModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Modifier un membre */}
      {showEditModalMembre && selectedUser && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Modifier le membre #{selectedUser.id}</h3>
              <button className="btn btn-sm" onClick={() => setShowEditModalMembre(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateMembre}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    name="nom"
                    className="form-control"
                    value={formDataMembre.nom}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formDataMembre.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date d'adhésion</label>
                  <input
                    type="date"
                    name="date_adhesion"
                    className="form-control"
                    value={formDataMembre.date_adhesion}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="cotisation_payee"
                      checked={formDataMembre.cotisation_payee}
                      onChange={handleInputChange}
                    />
                    <span style={{ marginLeft: '8px' }}>Cotisation payée</span>
                  </label>
                </div>
                <div className="form-group" style={{ fontSize: '0.9rem', color: '#666', padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
                  <div>Date d'inscription: {new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}</div>
                  <div>Inscrit depuis: {Math.floor((new Date() - new Date(selectedUser.created_at)) / (1000 * 60 * 60 * 24))} jours</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowEditModalMembre(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Confirmation de suppression bénévole */}
      {showDeleteModal && selectedUser && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Confirmer la suppression</h3>
              <button className="btn btn-sm" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <FiTrash2 size={50} color="#e74c3c" style={{ marginBottom: '20px' }} />
                <h4>Êtes-vous sûr de vouloir supprimer ce bénévole ?</h4>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '5px',
                  margin: '20px 0',
                  textAlign: 'left'
                }}>
                  <p><strong>Nom:</strong> {selectedUser.nom}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Statut:</strong> <span className={`badge ${selectedUser.statut === 'actif' ? 'badge-success' : 'badge-danger'}`}>
                    {selectedUser.statut === 'actif' ? 'Actif' : 'Inactif'}
                  </span></p>
                  <p><strong>Inscrit depuis:</strong> {Math.floor((new Date() - new Date(selectedUser.date_inscription)) / (1000 * 60 * 60 * 24))} jours</p>
                </div>
                <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                  ⚠️ Cette action est irréversible !
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - Confirmation de suppression membre */}
      {showDeleteModalMembre && selectedUser && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Confirmer la suppression</h3>
              <button className="btn btn-sm" onClick={() => setShowDeleteModalMembre(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <FiTrash2 size={50} color="#e74c3c" style={{ marginBottom: '20px' }} />
                <h4>Êtes-vous sûr de vouloir supprimer ce membre ?</h4>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '5px',
                  margin: '20px 0',
                  textAlign: 'left'
                }}>
                  <p><strong>Nom:</strong> {selectedUser.nom}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Cotisation:</strong> 
                    <span className={`badge ${selectedUser.cotisation_payee ? 'badge-success' : 'badge-warning'}`}>
                      {selectedUser.cotisation_payee ? 'Payée' : 'En attente'}
                    </span>
                  </p>
                  <p><strong>Inscrit depuis:</strong> {Math.floor((new Date() - new Date(selectedUser.created_at)) / (1000 * 60 * 60 * 24))} jours</p>
                </div>
                <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                  ⚠️ Cette action est irréversible !
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={() => setShowDeleteModalMembre(false)}>
                Annuler
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteMembre}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUtilisateurs;