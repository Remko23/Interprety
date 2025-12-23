import React, { useState } from 'react';
import axios from 'axios';

const Checkout = ({ cart, clearCart }) => {
  const [contact, setContact] = useState({ username: '', email: '', phone: '' });
  const [message, setMessage] = useState('');

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Walidacja frontendowa
    if (!contact.email.includes('@')) {
        setMessage("Błędny format email");
        return;
    }

    const orderData = {
      contact,
      items: cart,
      totalValue: total
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:2323/orders', orderData, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Zamówienie złożone pomyślnie!");
      clearCart();
    } catch (err) {
      setMessage("Błąd podczas składania zamówienia. Czy jesteś zalogowany?");
    }
  };

  if (cart.length === 0 && !message) return <div className="container mt-4">Koszyk jest pusty.</div>;

  return (
    <div className="container mt-4">
      <h2>Twoje zamówienie</h2>
      <table className="table">
        <thead>
          <tr><th>Towar</th><th>Sztuk</th><th>Suma</th></tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity || 1}</td>
              <td>{(item.price * (item.quantity || 1)).toFixed(2)} zł</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4>Suma całkowita: {total.toFixed(2)} zł</h4>

      <form onSubmit={handleSubmit} className="mt-4 p-3 border rounded bg-light">
        <h5>Dane kontaktowe</h5>
        <input className="form-control mb-2" placeholder="Nazwa użytkownika" required
               onChange={e => setContact({...contact, username: e.target.value})} />
        <input className="form-control mb-2" type="email" placeholder="Email" required
               onChange={e => setContact({...contact, email: e.target.value})} />
        <input className="form-control mb-2" placeholder="Telefon" required
               onChange={e => setContact({...contact, phone: e.target.value})} />
        <button className="btn btn-success">Potwierdzam zamówienie</button>
      </form>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};

export default Checkout;