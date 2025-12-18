import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const OrderForm = () => {
  const [cart, setCart] = useState([]);
  const [userData, setUserData] = useState({ username: '', email: '', phone: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const updateQuantity = (id, delta) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { setError("Koszyk jest pusty"); return; }
    
    // Walidacja przed wysłaniem
    if (!userData.username || !userData.email.includes('@')) {
      setError("Podaj poprawne dane kontaktowe");
      return;
    }

    try {
      const orderPayload = {
        user: userData,
        items: cart.map(i => ({ product_id: i.id, quantity: i.quantity }))
      };
      await axios.post('http://localhost:3000/orders', orderPayload);
      localStorage.removeItem('cart');
      setCart([]);
      alert("Zamówienie złożone!");
    } catch (err) {
      setError(err.response?.data?.message || "Błąd podczas składania zamówienia");
    }
  };

  return (
    <div>
      <h3>Twoje Zamówienie</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table>
        <thead><tr><th>Towar</th><th>Ilość</th><th>Suma</th><th>Akcje</th></tr></thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                <Button size="sm" onClick={() => updateQuantity(item.id, -1)}>-</Button>
                <span className="mx-2">{item.quantity}</span>
                <Button size="sm" onClick={() => updateQuantity(item.id, 1)}>+</Button>
              </td>
              <td>{(item.price * item.quantity).toFixed(2)} zł</td>
              <td><Button variant="danger" size="sm" onClick={() => removeItem(item.id)}>Usuń</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h4>Razem: {totalPrice.toFixed(2)} zł</h4>

      <Form onSubmit={handleSubmit} className="mt-4">
        <Form.Group className="mb-2">
          <Form.Label>Nazwa użytkownika</Form.Label>
          <Form.Control onChange={e => setUserData({...userData, username: e.target.value})} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" onChange={e => setUserData({...userData, email: e.target.value})} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Telefon</Form.Label>
          <Form.Control onChange={e => setUserData({...userData, phone: e.target.value})} />
        </Form.Group>
        <Button type="submit" variant="primary">Zatwierdź zamówienie</Button>
      </Form>
    </div>
  );
};

export default OrderForm;