import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  // Initialize the navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password,
      });
      localStorage.removeItem('token');

      
      const { token } = response.data; // Assuming the JWT is in response.data.token
      console.log(response.expiresIn);
    
      localStorage.setItem('token', token); // Store token in localStorage
      console.log("token: " + token);
      

      // Navigate to the dashboard after successful login

    } catch (err) {
      setError('Invalid credentials or server error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button type="submit">Login</button>
      {error && <div>{error}</div>}
    </form>
  );
}

export default LoginPage;
