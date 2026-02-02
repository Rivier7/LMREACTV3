import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const token = res.data.token;
      login(token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid login credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Email:</label>
        <br />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>

      <div>
        <label>Password:</label>
        <br />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
