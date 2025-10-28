import React from 'react';
import mensCollectionImage from '../../assets/mens-collection.webp';
import woMensCollectionImage from '../../assets/womens-collection.webp';
import { Link } from 'react-router-dom';

const GenderCollectionSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto flex flex-col md:flex-row gap-8 px-4 md:px-0">
        {/* bộ sưu tập nam */}
        <div className="relative flex-1">
          <img
            src={mensCollectionImage}
            alt="Bộ sưu tập nam"
            className="w-full h-[700px] object-cover"
          />
          <div className="absolute bottom-0 left-8 bg-white/90 p-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Bộ sưu tập nam</h2>
            <Link to="/collections/all?gender=Women" className="text-gray-900 underline">
              Khám phá ngay
            </Link>
          </div>
        </div>

        {/* bộ sưu tập nữ */}
        <div className="relative flex-1">
          <img
            src={woMensCollectionImage}
            alt="Bộ sưu tập nữ"
            className="w-full h-[700px] object-cover"
          />
          <div className="absolute bottom-0 left-8 bg-white/90 p-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Bộ sưu tập nữ</h2>
            <Link to="/collections/all?gender=Men" className="text-gray-900 underline">
              Khám phá ngay
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenderCollectionSection;
