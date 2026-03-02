import React, { useState, useEffect } from 'react';
import './Banner.css';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'https://ypsbackend.vercel.app';

const Banner = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [bannerSlides, setBannerSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charger les slides du banner depuis la base de données
    useEffect(() => {
        const loadBannerSlides = async () => {
            try {
                setLoading(true);

                // Récupérer tous les paramètres
                const response = await fetch(`${API_BASE_URL}/api/frontend/settings`);

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }

                const settings = await response.json();

                // Récupérer les slides du banner
                // Les slides sont stockées avec des clés banner_slide_0, banner_slide_1, etc.
                const slides = [];

                // Parcourir toutes les clés pour trouver les slides
                Object.keys(settings).forEach(key => {
                    if (key.startsWith('banner_slide_')) {
                        try {
                            const slideData = JSON.parse(settings[key]);
                            slides.push(slideData);
                        } catch (e) {
                            console.error(`Erreur parsing slide ${key}:`, e);
                        }
                    }
                });

                // Trier les slides par index
                slides.sort((a, b) => {
                    const indexA = parseInt(a.alt?.match(/\d+/) || 0);
                    const indexB = parseInt(b.alt?.match(/\d+/) || 0);
                    return indexA - indexB;
                });


                if (slides.length > 0) {
                    setBannerSlides(slides);
                } else {
                    // Slides par défaut si aucun n'est configuré
                    setBannerSlides([
                        {
                            text: "Découvrez notre nouvelle collection",
                            image: `${API_BASE_URL}/uploads/file-1769266049124-16510398.jpg`,
                            alt: "Collection été"
                        },
                        {
                            text: "Offres spéciales -50%",
                            image: `${API_BASE_URL}/uploads/file-1769868663461-425095722.jpg`,
                            alt: "Promotions"
                        },
                        {
                            text: "Livraison gratuite dès 50€",
                            image: `${API_BASE_URL}/uploads/file-1769869300719-962729231.jpg`,
                            alt: "Livraison"
                        },
                        {
                            text: "Nouveautés de la semaine",
                            image: `${API_BASE_URL}/uploads/file-1769868663401-132364244.jpg`,
                            alt: "Nouveautés"
                        }
                    ]);
                }

            } catch (err) {
                console.error('Erreur chargement slides:', err);
                setError(err.message);

                // Slides par défaut en cas d'erreur
                setBannerSlides([
                    {
                        text: "Découvrez notre nouvelle collection",
                        image: `${API_BASE_URL}/uploads/file-1769266049124-16510398.jpg`,
                        alt: "Collection été"
                    },
                    {
                        text: "Offres spéciales -50%",
                        image: `${API_BASE_URL}/uploads/file-1769868663461-425095722.jpg`,
                        alt: "Promotions"
                    },
                    {
                        text: "Livraison gratuite dès 50€",
                        image: `${API_BASE_URL}/uploads/file-1769869300719-962729231.jpg`,
                        alt: "Livraison"
                    },
                    {
                        text: "Nouveautés de la semaine",
                        image: `${API_BASE_URL}/uploads/file-1769868663401-132364244.jpg`,
                        alt: "Nouveautés"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadBannerSlides();
    }, []);

    // Fonction pour obtenir l'URL complète de l'image
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/uploads')) {
            return `${API_BASE_URL}${imagePath}`;
        }
        return imagePath;
    };

    // Changement automatique toutes les 5 secondes
    useEffect(() => {
        if (bannerSlides.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerSlides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [bannerSlides.length]);

    // Fonctions pour la navigation manuelle
    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? bannerSlides.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            (prevIndex + 1) % bannerSlides.length
        );
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    if (loading) {
        return (
            <div className="banner-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (bannerSlides.length === 0) {
        return (
            <div className="banner-error">
                <p>Aucun slide configuré</p>
            </div>
        );
    }

    const currentBanner = bannerSlides[currentIndex];

    return (
        <div className="banner-container">
            {/* Slide avec image de fond */}
            
            <div
                className="banner-slide"
                style={{
                    backgroundImage: `url(${getImageUrl(currentBanner.image)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}

            >
                <div className="banner-overlay">
                    <div className="banner-content">
                        <h2 className="banner-text">{currentBanner.text}</h2>
                    </div>
                </div>
                
            </div>

            {/* Boutons de navigation - affichés seulement s'il y a plus d'un slide */}
            {bannerSlides.length > 1 && (
                
                <>
                    <button
                        className="banner-nav banner-prev"
                        onClick={goToPrevious}
                        aria-label="Image précédente"
                    >
                        &#10094;
                    </button>

                    <button
                        className="banner-nav banner-next"
                        onClick={goToNext}
                        aria-label="Image suivante"
                    >
                        &#10095;
                    </button>
                </>
            )}

            {/* Indicateurs de slide */}
            {bannerSlides.length > 1 && (
                <div className="banner-dots">
                    {bannerSlides.map((_, index) => (
                        <button
                            key={index}
                            className={`banner-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Aller au slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}


        </div>
    );
};

export default Banner;