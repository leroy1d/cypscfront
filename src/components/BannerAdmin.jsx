import React, { useState, useEffect } from 'react';


const BannerAdmin = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingFor, setUploadingFor] = useState(null);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ypsbackend.vercel.app/api/admin/banner-slides`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erreur chargement');
      const data = await response.json();
      setSlides(data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors du chargement des slides'
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
    return url;
  };

  const handleFileUpload = async (e, slideIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingFor(slideIndex);
      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`https://ypsbackend.vercel.app/api/upload`, {
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
        await updateBannerSlide(slideIndex, { image: fileUrl });

        // Mettre à jour l'état local
        setSlides(prev => prev.map(slide =>
          slide.index === slideIndex ? { ...slide, image: fileUrl } : slide
        ));

        setMessage({
          type: 'success',
          text: 'Image uploadée avec succès'
        });
      }

      // Réinitialiser l'input
      e.target.value = '';
    } catch (error) {
      console.error('Erreur upload:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'upload'
      });
    } finally {
      setUploadingFor(null);
    }
  };

  const updateBannerSlide = async (slideIndex, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ypsbackend.vercel.app/api/admin/banner-slide/${slideIndex}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour slide:', error);
      throw error;
    }
  };

  const handleTextChange = (slideIndex, newText) => {
    setSlides(prev => prev.map(slide =>
      slide.index === slideIndex ? { ...slide, text: newText } : slide
    ));
  };

  const saveText = async (slideIndex) => {
    try {
      const slide = slides.find(s => s.index === slideIndex);
      await updateBannerSlide(slideIndex, { text: slide.text });

      setMessage({
        type: 'success',
        text: 'Texte mis à jour'
      });

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la sauvegarde'
      });
    }
  };

  const addNewSlide = async () => {
    try {
      const token = localStorage.getItem('token');
      const newSlide = {
        text: 'Nouveau slide',
        image: ''
      };

      const response = await fetch(`https://ypsbackend.vercel.app/api/admin/banner-slide`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSlide)
      });

      const result = await response.json();

      if (result.success) {
        setSlides(prev => [...prev, result.slide]);
        setMessage({
          type: 'success',
          text: 'Nouveau slide ajouté'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'ajout'
      });
    }
  };

  const deleteSlide = async (slideIndex) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce slide ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ypsbackend.vercel.app/api/admin/banner-slide/${slideIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setSlides(prev => prev.filter(slide => slide.index !== slideIndex));
        setMessage({
          type: 'success',
          text: 'Slide supprimé'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la suppression'
      });
    }
  };

  const moveSlide = async (slideIndex, direction) => {
    const currentIndex = slides.findIndex(s => s.index === slideIndex);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= slides.length) return;

    const newSlides = [...slides];
    const temp = newSlides[currentIndex];
    newSlides[currentIndex] = newSlides[newIndex];
    newSlides[newIndex] = temp;

    // Préparer les données pour la réorganisation
    const reorderData = newSlides.map((slide, idx) => ({
      originalIndex: slide.index,
      newIndex: idx
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ypsbackend.vercel.app/api/admin/banner-slides/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slides: reorderData })
      });

      const result = await response.json();

      if (result.success) {
        setSlides(newSlides);
      } else {
        throw new Error('Erreur réorganisation');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la réorganisation'
      });
    }
  };

  return (
    <div className="banner-admin-container">
      <h1>Gestion du Banner</h1>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="slides-list">
        {slides.map((slide, idx) => (
          <div key={slide.index} className="slide-item">
            <div className="slide-header">
              <h3>Slide {idx + 1}</h3>
              <div className="slide-actions">
                <button
                  onClick={() => moveSlide(slide.index, 'up')}
                  disabled={idx === 0}
                  className="btn btn-sm"
                  title="Monter"
                >
                  <i className="fas fa-arrow-up"></i>
                </button>
                <button
                  onClick={() => moveSlide(slide.index, 'down')}
                  disabled={idx === slides.length - 1}
                  className="btn btn-sm"
                  title="Descendre"
                >
                  <i className="fas fa-arrow-down"></i>
                </button>
                <button
                  onClick={() => deleteSlide(slide.index)}
                  className="btn btn-sm btn-danger"
                  title="Supprimer"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div className="slide-content">
              <div className="slide-image-section">
                <div className="image-preview">
                  {slide.image ? (
                    <img
                      src={getImageUrl(slide.image)}
                      alt={`Slide ${idx + 1}`}
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

                <div className="image-upload">
                  <label
                    htmlFor={`upload-${slide.index}`}
                    className="btn btn-secondary btn-sm"
                  >
                    {uploadingFor === slide.index ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Upload...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload"></i> Changer l'image
                      </>
                    )}
                  </label>
                  <input
                    type="file"
                    id={`upload-${slide.index}`}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, slide.index)}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="slide-text-section">
                <label>Texte du slide :</label>
                <div className="text-edit">
                  <input
                    type="text"
                    value={slide.text || ''}
                    onChange={(e) => handleTextChange(slide.index, e.target.value)}
                    className="form-control"
                    placeholder="Entrez le texte du slide"
                  />
                  <button
                    onClick={() => saveText(slide.index)}
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fas fa-save"></i> Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="add-slide-section">
        <button onClick={addNewSlide} className="btn btn-success">
          <i className="fas fa-plus"></i> Ajouter un nouveau slide
        </button>
      </div>

      <style>{`
        .banner-admin-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .slides-list {
          margin: 30px 0;
        }

        .slide-item {
          background: white;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
        }

        .slide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #0077d4;
        }

        .slide-header h3 {
          margin: 0;
          color: #333;
        }

        .slide-actions {
          display: flex;
          gap: 5px;
        }

        .slide-content {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
        }

        .slide-image-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .image-preview {
          width: 100%;
          height: 150px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #ddd;
          background: #f5f5f5;
        }

        .image-preview img {
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
          background: #f0f0f0;
        }

        .image-placeholder i {
          font-size: 2rem;
          margin-bottom: 5px;
        }

        .slide-text-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .slide-text-section label {
          font-weight: 600;
          color: #555;
        }

        .text-edit {
          display: flex;
          gap: 10px;
        }

        .text-edit input {
          flex: 1;
        }

        .add-slide-section {
          margin-top: 30px;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.3s;
        }

        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
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

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-success:hover {
          background: #218838;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        .form-control {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        .form-control:focus {
          outline: none;
          border-color: #0077d4;
          box-shadow: 0 0 0 2px rgba(0,119,212,0.1);
        }

        @media (max-width: 768px) {
          .slide-content {
            grid-template-columns: 1fr;
          }

          .image-preview {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default BannerAdmin;