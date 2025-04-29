'use client';
import { useRef, useState, useEffect } from 'react';
import StarryBackground from './StarryBackground';
import WatchedMovieCheckbox from './WatchedMovieCheckbox';
import useWatchedMovies from './useWatchedMovies';
import { drawMovieNode } from './MovieNodeRenderer';
import Link from 'next/link';

const API_BASE = "http://127.0.0.1:8000";

export default function MyConstellationGraph({ userEmail }) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const { watched, addWatched, removeWatched } = useWatchedMovies(userEmail);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!userEmail) return;
    const load = async () => {
      const res = await fetch(`${API_BASE}/users/watched?email=${encodeURIComponent(userEmail)}`);
      const watchedData = await res.json();
      const watchedMovies = watchedData.watched_movies || [];
      const nodeMap = {};
      const edgeList = [];

      for (let movie of watchedMovies) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        nodeMap[movie.id] = {
          id: movie.id,
          title: movie.title,
          x, y,
          radius: 10,
          watched: true,
          genres: movie.genres || []
        };

        const recs = await fetch(`${API_BASE}/recommend/${movie.id}`).then(r => r.json());
        for (let rec of recs) {
          if (!nodeMap[rec.id]) {
            const rx = Math.random() * window.innerWidth;
            const ry = Math.random() * window.innerHeight;
            nodeMap[rec.id] = {
              id: rec.id,
              title: rec.title,
              x: rx,
              y: ry,
              radius: 10,
              watched: false,
              genres: rec.genres || []
            };
          }
          edgeList.push({ source: movie.id, target: rec.id });
        }
      }

      setNodes(Object.values(nodeMap));
      setEdges(edgeList);
    };

    load();
  }, [userEmail]);

  const handleAddWatched = async (movie) => {
    await addWatched(movie);
    const recs = await fetch(`${API_BASE}/recommend/${movie.id}`).then(r => r.json());
    const newNodes = [...nodes];
    const newEdges = [...edges];

    for (let rec of recs) {
      if (!newNodes.find(n => n.id === rec.id)) {
        newNodes.push({
          id: rec.id,
          title: rec.title,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: 10,
          watched: false,
          genres: rec.genres || []
        });
      }
      newEdges.push({ source: movie.id, target: rec.id });
    }

    setNodes(newNodes.map(n => n.id === movie.id ? { ...n, watched: true } : n));
    setEdges(newEdges);
  };

  const handleRemoveWatched = async (movie) => {
    await removeWatched(movie);
    const remainingEdges = edges.filter(e => e.source !== movie.id);
    const removedTargets = edges.filter(e => e.source === movie.id).map(e => e.target);
    const stillNeeded = new Set(remainingEdges.map(e => e.target));

    const updatedNodes = nodes.filter(n => {
      if (n.id === movie.id) return true;
      if (!removedTargets.includes(n.id)) return true;
      return stillNeeded.has(n.id);
    });

    setEdges(remainingEdges);
    setNodes(updatedNodes.map(n => n.id === movie.id ? { ...n, watched: false } : n));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr * zoomLevel, dpr * zoomLevel);
    ctx.translate(panOffset.x / zoomLevel, panOffset.y / zoomLevel);

    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    });

    nodes.forEach(node => {
      const color = node.watched ? '#50fa7b' : '#ff5555';
      drawMovieNode(ctx, node, false, false, null, color);
    });

    if (selectedMovie) {
      ctx.beginPath();
      ctx.arc(selectedMovie.x, selectedMovie.y, selectedMovie.radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#f8f8f2';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }, [nodes, edges, selectedMovie, zoomLevel, panOffset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const graphX = (x / (window.devicePixelRatio * zoomLevel)) - panOffset.x / zoomLevel;
      const graphY = (y / (window.devicePixelRatio * zoomLevel)) - panOffset.y / zoomLevel;

      const clicked = nodes.find(n => {
        const dx = n.x - graphX;
        const dy = n.y - graphY;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius;
      });

      setSelectedMovie(clicked || null);
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.max(0.1, Math.min(5, zoomLevel * zoomFactor));
      setZoomLevel(newZoom);
    };

    const handleMouseDown = (e) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [nodes, isDragging, zoomLevel, panOffset]);

  let infoPanel = null;
  if (selectedMovie && canvasRef.current) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const screenX = rect.left + (selectedMovie.x * zoomLevel) + panOffset.x;
    const screenY = rect.top + (selectedMovie.y * zoomLevel) + panOffset.y;
    infoPanel = { screenX, screenY };
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#1e1e2f' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none'
      }}>
        <StarryBackground />
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      />

      {/* Sticky Back Button */}
      <div style={{
        position: 'fixed',
        top: 20,
        left: 20,
        zIndex: 100,
      }}>
        <Link href="/graph">
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#6272a4',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            ← Back to Graph
          </button>
        </Link>
      </div>

      {selectedMovie && infoPanel && (
        <div style={{
          position: "absolute",
          left: infoPanel.screenX,
          top: infoPanel.screenY,
          zIndex: 10,
          background: "rgba(40,42,54,0.96)",
          padding: "12px",
          borderRadius: "8px",
          color: "#f8f8f2",
          minWidth: "250px",
          boxShadow: "0 0 8px #0008"
        }}>
          <h3>{selectedMovie.title}</h3>
          <p><strong>Genres:</strong> {selectedMovie.genres?.join(', ') || 'N/A'}</p>
          <WatchedMovieCheckbox
            movie={selectedMovie}
            isWatched={watched.some(m => m.id === selectedMovie.id)}
            addWatched={handleAddWatched}
            removeWatched={handleRemoveWatched}
          />
        </div>
      )}
    </div>
  );
}
