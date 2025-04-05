export const drawSelectedMovieInfo = (ctx, movie, similarMovies) => {
  ctx.beginPath();
  ctx.arc(movie.x, movie.y, movie.radius + 5, 0, Math.PI * 2);
  ctx.strokeStyle = '#f8f8f2';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  const infoX = movie.x + movie.radius + 20;
  const infoY = movie.y - 40;
  const width = 260; // increased from 220
  const height = 160; // increased from 140
  
  ctx.fillStyle = 'rgba(40, 42, 54, 0.9)';
  ctx.strokeStyle = movie.color;
  ctx.lineWidth = 2;
  ctx.fillRect(infoX, infoY, width, height);
  ctx.strokeRect(infoX, infoY, width, height);
  
  ctx.fillStyle = '#f8f8f2';
  ctx.textAlign = 'left';
  ctx.font = 'bold 14px Arial';
  ctx.fillText(movie.title, infoX + 10, infoY + 20);
  
  ctx.font = '12px Arial';
  ctx.fillText(`Genres: ${movie.genres.join(', ')}`, infoX + 10, infoY + 40);
  
  ctx.font = 'bold 12px Arial';
  ctx.fillText('Most Similar Movies:', infoX + 10, infoY + 60);
  
  ctx.font = '12px Arial';
  similarMovies.forEach((similar, index) => {
    if (!similar) return;
    const score = movie.similarityScores?.[similar.id] || 0;
    ctx.fillText(
      `${similar.title} (${(score * 100).toFixed(0)}%)`, 
      infoX + 10, 
      infoY + 80 + (index * 15)
    );
  });
};
