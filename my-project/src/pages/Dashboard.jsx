import axios from 'axios';
import { useState, useEffect } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage

      console.log(token)
      if (!token) {
        setError('No token found, please log in again.');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}` // Send token in Authorization header
          }
        });
        console.log('Token from localStorage:', token); // Debugging
        console.log(response);

        setData(response.data); // Set the response data
      } catch (err) {
        if (err.response) {
          // Handle specific error status codes
          if (err.response.status === 401 || err.response.status === 403) {
            setError('You are not authorized or session expired');
          } else {
            setError('An error occurred while fetching data');
          }
        } else {
          setError('Network error');
        }
        console.error(err);
      }
    };

    fetchData();
  }, []); // Fetch data on mount

  if (error) {
    return <div>{error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Dashboard;
