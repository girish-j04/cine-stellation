import { useState, useEffect } from 'react';

export default function useMoviesData() {
  const [movies, setMovies] = useState([]);

  // Sample movie data with added similarity scores
  useEffect(() => {
    const sampleMovies = [
      { id: 1, title: "Interstellar", x: 200, y: 150, radius: 15, color: "#8be9fd", 
        similarTo: [2, 5, 7], genres: ["Sci-Fi", "Adventure"],
        similarityScores: { 2: 0.9, 5: 0.85, 7: 0.8, 8: 0.75, 4: 0.7, 3: 0.65, 6: 0.6 } },
      { id: 2, title: "The Martian", x: 350, y: 180, radius: 12, color: "#ff79c6", 
        similarTo: [1, 3], genres: ["Sci-Fi", "Drama"],
        similarityScores: { 1: 0.9, 3: 0.85, 7: 0.8, 5: 0.7, 4: 0.75, 8: 0.65, 6: 0.5 } },
      { id: 3, title: "Gravity", x: 480, y: 250, radius: 10, color: "#bd93f9", 
        similarTo: [2, 4], genres: ["Sci-Fi", "Thriller"],
        similarityScores: { 2: 0.85, 4: 0.9, 1: 0.65, 5: 0.6, 7: 0.55, 8: 0.5, 6: 0.45 } },
      { id: 4, title: "Ad Astra", x: 400, y: 350, radius: 8, color: "#ffb86c", 
        similarTo: [3, 5], genres: ["Sci-Fi", "Adventure"],
        similarityScores: { 3: 0.9, 5: 0.85, 1: 0.7, 2: 0.75, 6: 0.65, 7: 0.6, 8: 0.5 } },
      { id: 5, title: "2001: A Space Odyssey", x: 250, y: 300, radius: 14, color: "#50fa7b", 
        similarTo: [1, 4, 6], genres: ["Sci-Fi", "Mystery"],
        similarityScores: { 1: 0.85, 4: 0.85, 6: 0.8, 2: 0.7, 3: 0.6, 7: 0.65, 8: 0.55 } },
      { id: 6, title: "Solaris", x: 150, y: 250, radius: 9, color: "#ff5555", 
        similarTo: [5], genres: ["Sci-Fi", "Drama"],
        similarityScores: { 5: 0.8, 1: 0.6, 4: 0.65, 2: 0.5, 7: 0.55, 3: 0.45, 8: 0.4 } },
      { id: 7, title: "Arrival", x: 300, y: 100, radius: 11, color: "#f1fa8c", 
        similarTo: [1, 8], genres: ["Sci-Fi", "Drama"],
        similarityScores: { 1: 0.8, 8: 0.9, 2: 0.8, 5: 0.65, 6: 0.55, 3: 0.55, 4: 0.6 } },
      { id: 8, title: "Contact", x: 400, y: 80, radius: 10, color: "#8be9fd", 
        similarTo: [7], genres: ["Sci-Fi", "Drama"],
        similarityScores: { 7: 0.9, 1: 0.75, 2: 0.65, 5: 0.55, 3: 0.5, 4: 0.5, 6: 0.4 } },
    ];
    setMovies(sampleMovies);
  }, []);

  return movies;
}