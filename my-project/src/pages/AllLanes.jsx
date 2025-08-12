import React from 'react';
import { useState, useEffect } from 'react';
import { getLanes } from '../api/api.js';
import Lanes from '../components/Lanes.jsx';
import Header from '../components/Header.jsx';

function AllLanes() {
  const [lanes, setLanes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    
    const loadLanes = async () => {
      try {
        const lanes = await getLanes(); 
        console.log("Fetched data:", lanes); // ✅ Log the data here
        if (!lanes || lanes.length === 0) {
          setError("No data available");
        } else {
          setLanes(lanes);
        }
      } catch (error) {
        setError("Error loading data");
        console.error("API Error:", error);
      } finally {
        setLoading(false);
        console.log('done');
      }
    };
  
    loadLanes();
  }, []);

  if (loading) return <><Header /><p>Loading...</p></>;
  if (error) return <><Header /> <p>{error}</p></>;

  return (

    <>
    
      <Header /> {/* Test Header visibility */}

      <Lanes lanes={lanes}/>

    </>

  );
}

export default AllLanes;
