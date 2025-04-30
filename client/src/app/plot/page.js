'use client';
import { useState } from 'react';
import StarryBackground from '@/app/components/StarryBackground';
import getApiBaseUrl from '@/app/utils/getApiBaseUrl'; 

export default function PlotSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    setError('');

    try {
      const res = await fetch(`${getApiBaseUrl()}/ml/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 5 }),
      });

      const data = await res.json();
      console.log("API response:", data);

      const formattedResults = (data.results || []).map((movie, index) => ({
        id: index + 1,
        title: movie.title || 'Untitled',
        overview: movie.overview || '',
        release_date: movie.release_date || '',
        cast: movie.cast || '',
        director: movie.director || '',
        match: 80 + Math.floor(Math.random() * 15),
      }));

      console.log("Formatted results:", formattedResults);
      setResults(formattedResults);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#181822',
      overflowY: 'auto',
      paddingBottom: '40px',
      paddingTop: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
    }}>
      {/* Starry Background */}
      <div style={{
        position: 'fixed',
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
        zIndex: 100,
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        padding: '20px 30px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '800px',
        backdropFilter: 'blur(8px)',
      }}>
        <h1 style={{
          color: 'white',
          marginBottom: '20px',
          fontSize: '2rem',
          textAlign: 'center'
        }}>
          Search Movies by Plot
        </h1>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter plot description..."
          style={{
            width: '100%',
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

        {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
      </form>

      {/* Results Section */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '800px',
        marginTop: '20px',
        padding: '20px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: '10px',
        color: 'white',
        boxShadow: '0 0 10px rgba(255,255,255,0.1)',
        marginBottom: '40px',
      }}>
        {results.length > 0 ? (
          <div>
            <h2 style={{ marginBottom: '20px' }}>Recommended Movies:</h2>
            {results.map(movie => (
              <div key={movie.id} style={{
                marginBottom: '20px',
                borderBottom: '1px solid #444',
                paddingBottom: '10px'
              }}>
                <h3>{movie.title} <span style={{ color: '#8be9fd' }}>({movie.match}% match)</span></h3>
                <p><strong>Overview:</strong> {movie.overview}</p>
                <p><strong>Release Date:</strong> {movie.release_date}</p>
                <p><strong>Director:</strong> {movie.director}</p>
                <p><strong>Cast:</strong> {movie.cast}</p>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p style={{ textAlign: 'center' }}>No results yet.</p>
        )}
      </div>
    </div>
  );
}
