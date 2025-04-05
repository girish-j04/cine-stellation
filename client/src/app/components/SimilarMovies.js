import { useState, useEffect } from 'react';

export default function useSimilarMovies(selectedMovie, movies) {
  const [similarMovies, setSimilarMovies] = useState([]);

  // Update similar movies when a movie is selected
  useEffect(() => {
    if (selectedMovie) {
      const movieScores = selectedMovie.similarityScores || {};
      const sortedSimilar = Object.entries(movieScores)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, 5)
        .map(([id]) => movies.find(m => m.id === parseInt(id)));
      
      setSimilarMovies(sortedSimilar.filter(Boolean));
    } else {
      setSimilarMovies([]);
    }
  }, [selectedMovie, movies]);

  return similarMovies;
}