import React from 'react';
import { Link } from 'react-router-dom';

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
              <div className="bg-white overflow-hidden">
                <div className="w-full h-96 mb-4">
                  <img
                    src={product?.variants[0]?.images[0]?.url || 'aaa'}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-sm mb-2">{product.name}</h3>
                <p className="text-gray-500 font-medium text-sm tracking-tighter">
                  {product.discountPrice.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }) ||
                    product.price.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                </p>
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
