
import { useState, useEffect } from 'react';

// Optional: genre color mapping
const genreColors = {
  Comedy: '#f1fa8c',
  'Sci-Fi': '#8be9fd',
  Adventure: '#50fa7b',
  Animation: '#bd93f9',
  Children: '#ff79c6',
  Fantasy: '#ffb86c',
  Romance: '#ff5555',
  Drama: '#6272a4',
  Thriller: '#ff79c6',
  Mystery: '#ffb86c',
};

function getColor(genres) {
  // Pick first genre that has a color, fallback to gray
  for (const g of genres) {
    if (genreColors[g]) return genreColors[g];
  }
  return '#cccccc';
}

// Force-directed positioning algorithm
function applyForceLayout(movies, iterations = 50) {
  // Clone movies to avoid mutating the original array during iterations
  const nodes = JSON.parse(JSON.stringify(movies));
  const k = 30; // Optimal distance between nodes
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  
  // Start with a larger spread across the canvas
  nodes.forEach((node, i) => {
    // Distribute in a grid-like pattern initially
    const gridSize = Math.ceil(Math.sqrt(nodes.length));
    const col = i % gridSize;
    const row = Math.floor(i / gridSize);
    
    // Spread across 80% of the canvas
    const spreadX = canvasWidth * 0.8;
    const spreadY = canvasHeight * 0.8;
    
    node.x = (canvasWidth * 0.1) + (col / gridSize) * spreadX;
    node.y = (canvasHeight * 0.1) + (row / gridSize) * spreadY;
    
    // Initialize velocity components
    node.vx = 0;
    node.vy = 0;
  });

  // Run simulation for a fixed number of iterations
  for (let iter = 0; iter < iterations; iter++) {
    // Calculate repulsive forces between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        // Calculate distance between nodes
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1; // Avoid division by zero
        
        // Calculate repulsive force (inversely proportional to distance)
        let force = k * k / distance;
        
        // If nodes are similar, reduce repulsive force (keep them closer)
        if (node1.similarTo && node1.similarTo.includes(node2.id)) {
          const similarity = node1.similarityScores[node2.id] || 0.5;
          force *= (1 - similarity * 0.7); // Reduce force based on similarity
        }
        
        // Apply force along the distance vector
        if (distance > 0) {
          const forceX = (dx / distance) * force;
          const forceY = (dy / distance) * force;
          
          node1.vx -= forceX;
          node1.vy -= forceY;
          node2.vx += forceX;
          node2.vy += forceY;
        }
      }
    }
    
    // Apply attractive forces for connected nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.similarTo && node.similarTo.length > 0) {
        for (const targetId of node.similarTo) {
          const targetNode = nodes.find(n => n.id === targetId);
          if (targetNode) {
            const dx = targetNode.x - node.x;
            const dy = targetNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Attractive force proportional to distance
            const similarity = node.similarityScores[targetId] || 0.5;
            const force = distance * similarity * 0.05;
            
            if (distance > 0) {
              const forceX = (dx / distance) * force;
              const forceY = (dy / distance) * force;
              
              node.vx += forceX;
              node.vy += forceY;
            }
          }
        }
      }
    }
    
    // Update positions and apply velocity damping
    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;
      
      // Add boundary forces to keep nodes within canvas
      const padding = 50;
      if (node.x < padding) node.vx += 1;
      if (node.x > canvasWidth - padding) node.vx -= 1;
      if (node.y < padding) node.vy += 1;
      if (node.y > canvasHeight - padding) node.vy -= 1;
      
      // Dampen velocity for next iteration
      node.vx *= 0.9;
      node.vy *= 0.9;
    }
  }
  
  // Final step: make sure nodes don't overlap
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      
      const dx = node2.x - node1.x;
      const dy = node2.y - node1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Minimum allowed distance between node centers (sum of radii plus margin)
      const minDistance = node1.radius + node2.radius + 5;
      
      if (distance < minDistance) {
        // Move nodes apart along their connecting line
        const overlap = minDistance - distance;
        const moveX = (dx / distance) * overlap * 0.5;
        const moveY = (dy / distance) * overlap * 0.5;
        
        node1.x -= moveX;
        node1.y -= moveY;
        node2.x += moveX;
        node2.y += moveY;
      }
    }
  }
  
  return nodes;
}

export default function useMoviesData() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/constellation_data.json');
        const raw = await res.json();

        // Map of movieId => movieData
        const movieMap = {};
        raw.movies.forEach(movie => {
          movieMap[movie.id] = movie;
        });

        // Prepare similarity lookup: movieId => { similarTo: [...], similarityScores: {...} }
        const similarityMap = {};
        raw.connections.forEach(conn => {
          if (!similarityMap[conn.source]) {
            similarityMap[conn.source] = { similarTo: [], similarityScores: {} };
          }
          similarityMap[conn.source].similarTo.push(conn.target);
          similarityMap[conn.source].similarityScores[conn.target] = conn.similarity;

          // Bidirectional (optional depending on your logic)
          if (!similarityMap[conn.target]) {
            similarityMap[conn.target] = { similarTo: [], similarityScores: {} };
          }
          similarityMap[conn.target].similarTo.push(conn.source);
          similarityMap[conn.target].similarityScores[conn.source] = conn.similarity;
        });

        // First pass: create movie objects with basic properties
        const processedMovies = raw.movies.map(movie => {
          const { similarTo = [], similarityScores = {} } = similarityMap[movie.id] || {};
          return {
            id: movie.id,
            title: movie.title,
            year: movie.year || "", // Add year if available
            x: 0, // Will be positioned by force layout
            y: 0,
            radius: 8 + Math.min(5, (similarTo.length / 3)), // Radius based on connections
            color: getColor(movie.genres),
            genres: movie.genres,
            similarTo,
            similarityScores,
            // Add visibility property for fade effects
            visibility: 1
          };
        });
        
        // Apply force-directed layout
        const positionedMovies = applyForceLayout(processedMovies);
        
        setMovies(positionedMovies);
      } catch (err) {
        console.error('Failed to load constellation data:', err);
      }
    }

    fetchData();
  }, []);

  return movies;
}
