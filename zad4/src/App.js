import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProductList from './components/ProductList';
import Checkout from './components/Checkout';
import OrderManagement from './components/OrderManagement';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import axios from 'axios';

function App() {
  const [cart, setCart] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));

  axios.defaults.baseURL = 'http://localhost:2323';

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(config => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          setToken(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCart([]);
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          <Link className="navbar-brand" to="/">🛒 SklepInterprety</Link>
          <div className="collapse navbar-collapse">
            <div className="navbar-nav me-auto">
              <Link className="nav-link" to="/">Towary</Link>
              <Link className="nav-link" to="/checkout">
                Koszyk <span className="badge bg-primary">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
              </Link>
              {token && <Link className="nav-link" to="/admin">Zarządzaj</Link>}
            </div>
            <div className="navbar-nav">
              {!token ? (
                <>
                  <Link className="nav-link" to="/login">Zaloguj</Link>
                  <Link className="nav-link" to="/register">Rejestracja</Link>
                </>
              ) : (
                <button className="btn btn-outline-light btn-sm" onClick={logout}>Wyloguj</button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<ProductList addToCart={addToCart} />} />
          
          <Route path="/login" element={!token ? <LoginForm setToken={setToken} /> : <Navigate to="/" />} />
          <Route path="/register" element={<RegisterForm />} />

          <Route path="/checkout" element={token ? <Checkout cart={cart} setCart={setCart} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={token ? <OrderManagement /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;