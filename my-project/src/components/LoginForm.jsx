import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveToken } from '../utils/auth';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password,
      });

      const token = res.data.token;
      saveToken(token); // Save to localStorage
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid login credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Email:</label><br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Password:</label><br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
