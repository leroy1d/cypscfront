import React, { useState, useEffect } from 'react';
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiActivity,
  FiUsers,
  FiEye,
  FiEyeOff,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiImage
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('actions');
  const [actions, setActions] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
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
      setActions(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des actions');
    } finally {
      setLoading(false);
    }
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


  const [stats, setStats] = useState({
    benevolesActifs: 0,
    donsMois: 0,
    actionsEnCours: 0,
    visiteurs30Jours: 0
  });
  const [donData, setDonData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchDonGraph();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchDonGraph = async () => {
    try {
      const response = await axios.get('/api/dashboard/dons-graph');
      setDonData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Ambassadeurs Actifs',
      value: stats.benevolesActifs,
      icon: <FiUsers />,
      color: '#3498db',
      bgColor: '#ebf5fb'
    },
    {
      title: 'Dons ce mois',
      value: `${stats.donsMois.toLocaleString()} €`,
      icon: <FiDollarSign />,
      color: '#27ae60',
      bgColor: '#eafaf1'
    },
    {
      title: 'Actions en cours',
      value: stats.actionsEnCours,
      icon: <FiActivity />,
      color: '#f39c12',
      bgColor: '#fef5e7'
    },
    {
      title: 'Visiteurs (30j)',
      value: stats.visiteurs30Jours.toLocaleString(),
      icon: <FiEye />,
      color: '#9b59b6',
      bgColor: '#f5eef8'
    }
  ];

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <div className="header">
        <h1>Tableau de Bord</h1>
        <div className="user-info">
          <span>Bonjour, Admin</span>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Évolution financières (6 mois)</h2>
        </div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={donData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} €`, 'Montant']} />
              <Line type="monotone" dataKey="total" stroke="#3498db" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Actions récentes</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Budget</th>
                <th>Statut</th>
                <th>Création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <FiCalendar size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <p>Aucune action trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(action => (
                  <tr key={action.id}>
                    <td>
                      <strong>{action.titre}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                        {action.description.substring(0, 100)}...
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${getTypeColor(action.type)}`}>
                        {action.type === 'urgence' ? 'Urgence' :
                          action.type === 'developpement' ? 'Développement' : 'Éducation'}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div><strong>Début:</strong> {action.date_debut ? new Date(action.date_debut).toLocaleDateString('fr-FR') : 'Non définie'}</div>
                        <div><strong>Fin:</strong> {action.date_fin ? new Date(action.date_fin).toLocaleDateString('fr-FR') : 'Non définie'}</div>
                      </div>
                    </td>
                    <td>
                      {action.budget ? (
                        <strong style={{ color: '#27ae60' }}>
                          {parseFloat(action.budget).toLocaleString('fr-FR')} €
                        </strong>
                      ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>Non défini</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${getStatutColor(action.statut)}`}>
                        {action.statut === 'planifie' ? 'Planifié' :
                          action.statut === 'en_cours' ? 'En cours' : 'Terminé'}
                      </span>
                    </td>
                    <td>
                      {new Date(action.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleEditClick(action)}
                          title="Modifier"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteClick(action)}
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
        <p style={{ padding: '20px', textAlign: 'center', color: '#1a365d' }}> 
          <b> Bienvenue dans l'administration de <Link to="/" style={{color: '#f6ad55' }}>De la Commission Nationale Jeunesse Paix et Securité du Cameroun</Link>.
          Utilisez le menu de gauche pour gérer votre contenu.</b>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;