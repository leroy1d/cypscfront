import React from 'react';

const SettingsInit = () => {
  const initializeSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://192.168.179.20:5005/api/settings/init-table', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Table settings initialisée avec succès !');
      } else {
        alert('Erreur lors de l\'initialisation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Initialisation des Paramètres</h2>
      <p>
        Cette opération va créer la table des paramètres et insérer les valeurs par défaut.
        À exécuter une seule fois après l'installation.
      </p>
      <button 
        onClick={initializeSettings}
        style={{
          padding: '10px 20px',
          background: '#0077d4',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Initialiser la table Settings
      </button>
    </div>
  );
};

export default SettingsInit;