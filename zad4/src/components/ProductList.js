import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductList = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState({ name: '', category: '' });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:2323/products', { headers: { Authorization: token } })
      .then(res => setProducts(res.data))
      .catch(err => { if(err.response?.status === 401) navigate('/login'); });

    axios.get('http://localhost:2323/categories').then(res => setCategories(res.data));
  }, [token, navigate]);

  if (!token) return null;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(filter.name.toLowerCase()) &&
    (filter.category === "" || p.category_id.toString() === filter.category)
  );

  return (
    <div>
      <h3>Lista Towarów</h3>
      <div className="row mb-3">
        <div className="col-md-6">
          <input 
            type="text" className="form-control" placeholder="Szukaj po nazwie..." 
            onChange={(e) => setFilter({...filter, name: e.target.value})}
          />
        </div>
        <div className="col-md-6">
          <select className="form-select" onChange={(e) => setFilter({...filter, category: e.target.value})}>
            <option value="">Wszystkie kategorie</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nazwa</th>
            <th>Opis</th>
            <th>Cena</th>
            <th>Akcja</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>{p.price} PLN</td>
              <td className="text-end">
                <button className="btn btn-primary btn-sm" onClick={() => addToCart(p)}>Kup</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;