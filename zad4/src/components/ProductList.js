import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductList = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Teraz będą pobierane
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const API_URL = 'http://localhost:2323';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Błąd pobierania produktów", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Błąd pobierania kategorii", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_URL}/products/${editingProduct.id}`, editingProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingProduct(null);
      fetchProducts();
      setErrorMsg('');
    } catch (error) {
      // Wymaganie: błędy z serwera
      setErrorMsg(error.response?.data?.error || "Błąd walidacji serwera");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesName = p.name.toLowerCase().includes(nameFilter.toLowerCase());
    // Obsługa kategorii jako obiektu lub stringa
    const pCat = typeof p.category === 'object' ? p.category.name : p.category;
    const matchesCategory = categoryFilter === '' || pCat === categoryFilter;
    return matchesName && matchesCategory;
  });

  return (
    <div className="container mt-4">
      <h2>Produkty</h2>
      <div className="row mb-3">
        <div className="col-md-6">
          <input type="text" className="form-control" placeholder="Szukaj po nazwie..." 
                 onChange={e => setNameFilter(e.target.value)} />
        </div>
        <div className="col-md-6">
          <select className="form-select" onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">Wszystkie kategorie</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nazwa</th>
            <th>Opis</th>
            <th>Cena</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>{p.price} zł</td>
              <td>
                <button className="btn btn-success btn-sm me-2" onClick={() => addToCart(p)}>Kup</button>
                <button className="btn btn-primary btn-sm" onClick={() => setEditingProduct(p)}>Edytuj</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingProduct && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleEditSubmit}>
                <div className="modal-header"><h5>Edytuj: {editingProduct.name}</h5></div>
                <div className="modal-body">
                  <label>Cena:</label>
                  <input type="number" className="form-control" value={editingProduct.price} 
                         onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} />
                  <label className="mt-2">Waga:</label>
                  <input type="number" className="form-control" value={editingProduct.weight} 
                         onChange={e => setEditingProduct({...editingProduct, weight: e.target.value})} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingProduct(null)}>Anuluj</button>
                  <button type="submit" className="btn btn-primary">Zapisz (Walidacja serwera)</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;