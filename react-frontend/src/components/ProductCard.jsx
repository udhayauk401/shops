const placeholderImage = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 350%22%3E%3Crect width=%22300%22 height=%22350%22 fill=%22%23f4f4f4%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial,Helvetica,sans-serif%22 font-size=%2220%22 fill=%22%23777%22%3ENo Image%3C/text%3E%3C/svg%3E';

export default function ProductCard({ product }) {
  return (
    <div className="card">
      <div className="card-image">
        <img
          src={product.imageUrl || product.image || placeholderImage}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.src = placeholderImage;
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
