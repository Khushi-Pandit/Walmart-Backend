import React, { useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isPerishable: boolean;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/v1/api/products')
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json.data)) {
          setProducts(json.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-gray-600">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Product Page</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition duration-300"
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm mb-4">
                  Image Not Available
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-700">{product.name}</h2>
              <p className="text-gray-600 mt-1 text-sm">{product.description}</p>
              <p className="text-indigo-600 mt-2 font-semibold text-lg">₹{product.price}</p>
              <span className={`text-sm mt-2 inline-block px-2 py-1 rounded-full ${
                product.isPerishable ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
              }`}>
                {product.isPerishable ? 'Perishable' : 'Non-Perishable'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
