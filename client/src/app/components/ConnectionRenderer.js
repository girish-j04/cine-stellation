export const drawConnections = (ctx, movies, selectedMovie, similarMovies) => {
  ctx.strokeStyle = 'rgba(98, 114, 164, 0.3)';
  ctx.lineWidth = 1;
  
  movies.forEach(movie => {
    if (movie.similarTo && movie.similarTo.length > 0) {
      movie.similarTo.forEach(similarId => {
        const similarMovie = movies.find(m => m.id === similarId);
        if (similarMovie) {
          ctx.beginPath();
          ctx.moveTo(movie.x, movie.y);
          ctx.lineTo(similarMovie.x, similarMovie.y);
          ctx.stroke();
        }
      });
    }
  });
  
  if (selectedMovie && similarMovies.length > 0) {
    ctx.lineWidth = 2;
    
    similarMovies.forEach(movie => {
      if (!movie) return;
      
      const score = selectedMovie.similarityScores?.[movie.id] || 0;
      const opacity = 0.4 + (score * 0.6); 
      
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -(performance.now() / 40) % 10;
      ctx.strokeStyle = `rgba(248, 248, 242, ${opacity})`;
      ctx.moveTo(selectedMovie.x, selectedMovie.y);
      ctx.lineTo(movie.x, movie.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      const midX = (selectedMovie.x + movie.x) / 2;
      const midY = (selectedMovie.y + movie.y) / 2;
      ctx.font = '10px Arial';
      ctx.fillStyle = '#f8f8f2';
      ctx.textAlign = 'center';
      ctx.fillText((score * 100).toFixed(0) + '%', midX, midY - 5);
    });
  }
};