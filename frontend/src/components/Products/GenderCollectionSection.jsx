import React from 'react';
import mensCollectionImage from '../../assets/men.png';
import woMensCollectionImage from '../../assets/women.png';
import { Link } from 'react-router-dom';

const GenderCollectionSection = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3 xl:gap-6 px-3 xl:px-0">
        {/* bộ sưu tập nam */}
        <div className="relative flex-1 rounded-xl overflow-hidden bg-cover bg-center group shadow-2xl">
          <img
            src={mensCollectionImage}
            alt="Bộ sưu tập nữ"
            className="w-full h-[580px] lg:h-[700px] object-cover brightness-80 contrast-100 saturate-75
            transition-all duration-300 ease-in
            group-hover:brightness-80 group-hover:contrast-100 group-hover:saturate-95"
          />
          {/* Overlay */}
          <div
            className="
      absolute inset-0
      flex flex-col items-center justify-center
      opacity-0 pointer-events-none
      scale-95 translate-y-10
      transition-all duration-300 ease-out
      group-hover:opacity-100
      group-hover:scale-100
      group-hover:translate-y-0
      group-hover:pointer-events-auto
      group-hover:bg-white/10
      group-hover:backdrop-blur-sm
    "
          >
            <h2
              className="text-2xl font-bold text-gray-900 mb-3 
            group-hover:text-white group-hover:text-shadow-md"
            >
              Bộ sưu tập nam
            </h2>

            <Link
              to="/shop?gender=Women"
              className="text-white underline text-lg group-hover:text-white group-hover:text-shadow-md"
            >
              Khám phá ngay
            </Link>
          </div>
          <div
            className="absolute bottom-0 left-0 w-full flex flex-col bg-white/80 backdrop-blur-md p-4
          group-hover:opacity-0 "
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              Bộ sưu tập nam
            </h2>
            <Link to="/shop?gender=Men" className="text-gray-900 underline text-center">
              Khám phá ngay
            </Link>
          </div>
        </div>

        {/* bộ sưu tập nữ */}
        <div className="relative flex-1 rounded-xl overflow-hidden bg-cover bg-center group shadow-2xl">
          <img
            src={woMensCollectionImage}
            alt="Bộ sưu tập nữ"
            className="w-full h-[580px] lg:h-[700px] object-cover brightness-80 contrast-100 saturate-75
            transition-all duration-300 ease-in
            group-hover:brightness-80 group-hover:contrast-100 group-hover:saturate-95"
          />
          {/* Overlay */}
          <div
            className="
      absolute inset-0
      flex flex-col items-center justify-center
      opacity-0 pointer-events-none
      scale-95 translate-y-10
      transition-all duration-300 ease-out
      group-hover:opacity-100
      group-hover:scale-100
      group-hover:translate-y-0
      group-hover:pointer-events-auto
      group-hover:bg-white/10
      group-hover:backdrop-blur-sm
    "
          >
            <h2
              className="text-2xl font-bold text-gray-900 mb-3 
            group-hover:text-white group-hover:text-shadow-md"
            >
              Bộ sưu tập nữ
            </h2>

            <Link
              to="/shop?gender=Women"
              className="text-white underline text-lg group-hover:text-white group-hover:text-shadow-md"
            >
              Khám phá ngay
            </Link>
          </div>
          <div
            className="absolute bottom-0 left-0 w-full flex flex-col bg-white/80 backdrop-blur-md p-4
          group-hover:opacity-0"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              Bộ sưu tập nữ
            </h2>
            <Link to="/shop?gender=Men" className="text-gray-900 underline text-center">
              Khám phá ngay
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenderCollectionSection;
