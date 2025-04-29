'use client';
import { useState } from 'react';
import StarryBackground from '@/app/components/StarryBackground';

export default function PlotSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const dummyAPI = async (plotDescription) => {
    // Simulate a delay
    await new Promise((res) => setTimeout(res, 1000));

    // Fake results (replace with actual API later)
    return [
      { id: 1, title: 'Interstellar (2014)', match: 92 },
      { id: 2, title: 'The Martian (2015)', match: 87 },
      { id: 3, title: 'Gravity (2013)', match: 83 },
      { id: 4, title: 'Contact (1997)', match: 76 },
    ];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const response = await dummyAPI(query);
    setResults(response);
    setLoading(false);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: '#181822',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    }}>
      {/* Stars */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        <StarryBackground />
      </div>

      {/* Search Box */}
      <form onSubmit={handleSubmit} style={{
        zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.75)',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 0 20px rgba(75, 75, 250, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h1 style={{
          color: 'white',
          marginBottom: '20px',
          fontSize: '2rem',
          textAlign: 'center'
        }}>
          Search by Plot
        </h1>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter plot description..."
          style={{
            width: '300px',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            marginBottom: '20px',
            backgroundColor: '#333',
            color: 'white',
          }}
        />

        <button type="submit" style={{
          padding: '10px 20px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: 'rgba(75, 75, 250, 0.8)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1rem',
          cursor: 'pointer',
        }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Results Section */}
      <div style={{
        zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: '20px',
        borderRadius: '10px',
        width: '400px',
        color: 'white',
        boxShadow: '0 0 10px rgba(255,255,255,0.1)',
      }}>
        {results.length > 0 ? (
          <div>
            <h2 style={{ marginBottom: '10px' }}>Recommended Movies:</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {results.map(movie => (
                <li key={movie.id} style={{ marginBottom: '10px' }}>
                  {movie.title} — <span style={{ color: '#8be9fd' }}>{movie.match}% match</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          !loading && <p style={{ textAlign: 'center' }}>No results yet.</p>
        )}
      </div>
    </div>
  );
}
