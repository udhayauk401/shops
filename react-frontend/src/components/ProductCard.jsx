export default function ProductCard({ product }) {
  return (
    <div className="card">
      <div className="card-image">
        <img
          src={product.imageUrl || product.image || 'https://via.placeholder.com/300x350?text=No+Image'}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300x350?text=No+Image';
          }}
        />
        <span className="category-chip">{product.category}</span>
      </div>
      <div className="card-body">
        <h2>{product.name}</h2>
        <p>{product.description || 'Premium dress for your wardrobe.'}</p>
        <div className="card-footer">
          <span className="price">₹{Number(product.price).toLocaleString('en-IN')}</span>
          <button type="button" className="primary-btn">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
