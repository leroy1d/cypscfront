import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiDollarSign, 
  FiCheck, 
  FiX, 
  FiFileText, 
  FiUsers, 
  FiPlus, 
  FiEdit, 
  FiTrash2,
  FiSearch,
  FiDownload,
  FiFilter
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../App.css';

const GestionDons = () => {
  const [dons, setDons] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6mois');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDon, setSelectedDon] = useState(null);
  const [formData, setFormData] = useState({
    donateur_nom: '',
    email: '',
    montant: '',
    devise: 'EUR',
    methode_paiement: 'carte',
    projet_associe: '',
    statut: 'en_attente',
    notes: ''
  });

  useEffect(() => {
    fetchDons();
    fetchStats();
  }, []);

  const fetchDons = async () => {
    try {
      const response = await axios.get('/api/dons');
      setDons(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/dons/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // CREATE - Ajouter un nouveau don
  const handleAddDon = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/dons', formData);
      alert(response.data.message);
      setShowAddModal(false);
      resetForm();
      fetchDons();
      fetchStats();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout du don');
    }
  };

  // READ - Charger un don pour édition
  const handleEditClick = async (id) => {
    try {
      const response = await axios.get(`/api/dons/${id}`);
      setSelectedDon(response.data);
      setFormData({
        donateur_nom: response.data.donateur_nom,
        email: response.data.email,
        montant: response.data.montant,
        devise: response.data.devise,
        methode_paiement: response.data.methode_paiement,
        projet_associe: response.data.projet_associe,
        statut: response.data.statut,
        notes: response.data.notes || ''
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // UPDATE - Modifier un don
  const handleUpdateDon = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/dons/${selectedDon.id}`, {
        ...formData,
        reçu_fiscal_envoye: selectedDon.reçu_fiscal_envoye
      });
      alert('Don mis à jour avec succès');
      setShowEditModal(false);
      resetForm();
      fetchDons();
      fetchStats();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du don');
    }
  };

  // DELETE - Supprimer un don
  const handleDeleteDon = async () => {
    try {
      await axios.delete(`/api/dons/${selectedDon.id}`);
      alert('Don supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedDon(null);
      fetchDons();
      fetchStats();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du don');
    }
  };

  const updateDonStatut = async (id, statut, reçu_fiscal_envoye = false) => {
    try {
      await axios.put(`/api/dons/${id}/statut`, { 
        statut, 
        reçu_fiscal_envoye 
      });
      fetchDons();
      fetchStats();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du don');
    }
  };

  const exporterCSV = () => {
    const headers = ['ID', 'Nom', 'Email', 'Montant', 'Devise', 'Projet', 'Date', 'Statut', 'Reçu fiscal', 'Méthode'];
    const csvContent = [
      headers.join(','),
      ...dons.map(don => [
        don.id,
        `"${don.donateur_nom}"`,
        `"${don.email || ''}"`,
        don.montant,
        don.devise,
        `"${don.projet_associe || 'Général'}"`,
        `"${new Date(don.date_don).toLocaleDateString('fr-FR')}"`,
        don.statut,
        don.reçu_fiscal_envoye ? 'Oui' : 'Non',
        don.methode_paiement || 'Non spécifié'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dons_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFormData({
      donateur_nom: '',
      email: '',
      montant: '',
      devise: 'EUR',
      methode_paiement: 'carte',
      projet_associe: '',
      statut: 'en_attente',
      notes: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'valide': return 'success';
      case 'en_attente': return 'warning';
      case 'annule': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatutText = (statut) => {
    switch(statut) {
      case 'valide': return 'Validé';
      case 'en_attente': return 'En attente';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  // Filtrer les dons
  const filteredDons = dons.filter(don => {
    if (filterStatut !== 'tous' && don.statut !== filterStatut) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        don.donateur_nom.toLowerCase().includes(term) ||
        (don.email && don.email.toLowerCase().includes(term)) ||
        (don.projet_associe && don.projet_associe.toLowerCase().includes(term))
      );
    }
    return true;
  });

  // Statistiques
  const totalValide = dons
    .filter(don => don.statut === 'valide')
    .reduce((sum, don) => sum + parseFloat(don.montant), 0);

  const prepareChartData = () => {
    const moisMap = {};
    
    dons
      .filter(don => don.statut === 'valide')
      .forEach(don => {
        const date = new Date(don.date_don);
        const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const moisNom = date.toLocaleDateString('fr-FR', { month: 'short' });
        
        if (!moisMap[moisKey]) {
          moisMap[moisKey] = {
            mois: moisNom,
            montant: 0,
            count: 0
          };
        }
        moisMap[moisKey].montant += parseFloat(don.montant);
        moisMap[moisKey].count++;
      });
    
    return Object.values(moisMap)
      .sort((a, b) => a.mois.localeCompare(b.mois))
      .slice(-6);
  };

  const chartData = prepareChartData();

  return (
    <div>
      <div className="header">
        <h1>Gestion des Entrées</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="btn btn-success"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <FiPlus /> Nouveau Financement
          </button>
          <button className="btn btn-primary" onClick={exporterCSV}>
            <FiDownload /> Exporter
          </button>
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
              placeholder="Rechercher par nom, email ou projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select 
            className="form-control"
            style={{ width: '180px' }}
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
          >
            <option value="tous">Tous les statuts</option>
            <option value="valide">Validés</option>
            <option value="en_attente">En attente</option>
            <option value="annule">Annulés</option>
          </select>
          <select 
            className="form-control"
            style={{ width: '150px' }}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="3mois">3 derniers mois</option>
            <option value="6mois">6 derniers mois</option>
            <option value="12mois">12 derniers mois</option>
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eafaf1', color: '#27ae60' }}>
            <FiDollarSign />
          </div>
          <div className="stat-info">
            <h3>{totalValide.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</h3>
            <p>Total collecté</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ebf5fb', color: '#3498db' }}>
            <FiFileText />
          </div>
          <div className="stat-info">
            <h3>{dons.length}</h3>
            <p>Nombre de Financements</p>
            <small style={{ color: '#666' }}>
              {filteredDons.length} correspondant aux filtres
            </small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef5e7', color: '#f39c12' }}>
            <FiDollarSign />
          </div>
          <div className="stat-info">
            <h3>
              {dons.length > 0 
                ? `${Math.round(totalValide / dons.filter(d => d.statut === 'valide').length).toLocaleString()} €`
                : '0 €'
              }
            </h3>
            <p>Financement moyen</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f5eef8', color: '#9b59b6' }}>
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>
              {new Set(dons.filter(d => d.statut === 'valide').map(d => d.email)).size}
            </h3>
            <p>Donateurs uniques</p>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Évolution des Financements</h2>
        </div>
        <div style={{ height: 300 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="mois" />
                <YAxis tickFormatter={(value) => `${value} €`} />
                <Tooltip formatter={(value) => [`${value} €`, 'Montant']} />
                <Bar dataKey="montant" fill="#3498db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Liste des dons */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Liste des Financements ({filteredDons.length})</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="badge badge-success">
              {dons.filter(d => d.statut === 'valide').length} validés
            </span>
            <span className="badge badge-warning">
              {dons.filter(d => d.statut === 'en_attente').length} en attente
            </span>
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p>Chargement des Financements...</p>
          </div>
        ) : filteredDons.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <FiDollarSign size={50} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3>Aucun Financement trouvé</h3>
            <p>Essayez de modifier vos critères de recherche.</p>
            <button 
              className="btn btn-success"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              style={{ marginTop: '20px' }}
            >
              <FiPlus /> Ajouter votre premier Financement
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Donateur</th>
                  <th>Montant</th>
                  <th>Projet</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDons.map(don => (
                  <tr key={don.id}>
                    <td>
                      <strong>{don.donateur_nom}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {don.email || 'Email non renseigné'}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#27ae60' }}>
                        {don.montant} {don.devise}
                      </strong>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {don.methode_paiement || 'Non spécifié'}
                      </div>
                    </td>
                    <td>{don.projet_associe || 'Général'}</td>
                    <td>{formatDate(don.date_don)}</td>
                    <td>
                      <span className={`badge badge-${getStatutColor(don.statut)}`}>
                        {getStatutText(don.statut)}
                      </span>
                      <div style={{ fontSize: '0.8rem', marginTop: '3px' }}>
                        {don.reçu_fiscal_envoye ? 'Reçu envoyé' : 'Reçu à envoyer'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          className="btn btn-sm"
                          onClick={() => handleEditClick(don.id)}
                          title="Modifier"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setSelectedDon(don);
                            setShowDeleteModal(true);
                          }}
                          title="Supprimer"
                        >
                          <FiTrash2 />
                        </button>
                        {don.statut !== 'valide' && (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => updateDonStatut(don.id, 'valide')}
                            title="Valider"
                          >
                            <FiCheck />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL - Ajouter un don */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Ajouter un nouveau Financement</h3>
              <button className="btn btn-sm" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddDon}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom du donateur *</label>
                  <input
                    type="text"
                    name="donateur_nom"
                    className="form-control"
                    value={formData.donateur_nom}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Montant *</label>
                    <input
                      type="number"
                      name="montant"
                      className="form-control"
                      value={formData.montant}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Devise</label>
                    <select
                      name="devise"
                      className="form-control"
                      value={formData.devise}
                      onChange={handleInputChange}
                    >
                      <option value="EUR">€ EUR</option>
                      <option value="USD">$ USD</option>
                      <option value="GBP">£ GBP</option>
                      <option value="CHF">CHF</option>
                    </select>
                  </div>
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Méthode de paiement</label>
                    <select
                      name="methode_paiement"
                      className="form-control"
                      value={formData.methode_paiement}
                      onChange={handleInputChange}
                    >
                      <option value="carte">Carte bancaire</option>
                      <option value="virement">Virement</option>
                      <option value="cheque">Chèque</option>
                      <option value="especes">Espèces</option>
                      <option value="paypal">PayPal</option>
                      <option value="autre">Autre</option>
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
                      <option value="en_attente">En attente</option>
                      <option value="valide">Validé</option>
                      <option value="annule">Annulé</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Projet associé</label>
                  <input
                    type="text"
                    name="projet_associe"
                    className="form-control"
                    value={formData.projet_associe}
                    onChange={handleInputChange}
                    placeholder="Ex: Urgence Gaza, Éducation Sénégal..."
                  />
                </div>
                <div className="form-group">
                  <label>Notes (optionnel)</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    rows="3"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Informations complémentaires..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Enregistrer le don
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - Modifier un don */}
      {showEditModal && selectedDon && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Modifier le don #{selectedDon.id}</h3>
              <button className="btn btn-sm" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateDon}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom du donateur *</label>
                  <input
                    type="text"
                    name="donateur_nom"
                    className="form-control"
                    value={formData.donateur_nom}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Montant *</label>
                    <input
                      type="number"
                      name="montant"
                      className="form-control"
                      value={formData.montant}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Devise</label>
                    <select
                      name="devise"
                      className="form-control"
                      value={formData.devise}
                      onChange={handleInputChange}
                    >
                      <option value="EUR">€ EUR</option>
                      <option value="USD">$ USD</option>
                      <option value="GBP">£ GBP</option>
                      <option value="CHF">CHF</option>
                    </select>
                  </div>
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Méthode de paiement</label>
                    <select
                      name="methode_paiement"
                      className="form-control"
                      value={formData.methode_paiement}
                      onChange={handleInputChange}
                    >
                      <option value="carte">Carte bancaire</option>
                      <option value="virement">Virement</option>
                      <option value="cheque">Chèque</option>
                      <option value="especes">Espèces</option>
                      <option value="paypal">PayPal</option>
                      <option value="autre">Autre</option>
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
                      <option value="en_attente">En attente</option>
                      <option value="valide">Validé</option>
                      <option value="annule">Annulé</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Projet associé</label>
                  <input
                    type="text"
                    name="projet_associe"
                    className="form-control"
                    value={formData.projet_associe}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Reçu fiscal envoyé</label>
                  <div>
                    <label style={{ marginRight: '20px' }}>
                      <input
                        type="radio"
                        checked={selectedDon.reçu_fiscal_envoye}
                        onChange={() => {
                          updateDonStatut(selectedDon.id, formData.statut, true);
                          setSelectedDon({...selectedDon, reçu_fiscal_envoye: true});
                        }}
                      /> Oui
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={!selectedDon.reçu_fiscal_envoye}
                        onChange={() => {
                          updateDonStatut(selectedDon.id, formData.statut, false);
                          setSelectedDon({...selectedDon, reçu_fiscal_envoye: false});
                        }}
                      /> Non
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    rows="3"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group" style={{ fontSize: '0.9rem', color: '#666', padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
                  <div>Date de création: {formatDate(selectedDon.date_don)}</div>
                  <div>Dernière modification: {formatDate(selectedDon.date_don)}</div>
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

      {/* MODAL - Confirmation de suppression */}
      {showDeleteModal && selectedDon && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Confirmer la suppression</h3>
              <button className="btn btn-sm" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <FiTrash2 size={50} color="#e74c3c" style={{ marginBottom: '20px' }} />
                <h4>Êtes-vous sûr de vouloir supprimer ce don ?</h4>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '5px',
                  margin: '20px 0',
                  textAlign: 'left'
                }}>
                  <p><strong>Donateur:</strong> {selectedDon.donateur_nom}</p>
                  <p><strong>Montant:</strong> {selectedDon.montant} {selectedDon.devise}</p>
                  <p><strong>Date:</strong> {formatDate(selectedDon.date_don)}</p>
                  <p><strong>Statut:</strong> <span className={`badge badge-${getStatutColor(selectedDon.statut)}`}>
                    {getStatutText(selectedDon.statut)}
                  </span></p>
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
              <button type="button" className="btn btn-danger" onClick={handleDeleteDon}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionDons;