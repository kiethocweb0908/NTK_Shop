import React, { useState } from 'react';

const EditProdcutPage = () => {
  const [prodcutData, setProdcutData] = useState({
    name: '',
    description: '',
    price: 0,
    countInStock: 0,
    sku: '',
    category: '',
    brand: '',
    sizes: [],
    colors: [],
    collections: '',
    material: '',
    gender: '',
    images: [
      {
        url: "https://picsum.photos/500?random=10'",
      },
      {
        url: "https://picsum.photos/500?random=15'",
      },
      {
        url: "https://picsum.photos/500?random=20'",
      },
    ],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price') {
      const rawValue = value.replace(/\./g, '');
      if (!isNaN(rawValue)) {
        setProdcutData((prevData) => ({
          ...prevData,
          price: Number(rawValue),
          formattedPrice: new Intl.NumberFormat('vi-VN').format(rawValue),
        }));
      }
    } else {
      setProdcutData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    console.log(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(prodcutData);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
      <h2 className="text-3xl font-bold mb-6">Edit Prodcut</h2>
      <form onSubmit={handleSubmit}>
        {/* name*/}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Prodcut Name</label>
          <input
            type="text"
            name="name"
            value={prodcutData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        {/* Description */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Prodcut Description</label>
          <textarea
            name="description"
            value={prodcutData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            rows={4}
            required
          />
        </div>
        {/* price */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Prodcut Price</label>
          <input
            type="text"
            name="price"
            value={prodcutData.formattedPrice || 0}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        {/* count in stock */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Count in Stock</label>
          <input
            type="number"
            name="countInStock"
            value={prodcutData.countInStock}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        {/* sku */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">SKU</label>
          <input
            type="text"
            name="sku"
            value={prodcutData.sku}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        {/* Sizes */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Sizes (coma-separated)</label>
          <input
            type="text"
            name="sizes"
            value={prodcutData.sizes.join(', ')}
            onChange={(e) =>
              setProdcutData({
                ...prodcutData,
                sizes: e.target.value.split(',').map((size) => size.trim()),
              })
            }
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        {/* colors */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Sizes (coma-separated)</label>
          <input
            type="text"
            name="colors"
            value={prodcutData.colors.join(', ')}
            onChange={(e) =>
              setProdcutData({
                ...prodcutData,
                colors: e.target.value.split(',').map((color) => color.trim()),
              })
            }
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* image upload */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Upoad Image</label>
          <input
            type="file"
            multiple // cho phép chọn nhiều ảnh
            accept="image/*" // chỉ nhận file ảnh (jpg, png, webp, gif,...)
            onChange={handleImageUpload}
          />
          <div className="flex gap-4 mt-4">
            {prodcutData.images.map((image, index) => (
              <div key={index}>
                <img
                  src={image.url}
                  alt={image.altText || 'Product Image'}
                  className="w-20 h-20 object-cover rounded-md shadow-md"
                />
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProdcutPage;
