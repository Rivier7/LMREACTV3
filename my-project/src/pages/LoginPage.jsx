import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize the navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password,
      });

      // Get the token from the response
      const { token } = response.data;

      // Check if token exists
      if (token) {
        localStorage.setItem('token', token); // Store token in localStorage
        console.log("Token:", token);
        navigate('/dashboard'); // Navigate to the dashboard
        console.log('Login successful');
      } else {
        setError('No token received');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('Invalid credentials or server error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

        {/* Email Input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Password Input */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
        >
          Login
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-sm text-red-600 text-center">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

export default LoginPage;
