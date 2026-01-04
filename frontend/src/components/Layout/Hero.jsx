import React, { useEffect, useState } from 'react';
import banner1 from '../../assets/banner1.jpg';
import banner2 from '../../assets/banner2.jpg';
import banner3 from '../../assets/banner3.jpg';
import { Link } from 'react-router-dom';
const Hero = () => {
  const [heroImage, setHeroImage] = useState(null);

  const heroImages = [banner1, banner2, banner3];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * heroImages.length);
    setHeroImage(heroImages[randomIndex]);
  }, []);

  return (
    <section className="relative z-0">
      <img
        src={heroImage}
        alt="Shop"
        className="w-full h-[400px] md:h-[600px] lg:h-[750px] object-cover"
      />
      <div className="z-0 absolute inset-0 bg-black/25 flex items-center justify-center mt-18 md:mt-12 lg:mt-4">
        <div className="text-center text-white p-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-9xl font-sans tracking-tighter uppercase mb-4">
            Phong cách theo từng bước chân
            <br />
          </h1>
          <p className="text-sm tracking-tighter md:text-lg mb-8 font-mono">
            Thời trang hiện đại dành cho những chuyển động tự tin mỗi ngày.
          </p>
          <Link
            to="/shop"
            className="bg-white/15 border border-white/50 
            text-gray-950 px-10 py-4 text-shadow-md
            rounded-lg text-lg font-bold backdrop-blur-md
            hover:border-white hover:bg-white/25 hover:font-semibold 
            hover:px-11 hover:backdrop-blur-xl shadow-md hover:rounded-xl
            transition-all ease-in duration-200"
          >
            Mua ngay
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
