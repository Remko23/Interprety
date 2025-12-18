import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resProd = await axios.get('http://localhost:3000/products');
      const resCat = await axios.get('http://localhost:3000/categories');
      setProducts(resProd.data);
      setCategories(resCat.data);
    } catch (err) { setError("Błąd pobierania danych"); }
  };

  const handleUpdateProduct = async (id, updatedData) => {
    try {
      await axios.put(`http://localhost:3000/products/${id}`, updatedData);
      setError(null);
      fetchData();
    } catch (err) {
      // Wykorzystanie informacji o błędach przesyłanych z serwera
      setError(err.response?.data?.message || "Błąd walidacji serwera");
    }
  };

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert("Dodano do koszyka!");
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(filterName.toLowerCase()) &&
    (filterCategory === '' || p.category_id === parseInt(filterCategory))
  );

  return (
    <div>
      <h2>Katalog Towarów</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="mb-3">
        <Col><Form.Control placeholder="Szukaj po nazwie..." onChange={e => setFilterName(e.target.value)} /></Col>
        <Col>
          <Form.Select onChange={e => setFilterCategory(e.target.value)}>
            <option value="">Wszystkie kategorie</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
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
                <Button variant="success" size="sm" onClick={() => addToCart(p)}>Kup</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ProductList;