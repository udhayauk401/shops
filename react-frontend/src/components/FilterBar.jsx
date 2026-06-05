export default function FilterBar({ categories, active, onFilter }) {
  return (
    <div className="filter-bar">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`filter-btn ${active === category ? 'active' : ''}`}
          onClick={() => onFilter(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
