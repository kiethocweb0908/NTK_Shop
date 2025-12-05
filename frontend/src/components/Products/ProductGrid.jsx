import React from 'react';
import { Link } from 'react-router-dom';

// format
import { formatCurrency } from '@/lib/utils';

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
              <div className="bg-white relative group">
                <div className="w-full h-96 mb-4 overflow-hidden">
                  <img
                    src={product?.variants[0]?.images[0]?.url || 'aaa'}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-110 duration-300 transition-all ease-in-out"
                  />
                </div>
                {product.discountPrice && (
                  <p className="absolute -top-1 -right-1 p-2 rounded-full bg-primary-300 text-white font-medium text-">
                    {product.discountPercentage ||
                      Math.floor(
                        ((product.discountPrice - product.price) / product.price) * 100
                      )}
                    %
                  </p>
                )}

                <div
                  className="absolute bottom-0 w-full bg-black/80 py-2 px-3 rounded-b-lg text-white
                group-hover:bg-black duration-300"
                >
                  <h3 className="text-sm mb-2 truncate block w-full">{product.name}</h3>
                  <div className="flex gap-3 items-center">
                    <p
                      className={`text-white/80 font-medium text-sm tracking-tighter
                  ${product.discountPrice ? 'line-through' : ''}`}
                    >
                      {formatCurrency(product.price)}
                    </p>
                    {product.discountPrice && (
                      <p className="text-primary-300">
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
