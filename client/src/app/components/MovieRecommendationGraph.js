"use client";
import { useState, useEffect, useRef } from 'react';
import useMoviesData from './MovieData';
import useSimilarMovies from './SimilarMovies';
import { drawConnections } from './ConnectionRenderer';
import { drawMovieNode } from './MovieNodeRenderer';
import { drawSelectedMovieInfo } from './MovieInfoRenderer';

export default function MovieRecommendationGraph() {
  const canvasRef = useRef(null);
  const movies = useMoviesData();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const similarMovies = useSimilarMovies(selectedMovie, movies);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Zoom and pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Canvas drawing
  useEffect(() => {
    if (!canvasRef.current || movies.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom and pan transformations
    ctx.save();
    ctx.scale(dpr * zoomLevel, dpr * zoomLevel);
    ctx.translate(panOffset.x / zoomLevel, panOffset.y / zoomLevel);
    
    // Draw connections first (so they appear behind nodes)
    drawConnections(ctx, movies, selectedMovie, similarMovies);
    
    // Draw movie nodes
    movies.forEach(movie => {
      // Convert mouse position to account for zoom and pan
      const adjustedMouseX = (mousePosition.x - panOffset.x) / zoomLevel;
      const adjustedMouseY = (mousePosition.y - panOffset.y) / zoomLevel;
      
      const distance = Math.sqrt(
        Math.pow(movie.x - adjustedMouseX, 2) +
        Math.pow(movie.y - adjustedMouseY, 2)
      );
      const isHovered = distance <= movie.radius;

      const isHighlighted = selectedMovie && (
        movie.id === selectedMovie.id || 
        similarMovies.some(m => m.id === movie.id)
      );

      drawMovieNode(ctx, movie, isHighlighted, isHovered, selectedMovie);
    });
    
    // Draw info for selected movie
    if (selectedMovie) {
      drawSelectedMovieInfo(ctx, selectedMovie, similarMovies);
    }
    
    ctx.restore();
  }, [movies, selectedMovie, similarMovies, mousePosition, zoomLevel, panOffset]);

  // Convert screen coordinates to graph coordinates
  const screenToGraphCoordinates = (screenX, screenY) => {
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (screenX / dpr - panOffset.x) / zoomLevel,
      y: (screenY / dpr - panOffset.y) / zoomLevel
    };
  };

  // Handle mouse move event
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setMousePosition({ x, y });
    
    // Handle dragging for panning
    if (isDragging) {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setDragStart({ x, y });
    }
  };

  // Handle mouse click event to select a movie or reset selection when clicking background
  const handleClick = (e) => {
    if (isDragging) return; // Don't select when dragging ends
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Convert to graph coordinates
    const graphCoords = screenToGraphCoordinates(x, y);

    const clickedMovie = movies.find((movie) => {
      const distance = Math.sqrt(
        Math.pow(movie.x - graphCoords.x, 2) + 
        Math.pow(movie.y - graphCoords.y, 2)
      );
      return distance <= movie.radius;
    });

    if (clickedMovie) {
      setSelectedMovie(clickedMovie);
    } else {
      // Reset selection when clicking on the background
      setSelectedMovie(null);
    }
  };
  
  // Handle wheel event for zooming
  const handleWheel = (e) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Determine zoom direction and factor
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoomLevel = Math.max(0.1, Math.min(5, zoomLevel * zoomFactor));
    
    // Adjust pan offset to zoom toward/from mouse position
    if (zoomLevel !== newZoomLevel) {
      const zoomRatio = newZoomLevel / zoomLevel;
      
      // Calculate new pan offset
      const newPanX = mouseX - (mouseX - panOffset.x) * zoomRatio;
      const newPanY = mouseY - (mouseY - panOffset.y) * zoomRatio;
      
      setPanOffset({ x: newPanX, y: newPanY });
      setZoomLevel(newZoomLevel);
    }
  };
  
  // Handle mouse down for drag start
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setIsDragging(true);
    setDragStart({ x, y });
    
    // Change cursor to indicate dragging
    canvas.style.cursor = 'grabbing';
  };
  
  // Handle mouse up for drag end
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      
      // Reset cursor
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'default';
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e) => handleMouseMove(e);
    const handleClickEvent = (e) => handleClick(e);
    const handleWheelEvent = (e) => handleWheel(e);
    const handleMouseDownEvent = (e) => handleMouseDown(e);
    const handleMouseUpEvent = (e) => handleMouseUp(e);
    
    // Update cursor on hover
    canvas.style.cursor = isDragging ? 'grabbing' : 'default';

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('click', handleClickEvent);
    canvas.addEventListener('wheel', handleWheelEvent);
    canvas.addEventListener('mousedown', handleMouseDownEvent);
    canvas.addEventListener('mouseup', handleMouseUpEvent);
    canvas.addEventListener('mouseleave', handleMouseUpEvent);

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('click', handleClickEvent);
      canvas.removeEventListener('wheel', handleWheelEvent);
      canvas.removeEventListener('mousedown', handleMouseDownEvent);
      canvas.removeEventListener('mouseup', handleMouseUpEvent);
      canvas.removeEventListener('mouseleave', handleMouseUpEvent);
    };
  }, [movies, isDragging, zoomLevel, panOffset]);

  // Add entrance animation with opacity
  const [opacity, setOpacity] = useState(0);
  
  useEffect(() => {
    // Start fade-in animation after component mounts
    const timer = setTimeout(() => {
      setOpacity(1);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
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
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
      
      {/* Zoom controls */}
      <div style={{ 
        position: 'absolute', 
        bottom: 20, 
        right: 20, 
        zIndex: 3,
        display: 'flex',
        gap: '10px',
        opacity: opacity,
        transition: 'opacity 0.5s ease-in-out'
      }}>
        <button 
          onClick={() => setZoomLevel(prev => Math.min(5, prev * 1.2))}
          style={{
            padding: '5px 10px',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: '1px solid white',
            borderRadius: '4px'
          }}
        >
          +
        </button>
        <button 
          onClick={() => setZoomLevel(prev => Math.max(0.1, prev / 1.2))}
          style={{
            padding: '5px 10px',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: '1px solid white',
            borderRadius: '4px'
          }}
        >
          -
        </button>
        <button 
          onClick={() => {
            setZoomLevel(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          style={{
            padding: '5px 10px',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: '1px solid white',
            borderRadius: '4px'
          }}
        >
          Reset
        </button>
      </div>
    </>
  );
}