import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:2323/login', { username, password });
      const token = response.data.token;
      localStorage.setItem('token', token);
      setToken(token);
      navigate('/');
    } catch (err) {
      setError('Błędne dane logowania');
    }
  };

  return (
    <div className="container mt-5" style={{maxWidth: '400px'}}>
      <h3>Logowanie</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input className="form-control" placeholder="Login" onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="mb-3">
          <input className="form-control" type="password" placeholder="Hasło" onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary w-100">Zaloguj</button>
      </form>
    </div>
  );
};

export default LoginForm;