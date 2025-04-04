"use client"

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false
});

export default function MovieRecommendationGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recommendationPaths, setRecommendationPaths] = useState([]);
  const fgRef = useRef();

  // Set isClient to true once mounted
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sample movie data
  useEffect(() => {
    // Create nodes for each movie
    const nodes = [
      { id: "1", name: "Interstellar", group: "Sci-Fi", size: 15, color: "#8be9fd", year: 2014, director: "Christopher Nolan", rating: 8.6 },
      { id: "2", name: "The Martian", group: "Sci-Fi", size: 12, color: "#ff79c6", year: 2015, director: "Ridley Scott", rating: 8.0 },
      { id: "3", name: "Gravity", group: "Sci-Fi", size: 10, color: "#bd93f9", year: 2013, director: "Alfonso Cuarón", rating: 7.7 },
      { id: "4", name: "Ad Astra", group: "Sci-Fi", size: 8, color: "#ffb86c", year: 2019, director: "James Gray", rating: 6.5 },
      { id: "5", name: "2001: A Space Odyssey", group: "Sci-Fi", size: 14, color: "#50fa7b", year: 1968, director: "Stanley Kubrick", rating: 8.3 },
      { id: "6", name: "Solaris", group: "Sci-Fi", size: 9, color: "#ff5555", year: 1972, director: "Andrei Tarkovsky", rating: 8.1 },
      { id: "7", name: "Arrival", group: "Sci-Fi", size: 11, color: "#f1fa8c", year: 2016, director: "Denis Villeneuve", rating: 7.9 },
      { id: "8", name: "Contact", group: "Sci-Fi", size: 10, color: "#8be9fd", year: 1997, director: "Robert Zemeckis", rating: 7.5 },
      { id: "9", name: "Moon", group: "Sci-Fi", size: 8, color: "#ff79c6", year: 2009, director: "Duncan Jones", rating: 7.9 },
      { id: "10", name: "Blade Runner", group: "Sci-Fi", size: 13, color: "#bd93f9", year: 1982, director: "Ridley Scott", rating: 8.1 },
      { id: "11", name: "Blade Runner 2049", group: "Sci-Fi", size: 12, color: "#50fa7b", year: 2017, director: "Denis Villeneuve", rating: 8.0 },
      { id: "12", name: "Inception", group: "Sci-Fi", size: 14, color: "#ff5555", year: 2010, director: "Christopher Nolan", rating: 8.8 },
      { id: "13", name: "Alien", group: "Sci-Fi", size: 13, color: "#f1fa8c", year: 1979, director: "Ridley Scott", rating: 8.4 },
      { id: "14", name: "Dune", group: "Sci-Fi", size: 14, color: "#8be9fd", year: 2021, director: "Denis Villeneuve", rating: 8.0 },
      { id: "15", name: "The Fifth Element", group: "Sci-Fi", size: 11, color: "#ff79c6", year: 1997, director: "Luc Besson", rating: 7.7 },
      { id: "16", name: "Star Wars: A New Hope", group: "Sci-Fi", size: 15, color: "#bd93f9", year: 1977, director: "George Lucas", rating: 8.6 },
      { id: "17", name: "The Matrix", group: "Sci-Fi", size: 15, color: "#50fa7b", year: 1999, director: "The Wachowskis", rating: 8.7 },
      { id: "18", name: "Her", group: "Sci-Fi", size: 10, color: "#ff5555", year: 2013, director: "Spike Jonze", rating: 8.0 },
      { id: "19", name: "Ex Machina", group: "Sci-Fi", size: 12, color: "#f1fa8c", year: 2014, director: "Alex Garland", rating: 7.7 },
      { id: "20", name: "Annihilation", group: "Sci-Fi", size: 11, color: "#8be9fd", year: 2018, director: "Alex Garland", rating: 6.8 },
    ];

    // Create links based on similarity - using string IDs
    // We'll use these to calculate recommendations
    const links = [
      { source: "1", target: "2", value: 5, similarity: 0.7 }, // Interstellar - The Martian
      { source: "1", target: "5", value: 7, similarity: 0.8 }, // Interstellar - 2001
      { source: "1", target: "7", value: 4, similarity: 0.6 }, // Interstellar - Arrival
      { source: "1", target: "12", value: 8, similarity: 0.9 }, // Interstellar - Inception
      { source: "2", target: "3", value: 6, similarity: 0.8 }, // The Martian - Gravity
      { source: "2", target: "13", value: 5, similarity: 0.7 }, // The Martian - Alien
      { source: "3", target: "4", value: 5, similarity: 0.7 }, // Gravity - Ad Astra
      { source: "4", target: "5", value: 3, similarity: 0.5 }, // Ad Astra - 2001
      { source: "5", target: "6", value: 8, similarity: 0.9 }, // 2001 - Solaris
      { source: "5", target: "10", value: 4, similarity: 0.6 }, // 2001 - Blade Runner
      { source: "6", target: "7", value: 3, similarity: 0.5 }, // Solaris - Arrival
      { source: "7", target: "8", value: 7, similarity: 0.8 }, // Arrival - Contact
      { source: "7", target: "11", value: 5, similarity: 0.7 }, // Arrival - Blade Runner 2049
      { source: "7", target: "18", value: 6, similarity: 0.8 }, // Arrival - Her
      { source: "8", target: "16", value: 4, similarity: 0.6 }, // Contact - Star Wars
      { source: "9", target: "4", value: 6, similarity: 0.8 }, // Moon - Ad Astra
      { source: "9", target: "5", value: 4, similarity: 0.6 }, // Moon - 2001
      { source: "10", target: "11", value: 9, similarity: 0.95 }, // Blade Runner - Blade Runner 2049
      { source: "10", target: "17", value: 7, similarity: 0.8 }, // Blade Runner - The Matrix
      { source: "11", target: "7", value: 5, similarity: 0.7 }, // Blade Runner 2049 - Arrival
      { source: "12", target: "1", value: 8, similarity: 0.9 }, // Inception - Interstellar
      { source: "12", target: "17", value: 7, similarity: 0.8 }, // Inception - The Matrix
      { source: "13", target: "10", value: 6, similarity: 0.7 }, // Alien - Blade Runner
      { source: "14", target: "16", value: 5, similarity: 0.7 }, // Dune - Star Wars
      { source: "14", target: "1", value: 4, similarity: 0.6 }, // Dune - Interstellar
      { source: "15", target: "16", value: 6, similarity: 0.7 }, // Fifth Element - Star Wars
      { source: "16", target: "17", value: 7, similarity: 0.8 }, // Star Wars - The Matrix
      { source: "17", target: "19", value: 5, similarity: 0.7 }, // The Matrix - Ex Machina
      { source: "18", target: "19", value: 8, similarity: 0.9 }, // Her - Ex Machina
      { source: "19", target: "20", value: 7, similarity: 0.8 }, // Ex Machina - Annihilation
    ];

    setGraphData({ nodes, links });
  }, []);

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // Zoom to fit when data loads with a larger distance
      fgRef.current.zoomToFit(400, 200); // Added more padding (200ms)
    }
  }, [graphData]);

  // Function to find top 5 recommendations for a selected movie
  const findRecommendations = (selectedMovieId) => {
    const { links, nodes } = graphData;
    
    // Find all links connected to the selected movie
    const connectedLinks = links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return sourceId === selectedMovieId || targetId === selectedMovieId;
    });
    
    // Sort by similarity and take top 5
    const recommendations = connectedLinks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        const recommendedId = sourceId === selectedMovieId ? targetId : sourceId;
        
        return {
          link,
          movie: nodes.find(node => node.id === recommendedId)
        };
      });
    
    return recommendations;
  };

  // Search function
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Find matching movies
    const results = graphData.nodes.filter(node => 
      node.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setSearchResults(results);
    
    // If there's an exact match or only one result, focus on it
    if (results.length === 1) {
      focusOnMovie(results[0]);
    }
  };

  // Focus on a specific movie - FIXED FUNCTION
  const focusOnMovie = (movie) => {
    if (fgRef.current) {
      // Instead of trying to access the graph data directly, 
      // use the movie object we already have from our state
      
      // First find the node in rendered graph
      // The ForceGraph component adds x, y coordinates to our nodes
      const nodes = fgRef.current._graphData?.nodes || [];
      const graphNode = nodes.find(n => n.id === movie.id);
      
      if (graphNode) {
        // Center and zoom on the node
        fgRef.current.centerAt(graphNode.x, graphNode.y, 1000);
        fgRef.current.zoom(2.5, 1000);
        
        // Select the node
        handleNodeClick(graphNode);
      } else {
        // If we can't find the rendered node with coordinates, 
        // select the movie from our state and let the graph handle positioning
        handleNodeClick(movie);
      }
    }
  };

  // Custom node paint function for star-like appearance
  const paintNode = (node, ctx) => {
    // Check if node has valid coordinates before painting
    if (typeof node.x === 'undefined' || typeof node.y === 'undefined' || 
        !isFinite(node.x) || !isFinite(node.y)) {
      return; // Skip rendering this node
    }

    // Calculate node size based on property
    const size = node.size || 5;
    const color = node.color || "#ffffff";
    
    // Check if this node is part of a recommendation path
    const isRecommended = recommendationPaths.some(rec => 
      rec.movie.id === node.id
    );
    
    // Draw halo/glow
    const glowSize = isRecommended ? size * 2.5 : size * 2;
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize);
    
    if (isRecommended) {
      // Gold glow for recommendations
      gradient.addColorStop(0, '#ffdf00');
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    } else {
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.arc(node.x, node.y, glowSize, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw star shape
    const spikes = 5;
    const outerRadius = isRecommended ? size * 1.2 : size;
    const innerRadius = outerRadius / 2;
    
    ctx.beginPath();
    let rot = Math.PI / 2 * 3;
    let x = node.x;
    let y = node.y;
    let step = Math.PI / spikes;
    
    for (let i = 0; i < spikes; i++) {
      x = node.x + Math.cos(rot) * outerRadius;
      y = node.y + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;
      
      x = node.x + Math.cos(rot) * innerRadius;
      y = node.y + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(node.x + Math.cos(Math.PI / 2 * 3) * outerRadius, node.y + Math.sin(Math.PI / 2 * 3) * outerRadius);
    ctx.closePath();
    
    if (isRecommended) {
      ctx.fillStyle = '#ffdf00'; // Gold for recommended movies
    } else {
      ctx.fillStyle = color;
    }
    ctx.fill();
    
    // If node is highlighted/selected, add a white border
    if (node === selectedNode) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Add label for movie name with larger offset and improved visibility
    if (node.name) {
      ctx.font = '10px Arial'; // Increased font size
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add text shadow/outline for better visibility
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 3;
      ctx.strokeText(node.name, node.x, node.y + size + 16); // Increased vertical offset
      
      ctx.fillStyle = 'white';
      ctx.fillText(node.name, node.x, node.y + size + 16); // Increased vertical offset
    }
  };

  // Custom link paint function to highlight recommendation paths
  const paintLink = (link, ctx, globalScale) => {
    // Extract source and target
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    // Check if this link is part of a recommendation path
    const isRecommendationLink = recommendationPaths.some(rec => {
      const recSourceId = typeof rec.link.source === 'object' ? rec.link.source.id : rec.link.source;
      const recTargetId = typeof rec.link.target === 'object' ? rec.link.target.id : rec.link.target;
      
      return (recSourceId === sourceId && recTargetId === targetId) || 
             (recSourceId === targetId && recTargetId === sourceId);
    });
    
    // Set different styles based on recommendation status
    if (isRecommendationLink) {
      // Animated, bright connection for recommendations
      const start = link.source;
      const end = link.target;
      
      if (!start || !end || typeof start.x === 'undefined' || typeof end.x === 'undefined') {
        return;
      }
      
      // Draw constellation line - dotted gold line
      ctx.beginPath();
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = '#ffdf00';
      ctx.lineWidth = 2;
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Calculate the current time for animation
      const time = Date.now() / 1000;
      // Calculate position of particle along the line
      const t = (Math.sin(time * 2) + 1) / 2; // Oscillate between 0 and 1
      
      // Draw moving particle
      const particleX = start.x + (end.x - start.x) * t;
      const particleY = start.y + (end.y - start.y) * t;
      
      ctx.beginPath();
      ctx.fillStyle = '#ffffff';
      ctx.arc(particleX, particleY, 2, 0, 2 * Math.PI);
      ctx.fill();
      
    } else if (selectedNode && (
      (typeof link.source === 'object' && link.source.id === selectedNode.id) || 
      (typeof link.target === 'object' && link.target.id === selectedNode.id) ||
      link.source === selectedNode.id || 
      link.target === selectedNode.id
    )) {
      // Brighter but not animated for regular connections to selected node
      ctx.strokeStyle = 'rgba(150, 160, 200, 0.8)';
      ctx.lineWidth = 1;
    } else {
      // Default style for other links
      ctx.strokeStyle = 'rgba(98, 114, 164, 0.4)';
      ctx.lineWidth = 0.5;
    }
    
    // Only return true for non-recommendation links
    // Let our custom drawing handle the recommendation links
    return !isRecommendationLink;
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    
    // Get recommendations for this movie
    const recommendations = findRecommendations(node.id);
    setRecommendationPaths(recommendations);
    
    // Center view on node with some animation
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(2, 1000);
    }
  };

  const handleBackgroundClick = () => {
    setSelectedNode(null);
    setRecommendationPaths([]);
  };

  return (
    <div className="container">
      <h1 className="title">Cinematic Constellations</h1>
      
      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a movie..."
            className="search-input"
          />
          <button type="submit" className="search-button">Find</button>
        </form>
        
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(movie => (
              <div 
                key={movie.id} 
                className="search-result-item"
                onClick={() => focusOnMovie(movie)}
              >
                {movie.name} ({movie.year})
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="graph-container">
        {/* Only render ForceGraph on client side */}
        {isClient && (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeRelSize={6}
            nodeCanvasObject={paintNode}
            linkCanvasObject={paintLink}
            nodeLabel={node => `${node.name} (${node.year})`}
            backgroundColor="#111122"
            onNodeClick={handleNodeClick}
            onBackgroundClick={handleBackgroundClick}
            cooldownTicks={100}
            linkDirectionalParticles={0} // Disable default particles, we'll draw our own
            linkWidth={0.5} // Thin default links
            d3AlphaDecay={0.02} // Slower alpha decay for more stable positioning
            d3VelocityDecay={0.3} // Increased velocity decay to reduce oscillation
            linkLength={120} // Increase default link length for more spacing
            dagMode={null} // No directed acyclic graph mode
            dagLevelDistance={120} // Level distance if using dagMode
            nodeResolution={12} // Higher node resolution for smoother rendering
            warmupTicks={200} // More warmup ticks for better initial layout
            centerAt={[0, 0, 500]} // Initial center position with zoom
          />
        )}
      </div>
      
      {/* Info panel for selected movie */}
      <div className="info-panel">
        {selectedNode ? (
          <div className="movie-details">
            <h2>{selectedNode.name}</h2>
            <div className="movie-meta">
              <p><strong>Year:</strong> {selectedNode.year}</p>
              <p><strong>Director:</strong> {selectedNode.director}</p>
              <p><strong>Genre:</strong> {selectedNode.group}</p>
              <p><strong>Rating:</strong> {selectedNode.rating}/10</p>
            </div>
            <div className="recommendations">
              <h3>Top Recommendations:</h3>
              <ul>
                {recommendationPaths.map(rec => (
                  <li key={rec.movie.id} className="recommendation-item">
                    <button 
                      onClick={() => handleNodeClick(rec.movie)}
                      className="movie-link"
                      style={{ borderColor: rec.movie.color }}
                    >
                      {rec.movie.name} ({rec.movie.year})
                    </button>
                    <span className="similarity">
                      {Math.round(rec.link.similarity * 100)}% match
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="instructions">
            <h2>Explore the Movie Universe</h2>
            <p>Search for a movie or click on a star to discover similar films.</p>
            <p>Each star represents a sci-fi film, connected to similar movies forming constellations in the cinematic universe.</p>
            <p>When you select a movie, golden paths will guide you to the 5 most recommended similar films.</p>
          </div>
        )}
      </div>
    </div>
  );
}