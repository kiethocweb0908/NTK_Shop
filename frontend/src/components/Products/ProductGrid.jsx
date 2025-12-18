import React from 'react';
import { Link } from 'react-router-dom';

// format
import { formatCurrency, toWebp } from '@/lib/utils';

const ProductGrid = React.memo(({ products, loading, error }) => {
  if (loading) return <p className="text-center">Đang tìm sản phẩm...</p>;

  if (error) return <p>Error: {error}</p>;

  console.log('ProductGrid');
  return (
    <>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
          {products.map((product) => (
            <Link key={product._id} to={`/product/${product._id}`} className="block">
              <div className="bg-white relative group ">
                <div
                  className="w-full h-96 mb-4 overflow-hidden rounded-lg 
                group-hover:rounded-2xl 
                transition-all duration-300 ease-in"
                >
                  <img
                    src={toWebp(product?.variants[0]?.images[0]?.url) || 'aaa'}
                    className="w-full h-full object-cover 
                    group-hover:scale-110 
                    duration-300 transition-all ease-in"
                  />
                </div>
                {product.discountPrice && (
                  <p
                    className="absolute -top-1 -right-1 p-2 rounded-full border-t-[0.25px] border-white/50 border-l-[0.15px]
                    backdrop-blur-xl
                    bg-linear-to-br from-transparent/20 to-red-700/30  text-white text-shadow-md font-medium text-"
                  >
                    -
                    {product.discountPercentage ||
                      Math.floor(
                        ((product.discountPrice - product.price) / product.price) * 100
                      )}
                    %
                  </p>
                )}

                <div
                  className="absolute bottom-0 w-full py-4 px-4 text-white/60 rounded-b-lg
                  backdrop-blur-md bg-black/20 border-t border-white/20
                group-hover:backdrop-blur-lg group-hover:bg-black/30 group-hover:py-6
                group-hover:rounded-b-2xl
                duration-300 ease-linear"
                >
                  <h3
                    className="text-sm text-white font-semibold text-shadow-md mb-2 block w-full text-center
                    overflow-hidden max-h-5 
                  group-hover:max-h-20
                  transition-all duration-400 ease-in"
                  >
                    {product.name}
                  </h3>

                  <div className="flex gap-3 items-center justify-center">
                    <p
                      className={`text-gray-100 text-sm tracking-tighter text-shadow-md
                  ${product.discountPrice ? 'line-through' : 'font-semibold'}`}
                    >
                      {formatCurrency(product.price)}
                    </p>
                    {product.discountPrice && (
                      <p
                        className="text-red-500 text-shadow-md 
                      group-hover:font-bold group-hover:text-red-400
                      transition-all duration-200 ease-in"
                      >
                        {formatCurrency(product.discountPrice)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center font-medium">Không tìm thấy sản phẩm!</p>
      )}
    </>
  );
});

export default ProductGrid;
