"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import useMoviesData from './MovieData';
import useSimilarMovies from './SimilarMovies';
import { drawConnections } from './ConnectionRenderer';
import { drawMovieNode } from './MovieNodeRenderer';
import { drawSelectedMovieInfo } from './MovieInfoRenderer';

export default function MovieRecommendationGraph() {
  const canvasRef = useRef(null);
  const movies = useMoviesData();

  /* =====================
   *  Selection & Filters
   * =====================*/
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Genre filtering ----------------------------------
  const [selectedGenres, setSelectedGenres] = useState(new Set());
  const toggleGenre = (genre) => {
    setSelectedGenres(prev => {
      const next = new Set(prev);
      next.has(genre) ? next.delete(genre) : next.add(genre);
      return next;
    });
  };
  const clearGenres = () => setSelectedGenres(new Set()); // "Show All"

  // Movies that pass the genre filter
  const visibleMovies = useMemo(() => {
    if (selectedGenres.size === 0) return movies;
    return movies.filter(m => m.genres.some(g => selectedGenres.has(g)));
  }, [movies, selectedGenres]);

  // If the selected movie is no longer visible, deselect it
  useEffect(() => {
    if (selectedMovie && !visibleMovies.some(m => m.id === selectedMovie.id)) {
      setSelectedMovie(null);
    }
  }, [visibleMovies, selectedMovie]);

  const similarMovies = useSimilarMovies(selectedMovie, visibleMovies);

  /* ================
   *  Zoom / Pan
   * ================*/
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  /* ================
   *  Search
   * ================*/
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    if (searchText.length === 0) {
      setSuggestions([]);
      return;
    }
    const filtered = movies
      .filter(movie => movie.title.toLowerCase().includes(searchText.toLowerCase()))
      .slice(0, 10);
    setSuggestions(filtered);
  }, [searchText, movies]);

  const handleSearchSelect = (movie) => {
    setSelectedMovie(movie);
    const canvas = canvasRef.current;
    if (canvas) {
      const centerX = canvas.width / (2 * (window.devicePixelRatio || 1));
      const centerY = canvas.height / (2 * (window.devicePixelRatio || 1));
      setPanOffset({
        x: centerX - movie.x * zoomLevel,
        y: centerY - movie.y * zoomLevel,
      });
    }
    setSearchText('');
    setSuggestions([]);
  };

  /* ================
   *  Canvas Render
   * ================*/
  useEffect(() => {
    if (!canvasRef.current || visibleMovies.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr * zoomLevel, dpr * zoomLevel);
    ctx.translate(panOffset.x / zoomLevel, panOffset.y / zoomLevel);

    // Draw connections & nodes only for visible movies
    drawConnections(ctx, visibleMovies, selectedMovie, similarMovies);

    visibleMovies.forEach(movie => {
      const adjustedMouseX = (mousePosition.x - panOffset.x) / zoomLevel;
      const adjustedMouseY = (mousePosition.y - panOffset.y) / zoomLevel;
      const distance = Math.sqrt((movie.x - adjustedMouseX) ** 2 + (movie.y - adjustedMouseY) ** 2);
      const isHovered = distance <= movie.radius;
      const isHighlighted = selectedMovie && (
        movie.id === selectedMovie.id ||
        similarMovies.some(m => m.id === movie.id)
      );
      drawMovieNode(ctx, movie, isHighlighted, isHovered, selectedMovie);
    });

    if (selectedMovie) {
      drawSelectedMovieInfo(ctx, selectedMovie, similarMovies);
    }
    ctx.restore();
  }, [visibleMovies, selectedMovie, similarMovies, mousePosition, zoomLevel, panOffset]);

  /* ================
   *  Mouse Events
   * ================*/
  const screenToGraphCoordinates = (screenX, screenY) => {
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (screenX / dpr - panOffset.x) / zoomLevel,
      y: (screenY / dpr - panOffset.y) / zoomLevel,
    };
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setMousePosition({ x, y });
    if (isDragging) {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      setPanOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setDragStart({ x, y });
    }
  };

  const handleClick = (e) => {
    if (isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const graphCoords = screenToGraphCoordinates(x, y);
    const clickedMovie = visibleMovies.find((movie) => {
      const distance = Math.sqrt((movie.x - graphCoords.x) ** 2 + (movie.y - graphCoords.y) ** 2);
      return distance <= movie.radius;
    });
    setSelectedMovie(clickedMovie || null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.1, Math.min(5, zoomLevel * zoomFactor));
    if (zoomLevel !== newZoom) {
      const ratio = newZoom / zoomLevel;
      const newPanX = mouseX - (mouseX - panOffset.x) * ratio;
      const newPanY = mouseY - (mouseY - panOffset.y) * ratio;
      setPanOffset({ x: newPanX, y: newPanY });
      setZoomLevel(newZoom);
    }
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    setIsDragging(true);
    setDragStart({ x, y });
    canvas.style.cursor = 'grabbing';
  };

  const endDrag = () => {
    if (isDragging) {
      setIsDragging(false);
      if (canvasRef.current) canvasRef.current.style.cursor = 'default';
    }
  };

  /* ================
   *  Event Listeners Lifecycle
   * ================*/
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.cursor = isDragging ? 'grabbing' : 'default';
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('mouseleave', endDrag);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', endDrag);
      canvas.removeEventListener('mouseleave', endDrag);
    };
  }, [visibleMovies, isDragging, zoomLevel, panOffset]);

  /* ================
   *  Fade-in on mount
   * ================*/
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), 100);
    return () => clearTimeout(timer);
  }, []);

  /* ================
   *  Collect all genres for UI
   * ================*/
  const allGenres = useMemo(() => {
    const s = new Set();
    movies.forEach(m => m.genres.forEach(g => s.add(g)));
    return Array.from(s).sort();
  }, [movies]);

  /* =============================================================
   *  JSX
   * =============================================================*/
  return (
    <>
      {/* Search Box */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        background: 'rgba(0, 0, 0, 1)',
        padding: '10px',
        borderRadius: '8px',
        width: '300px',
        color: 'white',
      }}>
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: 'none',
            marginBottom: '5px',
          }}
        />
        {suggestions.length > 0 && (
          <ul style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
          }}>
            {suggestions.map(movie => (
              <li
                key={movie.id}
                onClick={() => handleSearchSelect(movie)}
                style={{
                  padding: '6px 8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {movie.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Genre Filter Panel */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: 20,
        zIndex: 30,
        background: 'rgba(0,0,0,0.85)',
        padding: '10px',
        borderRadius: '8px',
        maxHeight: '80vh',
        overflowY: 'auto',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        <button
          onClick={clearGenres}
          style={{
            padding: '6px',
            fontWeight: 'bold',
            backgroundColor: selectedGenres.size === 0 ? '#6272a4' : 'transparent',
            color: 'white',
            border: '1px solid #fff',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Show All
        </button>
        {allGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            style={{
              padding: '6px',
              backgroundColor: selectedGenres.has(genre) ? '#6272a4' : 'transparent',
              color: 'white',
              border: '1px solid #fff',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          backgroundColor: 'transparent',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          cursor: isDragging ? 'grabbing' : 'default',
          opacity: opacity,
          transition: 'opacity 0.5s ease-in-out',
        }}
      />

      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 3,
        display: 'flex',
        gap: '10px',
        opacity: opacity,
        transition: 'opacity 0.5s ease-in-out',
      }}>
        <button onClick={() => setZoomLevel(prev => Math.min(5, prev * 1.2))}>+</button>
        <button onClick={() => setZoomLevel(prev => Math.max(0.1, prev / 1.2))}>-</button>
        <button onClick={() => {
          setZoomLevel(1);
          setPanOffset({ x: 0, y: 0 });
        }}>Reset</button>
      </div>
    </>
  );
}
