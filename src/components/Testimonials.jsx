import React from "react";
import "./LogoCarousel.css";

const LogoCarousel = () => {
  const images = import.meta.glob(
    "../assets/partners/*.jpg",
    { eager: true }
  );

  const logos = Object.keys(images)
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)\.jpg$/)[1]);
      const numB = parseInt(b.match(/(\d+)\.jpg$/)[1]);
      return numA - numB;
    })
    .map((key) => images[key].default);

  return (
    <>
      <div className="carousel-title">
        <h2>Nos Partenaires</h2>
      </div>
      <div className="carousel">
        <div className="carousel-track">
          {[...logos, ...logos].map((logo, index) => (
            <div className="carousel-item" key={index}>
              <img src={logo} alt={`partner-${index}`} />
            </div>
          ))}
        </div>
         {/* <span className="partners-count">{logos.length} partenaires</span> */}
      </div>
    </>
  );
};

export default LogoCarousel;