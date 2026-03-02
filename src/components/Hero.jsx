import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [backgrounds, setBackgrounds] = useState([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  

// Modifier la fonction fetchBackgrounds (vers ligne 20-40)

useEffect(() => {
  const fetchBackgrounds = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://ypsbackend.vercel.app/api/frontend/settings`);
      
      if (!res.ok) throw new Error('Erreur API');

      const data = await res.json();
      console.log('Données reçues dans Hero:', data);
      
      let imageUrls = [];

      // Vérifier si hero_backgrounds existe dans les données
      if (data.hero_backgrounds && Array.isArray(data.hero_backgrounds) && data.hero_backgrounds.length > 0) {
        imageUrls = data.hero_backgrounds.map((img) => {
          // Nettoyer et construire l'URL
           setBackgrounds(imageUrls);
          const cleanImg = img.startsWith('/') ? img : `/${img}`;
          console.log('URL de l\'image: cleanImg', cleanImg);
          
          return `https://ypsbackend.vercel.app/api${cleanImg}`;
        });
      } else {
        // Fallback si pas d'images
        console.log('Aucun background trouvé, utilisation du fallback');
        // imageUrls = [`https://ypsbackend.vercel.app/api/uploads/default-hero.jpg`];
      }
      
      // Précharger les images
      await preloadImages(imageUrls);
      setBackgrounds(imageUrls);
      setError(false);
    } catch (err) {
      console.error('Erreur chargement hero:', err);
      setError(true);
      setBackgrounds([`https://ypsbackend.vercel.app/api${backgrounds}`]);
      
      setError(false);
    } finally {
      setLoading(false);
    }
  };

  fetchBackgrounds();
}, []);
// Ajouter une fonction de préchargement robuste

const preloadImages = (urls) => {
  return Promise.all(
    urls.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          console.log(`Image chargée: ${url}`);
          resolve();
        };
        img.onerror = () => {
          console.error(`Erreur chargement image: ${url}`);
          resolve(); // Résoudre quand même pour ne pas bloquer
        };
      });
    })
  );
};

  useEffect(() => {
    if (backgrounds.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgrounds]);

  const goToPrev = useCallback(() => {
    setCurrentBgIndex((prev) => (prev === 0 ? backgrounds.length - 1 : prev - 1));
  }, [backgrounds.length]);

  const goToNext = useCallback(() => {
    setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
  }, [backgrounds.length]);

  if (loading) {
    return (
      <section className="hero loading" role="status" aria-label="Chargement">
        <div className="spinner"></div>
        <style>{spinnerStyle}</style>
      </section>
    );
  }

  if (error && backgrounds.length === 0) {
    return (
      <section className="hero error" role="alert">
        <div className="container">
          <h1>Erreur de chargement</h1>
          <p>Veuillez réessayer plus tard</p>
        </div>
        <style>{heroStyle}</style>
      </section>
    );
  }
  console.log('URL de l\'image:avec background', backgrounds);

  return (
    <section className="hero" aria-label="Carousel d'images">
      <div className="hero-background">
        {backgrounds.map((bg, idx) => (
          <div
            key={bg}
            className={`background-slide ${idx === currentBgIndex ? 'active' : ''}`}
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgrounds[0]}), image-set(url(${bg}) 1x)`,
            }}
            role="img"
            aria-label={`Image d'arrière-plan ${idx + 1}`}
            aria-hidden={idx !== currentBgIndex}
          />
        ))}
      </div>

      <div className="container">
        <h1>Les jeunes au cœur de la paix et de la sécurité</h1>
        <p>
          La Commission Nationale Jeunesse, Paix et Sécurité (CN-JPS) reconnaît
          les jeunes comme des acteurs clés de la prévention des conflits et de
          la consolidation de la paix au Cameroun.
        </p>

        <div className="cta-buttons">
          <Link to="/benevole" className="btn btn-primary">
            Devenir Membre
          </Link>
          <Link to="/actualite" className="btn btn-primary">
            Actualités
          </Link>
          <Link to="/gallerie" className="btn btn-primary">
            Galerie
          </Link>
        </div>
      </div>

      {backgrounds.length > 1 && (
        <>
          <button 
            className="carousel-btn prev" 
            onClick={goToPrev}
            aria-label="Image précédente"
          >‹</button>
          <button 
            className="carousel-btn next" 
            onClick={goToNext}
            aria-label="Image suivante"
          >›</button>
          
          <div className="carousel-indicators" role="tablist">
            {backgrounds.map((_, idx) => (
              <button
                key={idx}
                className={`indicator ${idx === currentBgIndex ? 'active' : ''}`}
                onClick={() => setCurrentBgIndex(idx)}
                aria-label={`Aller à l'image ${idx + 1}`}
                aria-selected={idx === currentBgIndex}
                role="tab"
              />
            ))}
          </div>
        </>
      )}

      <style>{heroStyle}</style>
    </section>
  );
};

export default Hero;

// Styles avec ajout des indicateurs
const spinnerStyle = `
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #eee;
  border-top: 4px solid #0077d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
`;

const heroStyle = `
.hero {
  position: relative;
  min-height: 600px;
  padding: 100px 20px;
  color: white;
  display: flex;
  align-items: center;
  text-align: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.background-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(1.05);
  background-size: cover;
  background-position: center;
  transition: opacity 1.2s ease-in-out, transform 6s ease-in-out;
}

.background-slide.active {
  opacity: 1;
  transform: scale(1);
}

.container {
  max-width: 900px;
  margin: auto;
}

.cta-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.25);
  color: white;
  font-size: 32px;
  cursor: pointer;
  z-index: 10;
  transition: background 0.3s;
}

.carousel-btn:hover {
  background: rgba(255,255,255,0.4);
}

.carousel-btn.prev { left: 20px; }
.carousel-btn.next { right: 20px; }

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: background 0.3s;
}

.indicator.active {
  background: white;
}

@media (max-width: 768px) {
  .hero {
    min-height: 420px;
    padding: 80px 16px;
  }
  .carousel-btn { display: none; }
  .background-slide { transform: none; transition: opacity 1s ease-in-out; }
  .carousel-indicators { bottom: 10px; }
}
`;