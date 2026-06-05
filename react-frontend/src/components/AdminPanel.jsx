import { useState } from 'react';

export default function AdminPanel({ categories, onSave }) {
  const [form, setForm] = useState({ name: '', price: '', category: '', description: '', imageUrl: '' });
  const [status, setStatus] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.price || !form.category) {
      setStatus('Name, Price and Category are required.');
      return;
    }

    await onSave({
      name: form.name,
      price: Number(form.price),
      category: form.category,
      description: form.description,
      imageUrl: form.imageUrl,
    });

    setForm({ name: '', price: '', category: '', description: '', imageUrl: '' });
    setStatus('Product added successfully.');
    setTimeout(() => setStatus(''), 4000);
  };

  return (
    <form className="admin-panel" onSubmit={handleSubmit}>
      <h2>Add Product</h2>
      <label>
        Name *
        <input name="name" value={form.name} onChange={handleChange} placeholder="Elegant Black Gown" />
      </label>
      <label>
        Price (₹) *
        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="2999" />
      </label>
      <label>
        Category *
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Premium party wear gown" />
      </label>
      <label>
        Image URL
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/product.jpg" />
      </label>
      <button type="submit" className="save-btn">
        Save Product
      </button>
      {status && <p className="form-status">{status}</p>}
    </form>
  );
}
