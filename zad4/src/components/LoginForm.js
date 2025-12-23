import { useState } from 'react';

function LoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:2323/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        alert('Zalogowano pomyślnie!');
      } else {
        alert('Błąd: ' + data.detail);
      }
    } catch (error) {
      console.error("Błąd połączenia:", error);
    }
  };

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit} className="col-md-4 mx-auto">
        <h2>Logowanie</h2>
        <div className="mb-3">
          <label className="form-label">Login</label>
          <input 
            type="login" 
            className="form-control" 
            value={login} 
            onChange={(e) => setLogin(e.target.value)} 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Hasło</label>
          <input 
            type="password" 
            className="form-control" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit" className="btn btn-primary">Zaloguj</button>
      </form>
    </div>
  );
}

export default LoginForm;