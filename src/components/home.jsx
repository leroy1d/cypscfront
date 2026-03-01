// Dans components/home.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Hero from './Hero';
import Causes from './Causes';
import Actions from './Actions';
import Transparency from './Transparency';
import FAQ from './FAQ';
import Impact from './Impact';
import LogoCarousel from './Testimonials';
import Donation from './Donation';
import { Box } from '@mui/material';
import Footer from './Footer';
import Banner from './Banner';

function Home() {
  useEffect(() => {
    // Navigation fluide pour les ancres
    const handleSmoothScroll = (e) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });

          // Fermer le menu mobile si ouvert
          const nav = document.getElementById('mainNav');
          const menuBtn = document.querySelector('.mobile-menu-btn');
          if (nav?.classList.contains('active')) {
            nav.classList.remove('active');
            if (menuBtn) {
              menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
          }
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);

    // Ajouter Font Awesome
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(link);

    return () => {
      document.removeEventListener('click', handleSmoothScroll);
    };
  }, []);

  return (
    <div className="App">
      <Banner />
      <Causes />
      <Actions />
      <Transparency />
      <FAQ />
      <Impact />
      <LogoCarousel />
      <Footer />
    </div>
  );
}

export default Home;
