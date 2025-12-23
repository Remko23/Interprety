import React, { useState } from 'react';
import axios from 'axios';

const RegisterForm = ({ onToggleForm }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/users/register', { username, password });
            setMessage('Zarejestrowano pomyślnie! Zaloguj się.');
            setTimeout(() => onToggleForm(), 2000); // Przełącz na logowanie po 2 sek.
        } catch (err) {
            setMessage(err.response?.data?.error || 'Błąd rejestracji');
        }
    };

    return (
        <div>
            <h2>Rejestracja</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Login" value={username} onChange={e => setUsername(e.target.value)} />
                <input type="password" placeholder="Hasło" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit">Zarejestruj się</button>
            </form>
            {message && <p>{message}</p>}
            <button onClick={onToggleForm}>Masz konto? Zaloguj się</button>
        </div>
    );
};

export default RegisterForm;