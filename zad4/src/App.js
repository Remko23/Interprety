import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProductList from './components/ProductList';
import Checkout from './components/Checkout';
import OrderManagement from './components/OrderManagement';
import axios from 'axios';

function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          <Link className="navbar-brand" alt="Shop name" to="/">SuperNazwa</Link>
          <div className="navbar-nav">
            <Link className="nav-link" to="/">Towary</Link>
            <Link className="nav-link" to="/checkout">Koszyk ({cart.reduce((a, b) => a + b.quantity, 0)})</Link>
            <Link className="nav-link" to="/admin">Zamówienia</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<ProductList addToCart={addToCart} />} />
          <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} />} />
          <Route path="/admin" element={<OrderManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;