import React, { useState } from 'react';
import axios from 'axios';

const Checkout = ({ cart, setCart }) => {
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const validate = () => {
    let tempErrors = {};
    if (!user.name) tempErrors.name = "Nazwa jest wymagana";
    if (!/\S+@\S+\.\S+/.test(user.email)) tempErrors.email = "Email jest nieprawidłowy";
    if (!/^\d{9}$/.test(user.phone)) tempErrors.phone = "Telefon musi mieć 9 cyfr";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const submitOrder = () => {
    if (!validate()) return;
    
    const orderData = {
      user,
      items: cart.map(i => ({ product_id: i.id, quantity: i.quantity }))
    };

    axios.post('http://localhost:2323/orders', orderData)
      .then(() => {
        alert("Zamówienie złożone!");
        setCart([]);
      })
      .catch(err => alert("Błąd: " + err.response.data.message));
  };

  return (
    <div className="row">
      <div className="col-md-8">
        <h4>Twoje produkty</h4>
        <table className="table">
          <thead><tr><th>Nazwa</th><th>Ilość</th><th>Suma</th><th></th></tr></thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <button className="btn btn-sm btn-secondary me-2" onClick={() => {/* logika - */}}>-</button>
                  {item.quantity}
                  <button className="btn btn-sm btn-secondary ms-2" onClick={() => {/* logika + */}}>+</button>
                </td>
                <td>{(item.price * item.quantity).toFixed(2)} PLN</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => setCart(cart.filter(i => i.id !== item.id))}>Usuń</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <h5>Łącznie: {total.toFixed(2)} PLN</h5>
      </div>
      <div className="col-md-4">
        <h4>Dane kontaktowe</h4>
        <div className="mb-2">
          <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} placeholder="Imię i nazwisko" onChange={e => setUser({...user, name: e.target.value})} />
          <div className="invalid-feedback">{errors.name}</div>
        </div>
        <div className="mb-2">
          <input className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="Email" onChange={e => setUser({...user, email: e.target.value})} />
          <div className="invalid-feedback">{errors.email}</div>
        </div>
        <div className="mb-2">
          <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} placeholder="Telefon" onChange={e => setUser({...user, phone: e.target.value})} />
          <div className="invalid-feedback">{errors.phone}</div>
        </div>
        <button className="btn btn-success w-100 mt-3" onClick={submitOrder} disabled={cart.length === 0}>Złóż zamówienie</button>
      </div>
    </div>
  );
};

export default Checkout;