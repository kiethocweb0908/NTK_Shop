import React from 'react';
import { RiDeleteBin3Line } from 'react-icons/ri';
const CartContents = () => {
  const cartProducts = [
    {
      productId: 1,
      name: 'T-shirt',
      size: 'M',
      color: 'Red',
      quantity: 1,
      price: 250000,
      image: 'https://picsum.photos/200?random=1',
    },
    {
      productId: 2,
      name: 'Jean',
      size: 'L',
      color: 'Blue',
      quantity: 1,
      price: 250000,
      image: 'https://picsum.photos/200?random=1',
    },
    {
      productId: 3,
      name: 'Sweater',
      size: 'L',
      color: 'Green',
      quantity: 1,
      price: 250000,
      image: 'https://picsum.photos/200?random=1',
    },
    {
      productId: 4,
      name: 'Jacket',
      size: 'XL',
      color: 'Black',
      quantity: 1,
      price: 250000,
      image: 'https://picsum.photos/200?random=1',
    },
  ];

  return (
    <div>
      {cartProducts.map((product, index) => (
        <div className="flex items-start justify-between py-4 border-b" key={index}>
          <div className="flex items-start">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-24 object-cover mr-4 rounded"
            />
          </div>
          <div className="flex-1 flex flex-col justify-between h-23">
            <h3>{product.name}</h3>
            <p className="text-sm text-gray-500">
              {product.size} | {product.color}
            </p>
            <div className="flex items-center">
              <button
                className="border rounded h-6 w-6 leading-[22px] text-xl font-medium
              cursor-pointer hover:border-primary-400 hover:text-primary-400"
              >
                -
              </button>
              <span className="mx-4">{product.quantity}</span>
              <button
                className="border rounded h-6 w-6 leading-[22px] text-xl font-medium
              cursor-pointer hover:border-primary-400 hover:text-primary-400"
              >
                +
              </button>
            </div>
          </div>

          {/* nút xoá và giá */}
          <div className="flex flex-col items-end justify-between h-23">
            <p>{product.price.toLocaleString()} vnđ</p>
            <button className="cursor-pointer">
              <RiDeleteBin3Line className="h-6 w-6 mt-2 text-end hover:text-primary-300" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartContents;
