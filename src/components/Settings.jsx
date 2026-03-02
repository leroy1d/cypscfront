import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    // Banner Slides
    banner_slides: [], // Tableau d'objets { text, image, alt }
    // Background du Hero
    hero_backgrounds: [],
    // Logo
    logo_url: '',
    logo_description: '',
    // Contact
    contact_address: '',
    contact_phone: '',
    contact_email: '',
    contact_hours: '',
    // Réseaux sociaux
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    // Description footer
    footer_description: '',
    // Autres paramètres
    site_title: '',
    site_slogan: ''
  });

  const [previews, setPreviews] = useState({
    logo: null,
    heroBackgrounds: [],
    bannerSlides: [] // Pour les prévisualisations des slides
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('https://ypsbackend.vercel.app/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Données brutes reçues:', data);

        // Transformer les données
        const settingsData = {};
        const heroBackgrounds = [];
        const bannerSlides = [];

        data.forEach(param => {
          if (param.cle && param.cle.startsWith('hero_background_')) {
            heroBackgrounds.push(param.valeur);
          } else if (param.cle && param.cle.startsWith('banner_slide_')) {
            // Les slides du banner sont stockées au format JSON
            try {
              const slideData = JSON.parse(param.valeur);
              bannerSlides.push(slideData);
            } catch (e) {
              console.error('Erreur parsing slide:', e);
            }
          } else if (param.cle) {
            settingsData[param.cle] = param.valeur;
          }
        });

        // Trier les backgrounds
        heroBackgrounds.sort((a, b) => {
          const indexA = parseInt(a.match(/\d+/)?.[0] || 0);
          const indexB = parseInt(b.match(/\d+/)?.[0] || 0);
          return indexA - indexB;
        });

        console.log('Settings transformés:', settingsData);
        console.log('Hero backgrounds:', heroBackgrounds);
        console.log('Banner slides:', bannerSlides);

        setSettings(prev => ({
          ...prev,
          ...settingsData,
          hero_backgrounds: heroBackgrounds,
          banner_slides: bannerSlides.length > 0 ? bannerSlides : [
            { text: "Découvrez notre nouvelle collection", image: "", alt: "Slide 1" },
            { text: "Offres spéciales -50%", image: "", alt: "Slide 2" },
            { text: "Livraison gratuite dès 50€", image: "", alt: "Slide 3" },
            { text: "Nouveautés de la semaine", image: "", alt: "Slide 4" }
          ]
        }));

        // Charger les prévisualisations
        setPreviews(prev => ({
          ...prev,
          logo: settingsData.logo_url || null,
          heroBackgrounds: heroBackgrounds,
          bannerSlides: bannerSlides.length > 0 ? bannerSlides : prev.bannerSlides
        }));
      } else {
        console.error('Erreur HTTP:', response.status);
        setMessage({
          type: 'error',
          text: `Erreur ${response.status} lors du chargement`
        });
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors du chargement des paramètres'
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) {
      return `https://ypsbackend.vercel.app${url}`;
    }
    if (url.startsWith('/')) {
      return `https://ypsbackend.vercel.app${url}`;
    }
    return url;
  };

  const handleFileUpload = async (e, field, slideIndex = null) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (field === 'logo') {
        const formData = new FormData();
        formData.append('file', files[0]);

        const response = await fetch('https://ypsbackend.vercel.app/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          const fileUrl = data.file.url;

          // Sauvegarder dans les paramètres
          await saveSetting('logo_url', fileUrl);

          setSettings(prev => ({ ...prev, logo_url: fileUrl }));
          setPreviews(prev => ({ ...prev, logo: fileUrl }));

          setMessage({
            type: 'success',
            text: 'Logo uploadé avec succès'
          });
        }
      } else if (field === 'heroBackground') {
        const uploadedUrls = [];

        for (let i = 0; i < files.length; i++) {
          const fileFormData = new FormData();
          fileFormData.append('file', files[i]);

          const response = await fetch('https://ypsbackend.vercel.app/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: fileFormData
          });

          if (response.ok) {
            const data = await response.json();
            uploadedUrls.push(data.file.url);
          }
        }

        if (uploadedUrls.length > 0) {
          const newHeroBackgrounds = [...settings.hero_backgrounds, ...uploadedUrls];
          setSettings(prev => ({ ...prev, hero_backgrounds: newHeroBackgrounds }));
          setPreviews(prev => ({ ...prev, heroBackgrounds: newHeroBackgrounds }));

          setMessage({
            type: 'success',
            text: `${uploadedUrls.length} image(s) uploadée(s) avec succès`
          });
        }
      } else if (field === 'bannerImage' && slideIndex !== null) {
        // Upload d'image pour un slide spécifique
        const formData = new FormData();
        formData.append('file', files[0]);

        const response = await fetch('https://ypsbackend.vercel.app/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          const fileUrl = data.file.url;

          // Mettre à jour le slide
          setSettings(prev => {
            const newSlides = [...prev.banner_slides];
            newSlides[slideIndex] = {
              ...newSlides[slideIndex],
              image: fileUrl
            };
            return { ...prev, banner_slides: newSlides };
          });

          setPreviews(prev => {
            const newPreviews = [...prev.bannerSlides];
            newPreviews[slideIndex] = {
              ...newPreviews[slideIndex],
              image: fileUrl
            };
            return { ...prev, bannerSlides: newPreviews };
          });

          setMessage({
            type: 'success',
            text: 'Image du slide uploadée avec succès'
          });
        }
      }

      // Réinitialiser l'input file
      e.target.value = '';

    } catch (error) {
      console.error('Erreur upload:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'upload'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBannerSlideChange = (index, field, value) => {
    setSettings(prev => {
      const newSlides = [...prev.banner_slides];
      newSlides[index] = {
        ...newSlides[index],
        [field]: value
      };
      return { ...prev, banner_slides: newSlides };
    });

    // Mettre à jour les prévisualisations
    setPreviews(prev => {
      const newPreviews = [...prev.bannerSlides];
      newPreviews[index] = {
        ...newPreviews[index],
        [field]: value
      };
      return { ...prev, bannerSlides: newPreviews };
    });
  };

  const addBannerSlide = () => {
    const newSlide = {
      text: "Nouveau slide",
      image: "",
      alt: `Slide ${settings.banner_slides.length + 1}`
    };

    setSettings(prev => ({
      ...prev,
      banner_slides: [...prev.banner_slides, newSlide]
    }));

    setPreviews(prev => ({
      ...prev,
      bannerSlides: [...prev.bannerSlides, newSlide]
    }));
  };

  const removeBannerSlide = async (index) => {
    const slideToRemove = settings.banner_slides[index];

    // Supprimer l'image si elle existe
    if (slideToRemove.image && slideToRemove.image.startsWith('/uploads/')) {
      try {
        const token = localStorage.getItem('token');
        const fileName = slideToRemove.image.split('/').pop();

        const response = await fetch(`https://ypsbackend.vercel.app/api/medias?url=${encodeURIComponent(slideToRemove.image)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const medias = await response.json();
          if (medias.length > 0) {
            await fetch(`https://ypsbackend.vercel.app/api/medias/${medias[0].id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          }
        }
      } catch (error) {
        console.error('Erreur suppression fichier:', error);
      }
    }

    setSettings(prev => {
      const newSlides = [...prev.banner_slides];
      newSlides.splice(index, 1);
      return { ...prev, banner_slides: newSlides };
    });

    setPreviews(prev => {
      const newPreviews = [...prev.bannerSlides];
      newPreviews.splice(index, 1);
      return { ...prev, bannerSlides: newPreviews };
    });
  };

  const saveSetting = async (key, value) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('https://ypsbackend.vercel.app/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cle: key,
          valeur: value,
          type: key.includes('_url') ? 'url' : 'texte'
        })
      });
    } catch (error) {
      console.error('Erreur sauvegarde paramètre:', error);
    }
  };

  const handleHeroUrlChange = (index, value) => {
    setSettings(prev => {
      const newBackgrounds = [...prev.hero_backgrounds];
      newBackgrounds[index] = value;
      return { ...prev, hero_backgrounds: newBackgrounds };
    });

    setPreviews(prev => {
      const newPreviews = [...prev.heroBackgrounds];
      newPreviews[index] = value;
      return { ...prev, heroBackgrounds: newPreviews };
    });
  };

  const addHeroBackground = () => {
    setSettings(prev => ({
      ...prev,
      hero_backgrounds: [...prev.hero_backgrounds, '']
    }));
    setPreviews(prev => ({
      ...prev,
      heroBackgrounds: [...prev.heroBackgrounds, '']
    }));
  };

  const removeHeroBackground = async (index) => {
    const urlToDelete = settings.hero_backgrounds[index];

    if (urlToDelete && urlToDelete.startsWith('/uploads/')) {
      try {
        const token = localStorage.getItem('token');
        const fileName = urlToDelete.split('/').pop();

        const response = await fetch(`https://ypsbackend.vercel.app/api/medias?url=${encodeURIComponent(urlToDelete)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const medias = await response.json();
          if (medias.length > 0) {
            await fetch(`https://ypsbackend.vercel.app/api/medias/${medias[0].id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          }
        }
      } catch (error) {
        console.error('Erreur suppression fichier:', error);
      }
    }

    setSettings(prev => {
      const newBackgrounds = [...prev.hero_backgrounds];
      newBackgrounds.splice(index, 1);
      return { ...prev, hero_backgrounds: newBackgrounds };
    });

    setPreviews(prev => {
      const newPreviews = [...prev.heroBackgrounds];
      newPreviews.splice(index, 1);
      return { ...prev, heroBackgrounds: newPreviews };
    });
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Préparer tous les paramètres
      const allSettings = [
        // Logo
        { cle: 'logo_url', valeur: settings.logo_url || '' },
        { cle: 'logo_description', valeur: settings.logo_description || '' },

        // Contact
        { cle: 'contact_address', valeur: settings.contact_address || '' },
        { cle: 'contact_phone', valeur: settings.contact_phone || '' },
        { cle: 'contact_email', valeur: settings.contact_email || '' },
        { cle: 'contact_hours', valeur: settings.contact_hours || '' },

        // Réseaux sociaux
        { cle: 'facebook_url', valeur: settings.facebook_url || '' },
        { cle: 'twitter_url', valeur: settings.twitter_url || '' },
        { cle: 'instagram_url', valeur: settings.instagram_url || '' },
        { cle: 'linkedin_url', valeur: settings.linkedin_url || '' },
        { cle: 'youtube_url', valeur: settings.youtube_url || '' },

        // Footer
        { cle: 'footer_description', valeur: settings.footer_description || '' },
        { cle: 'site_title', valeur: settings.site_title || '' },
        { cle: 'site_slogan', valeur: settings.site_slogan || '' }
      ];

      // Ajouter les backgrounds du hero
      settings.hero_backgrounds.forEach((bg, index) => {
        allSettings.push({
          cle: `hero_background_${index}`,
          valeur: bg
        });
      });

      // Ajouter les slides du banner (stockés en JSON)
      settings.banner_slides.forEach((slide, index) => {
        allSettings.push({
          cle: `banner_slide_${index}`,
          valeur: JSON.stringify(slide)
        });
      });

      // Sauvegarder chaque paramètre
      const promises = allSettings.map(setting =>
        fetch('https://ypsbackend.vercel.app/api/settings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cle: setting.cle,
            valeur: setting.valeur,
            type: setting.cle.includes('_url') ? 'url' : 
                  setting.cle.startsWith('banner_slide_') ? 'json' : 'texte'
          })
        })
      );

      await Promise.all(promises);

      setMessage({
        type: 'success',
        text: 'Paramètres sauvegardés avec succès'
      });

      console.log('Paramètres sauvegardés:', allSettings);

    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la sauvegarde'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetLogo = async () => {
    setSettings(prev => ({
      ...prev,
      logo_url: '',
      logo_description: ''
    }));
    setPreviews(prev => ({ ...prev, logo: null }));

    await saveSetting('logo_url', '');

    setMessage({
      type: 'success',
      text: 'Logo réinitialisé'
    });
  };

  if (loading && !settings) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des paramètres...</p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <h1>Paramètres du Site</h1>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-grid">

        {/* Section Banner Slides */}
        <div className="settings-card banner-slides-card">
          <h2>Slides du Banner</h2>
          
          <div className="banner-slides-list">
            {settings.banner_slides.map((slide, index) => (
              <div key={index} className="banner-slide-item">
                <div className="banner-slide-header">
                  <span className="slide-number">Slide {index + 1}</span>
                  <button
                    onClick={() => removeBannerSlide(index)}
                    className="btn btn-danger btn-sm"
                    disabled={settings.banner_slides.length <= 1}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>

                <div className="banner-slide-content">
                  <div className="slide-image-preview">
                    {slide.image ? (
                      <img
                        src={getImageUrl(slide.image)}
                        alt={`Slide ${index + 1}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-image.png';
                        }}
                      />
                    ) : (
                      <div className="image-placeholder">
                        <i className="fas fa-image"></i>
                        <span>Aucune image</span>
                      </div>
                    )}
                  </div>

                  <div className="slide-inputs">
                    <div className="form-group">
                      <label>Texte :</label>
                      <input
                        type="text"
                        value={slide.text}
                        onChange={(e) => handleBannerSlideChange(index, 'text', e.target.value)}
                        placeholder="Texte du slide"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>Texte alternatif :</label>
                      <input
                        type="text"
                        value={slide.alt || `Slide ${index + 1}`}
                        onChange={(e) => handleBannerSlideChange(index, 'alt', e.target.value)}
                        placeholder="Description de l'image"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>Image :</label>
                      <div className="image-upload-group">
                        <input
                          type="text"
                          value={slide.image || ''}
                          onChange={(e) => handleBannerSlideChange(index, 'image', e.target.value)}
                          placeholder="URL de l'image"
                          className="form-control"
                        />
                        <div className="upload-buttons">
                          <label htmlFor={`banner-upload-${index}`} className="btn btn-secondary btn-sm">
                            <i className="fas fa-upload"></i> Upload
                          </label>
                          <input
                            type="file"
                            id={`banner-upload-${index}`}
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'bannerImage', index)}
                            style={{ display: 'none' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addBannerSlide}
            className="btn btn-secondary add-slide-btn"
          >
            <i className="fas fa-plus"></i> Ajouter un slide
          </button>
        </div>

        {/* Section Logo */}
        <div className="settings-card">
          <h2>Logo du Site</h2>
          <div className="logo-preview">
            {previews.logo ? (
              <div className="preview-container">
                <img
                  src={getImageUrl(previews.logo)}
                  alt="Logo actuel"
                  className="current-logo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-logo.png';
                  }}
                />
                <div className="preview-info">
                  <p><strong>URL:</strong> {settings.logo_url}</p>
                </div>
              </div>
            ) : (
              <div className="logo-placeholder">
                <i className="fas fa-image"></i>
                <span>Logo par défaut</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Changer le logo :</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'logo')}
              className="file-input"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="btn btn-secondary" style={{ marginTop: '10px' }}>
              <i className="fas fa-upload"></i> Sélectionner un logo
            </label>
            <small>Formats acceptés: JPG, PNG, SVG, WEBP. Taille max: 5MB</small>
          </div>

          {settings.logo_url && (
            <>
              <div className="form-group">
                <label>Description du logo :</label>
                <input
                  type="text"
                  name="logo_description"
                  value={settings.logo_description || ''}
                  onChange={handleInputChange}
                  placeholder="Description du logo"
                  className="form-control"
                />
              </div>

              <button
                onClick={resetLogo}
                className="btn btn-danger"
                style={{ marginTop: '10px' }}
              >
                <i className="fas fa-trash"></i> Supprimer le logo
              </button>
            </>
          )}
        </div>

        {/* Section Background Hero */}
        <div className="settings-card">
          <h2>Images du Hero (Carousel)</h2>

          <div className="hero-backgrounds-list">
            {settings.hero_backgrounds.map((bg, index) => (
              <div key={index} className="bg-item">
                <div className="bg-preview">
                  {previews.heroBackgrounds[index] ? (
                    <img
                      src={getImageUrl(previews.heroBackgrounds[index])}
                      alt={`Background ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-image.png';
                      }}
                    />
                  ) : (
                    <div className="bg-placeholder">
                      <i className="fas fa-image"></i>
                    </div>
                  )}
                </div>

                <div className="bg-input-container">
                  <input
                    type="text"
                    value={bg}
                    onChange={(e) => handleHeroUrlChange(index, e.target.value)}
                    placeholder="URL de l'image ou chemin"
                    className="form-control"
                  />
                  <small>Index: {index}</small>
                </div>

                <div className="bg-actions">
                  <button
                    onClick={() => removeHeroBackground(index)}
                    className="btn btn-danger btn-sm"
                    title="Supprimer"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="form-group">
            <div className="upload-options">
              <div>
                <button
                  onClick={addHeroBackground}
                  className="btn btn-secondary"
                >
                  <i className="fas fa-plus"></i> Ajouter une URL
                </button>
              </div>

              <div style={{ marginTop: '15px' }}>
                <label htmlFor="hero-upload" className="btn btn-primary">
                  <i className="fas fa-upload"></i> Uploader des images
                </label>
                <input
                  type="file"
                  id="hero-upload"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'heroBackground')}
                  className="file-input"
                  multiple
                  style={{ display: 'none' }}
                />
                <small>Sélectionnez plusieurs images (Ctrl+clic)</small>
              </div>
            </div>
          </div>
        </div>

        {/* Section Contact */}
        <div className="settings-card">
          <h2>Informations de Contact</h2>

          <div className="form-group">
            <label>Adresse :</label>
            <input
              type="text"
              name="contact_address"
              value={settings.contact_address || ''}
              onChange={handleInputChange}
              placeholder="Adresse complète"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Téléphone :</label>
            <input
              type="text"
              name="contact_phone"
              value={settings.contact_phone || ''}
              onChange={handleInputChange}
              placeholder="Numéro de téléphone"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Email :</label>
            <input
              type="email"
              name="contact_email"
              value={settings.contact_email || ''}
              onChange={handleInputChange}
              placeholder="Email de contact"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Horaires :</label>
            <input
              type="text"
              name="contact_hours"
              value={settings.contact_hours || ''}
              onChange={handleInputChange}
              placeholder="Ex: Lundi-Vendredi 9h-18h"
              className="form-control"
            />
          </div>
        </div>

        {/* Section Réseaux Sociaux */}
        <div className="settings-card">
          <h2>Réseaux Sociaux</h2>

          <div className="form-group">
            <label><i className="fab fa-facebook"></i> Facebook :</label>
            <input
              type="url"
              name="facebook_url"
              value={settings.facebook_url || ''}
              onChange={handleInputChange}
              placeholder="https://facebook.com/votre-page"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label><i className="fab fa-twitter"></i> Twitter :</label>
            <input
              type="url"
              name="twitter_url"
              value={settings.twitter_url || ''}
              onChange={handleInputChange}
              placeholder="https://twitter.com/votre-compte"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label><i className="fab fa-instagram"></i> Instagram :</label>
            <input
              type="url"
              name="instagram_url"
              value={settings.instagram_url || ''}
              onChange={handleInputChange}
              placeholder="https://instagram.com/votre-compte"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label><i className="fab fa-linkedin"></i> LinkedIn :</label>
            <input
              type="url"
              name="linkedin_url"
              value={settings.linkedin_url || ''}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/company/votre-entreprise"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label><i className="fab fa-youtube"></i> YouTube :</label>
            <input
              type="url"
              name="youtube_url"
              value={settings.youtube_url || ''}
              onChange={handleInputChange}
              placeholder="https://youtube.com/c/votre-chaine"
              className="form-control"
            />
          </div>
        </div>

        {/* Section Footer */}
        <div className="settings-card">
          <h2>Footer & Informations Générales</h2>

          <div className="form-group">
            <label>Description footer :</label>
            <textarea
              name="footer_description"
              value={settings.footer_description || ''}
              onChange={handleInputChange}
              placeholder="Description de l'association pour le footer"
              className="form-control"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Titre du site :</label>
            <input
              type="text"
              name="site_title"
              value={settings.site_title || ''}
              onChange={handleInputChange}
              placeholder="Nom de votre association"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Slogan :</label>
            <input
              type="text"
              name="site_slogan"
              value={settings.site_slogan || ''}
              onChange={handleInputChange}
              placeholder="Slogan ou phrase d'accroche"
              className="form-control"
            />
          </div>
        </div>

      </div>

      <div className="settings-actions">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="btn btn-primary btn-lg"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Sauvegarde...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i> Sauvegarder tous les paramètres
            </>
          )}
        </button>

        <button
          onClick={loadSettings}
          className="btn btn-secondary"
          style={{ marginLeft: '10px' }}
        >
          <i className="fas fa-sync"></i> Recharger
        </button>
      </div>

      <style>{`
        .settings-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        
        .settings-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
        }
        
        .settings-card h2 {
          margin-top: 0;
          color: #333;
          border-bottom: 2px solid #0077d4;
          padding-bottom: 10px;
          margin-bottom: 20px;
          font-size: 1.4rem;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #555;
        }
        
        .form-control {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          transition: border-color 0.3s;
        }
        
        .form-control:focus {
          outline: none;
          border-color: #0077d4;
          box-shadow: 0 0 0 2px rgba(0,119,212,0.1);
        }
        
        /* Styles pour les slides du banner */
        .banner-slides-list {
          max-height: 600px;
          overflow-y: auto;
          margin-bottom: 20px;
          padding-right: 10px;
        }
        
        .banner-slide-item {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
        }
        
        .banner-slide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .slide-number {
          font-weight: bold;
          color: #0077d4;
          background: #e7f1ff;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .banner-slide-content {
          display: flex;
          gap: 15px;
        }
        
        .slide-image-preview {
          width: 120px;
          height: 80px;
          flex-shrink: 0;
          border: 2px solid #ddd;
          border-radius: 6px;
          overflow: hidden;
          background: #f0f0f0;
        }
        
        .slide-image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 0.8rem;
        }
        
        .image-placeholder i {
          font-size: 1.5rem;
          margin-bottom: 5px;
        }
        
        .slide-inputs {
          flex: 1;
        }
        
        .image-upload-group {
          display: flex;
          gap: 10px;
        }
        
        .image-upload-group .form-control {
          flex: 1;
        }
        
        .add-slide-btn {
          width: 100%;
          margin-top: 10px;
        }
        
        .logo-preview {
          margin: 20px 0;
        }
        
        .preview-container {
          text-align: center;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .current-logo {
          max-width: 200px;
          max-height: 100px;
          object-fit: contain;
          margin-bottom: 10px;
        }
        
        .preview-info {
          margin-top: 10px;
          padding: 10px;
          background: #fff;
          border-radius: 5px;
          font-size: 0.9rem;
          text-align: left;
        }
        
        .preview-info p {
          margin: 5px 0;
          word-break: break-all;
        }
        
        .logo-placeholder {
          width: 100%;
          height: 120px;
          background: #f5f5f5;
          border: 2px dashed #ddd;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #999;
          border-radius: 8px;
        }
        
        .logo-placeholder i {
          font-size: 2rem;
          margin-bottom: 5px;
        }
        
        .hero-backgrounds-list {
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 15px;
          padding-right: 10px;
        }
        
        .bg-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 15px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .bg-preview {
          width: 100px;
          height: 80px;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 6px;
          border: 2px solid #ddd;
        }
        
        .bg-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .bg-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          color: #999;
        }
        
        .bg-input-container {
          flex: 1;
        }
        
        .bg-input-container small {
          display: block;
          margin-top: 5px;
          color: #666;
        }
        
        .bg-actions {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .upload-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .file-input {
          display: none;
        }
        
        .settings-actions {
          display: flex;
          justify-content: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        
        .btn-primary {
          background: #0077d4;
          color: white;
        }
        
        .btn-primary:hover {
          background: #0056a3;
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #545b62;
        }
        
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        
        .btn-danger:hover {
          background: #c82333;
        }
        
        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-lg {
          padding: 12px 30px;
          font-size: 16px;
        }
        
        .message {
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }
        
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0077d4;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        small {
          color: #666;
          font-size: 0.85rem;
          display: block;
          margin-top: 5px;
        }
        
        textarea.form-control {
          resize: vertical;
          min-height: 80px;
        }
        
        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
          
          .settings-container {
            padding: 10px;
          }
          
          .banner-slide-content {
            flex-direction: column;
          }
          
          .slide-image-preview {
            width: 100%;
            height: 150px;
          }
          
          .bg-item {
            flex-direction: column;
          }
          
          .bg-preview {
            width: 100%;
            height: 120px;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;