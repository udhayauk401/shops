import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import FilterBar from './components/FilterBar';
import ProductGrid from './components/ProductGrid';
import AdminPanel from './components/AdminPanel';

const CATEGORIES = ['All', 'Classic', 'Formal', 'Party', 'Traditional'];

function App() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProducts = async (category = 'All') => {
    setLoading(true);
    try {
      const url = category === 'All' ? '/api/products' : `/api/products?category=${encodeURIComponent(category)}`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Fetch products failed', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory]);

  const handleFilter = (category) => {
    setActiveCategory(category);
  };

  const handleAddProduct = async (product) => {
    try {
      await axios.post('/api/products', product);
      setMessage('Product added successfully.');
      fetchProducts(activeCategory);
    } catch (error) {
      console.error('Create product failed', error);
      setMessage(error.response?.data?.message || 'Failed to add product.');
    }
  };

  const productCountLabel = useMemo(() => {
    if (activeCategory === 'All') return `Showing all ${products.length} products`;
    return `${products.length} product(s) in ${activeCategory}`;
  }, [products.length, activeCategory]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>DressLux</h1>
          <p>Elegant dresses, beautifully filtered.</p>
        </div>
        <button className="admin-toggle" onClick={() => setShowAdmin((prev) => !prev)}>
          {showAdmin ? 'Close Admin' : 'Add Product'}
        </button>
      </header>

      {showAdmin && <AdminPanel categories={CATEGORIES.slice(1)} onSave={handleAddProduct} />}

      <section className="filter-section">
        <FilterBar categories={CATEGORIES} active={activeCategory} onFilter={handleFilter} />
      </section>

      <div className="status-row">
        <div>{productCountLabel}</div>
        {message && <div className="toast">{message}</div>}
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}

export default App;
