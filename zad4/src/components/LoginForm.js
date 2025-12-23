import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ setToken }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegisterMode) {
        const res = await axios.post('http://localhost:2323/users/register', form);
        setMessage(res.data.message);
        setIsRegisterMode(false); // Po rejestracji przełącz na logowanie
      } else {
        const res = await axios.post('http://localhost:2323/users/login', form);
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      }
    } catch (err) {
      setMessage("Błąd: " + (err.response?.data?.message || "Błąd połączenia"));
    }
  };

  return (
    <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
      <h4>{isRegisterMode ? 'Rejestracja' : 'Logowanie'}</h4>
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" placeholder="Login" 
               onChange={e => setForm({...form, username: e.target.value})} />
        <input className="form-control mb-2" type="password" placeholder="Hasło" 
               onChange={e => setForm({...form, password: e.target.value})} />
        <button className="btn btn-primary w-100">{isRegisterMode ? 'Zarejestruj się' : 'Zaloguj'}</button>
      </form>
      {message && <div className="alert alert-info mt-2">{message}</div>}
      <button className="btn btn-link mt-2" onClick={() => setIsRegisterMode(!isRegisterMode)}>
        {isRegisterMode ? 'Masz konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
      </button>
    </div>
  );
};

export default LoginForm;