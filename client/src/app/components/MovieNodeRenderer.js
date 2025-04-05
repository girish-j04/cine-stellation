export const drawMovieNode = (ctx, movie, isHighlighted, isHovered, selectedMovie) => {
  const glowIntensity = isHighlighted || isHovered ? 3 : 1;
  const nodeColor = isHighlighted || isHovered ? movie.color : movie.color + '99';

  ctx.beginPath();
  const gradient = ctx.createRadialGradient(
    movie.x, movie.y, 0, 
    movie.x, movie.y, movie.radius * 2 * glowIntensity
  );
  gradient.addColorStop(0, movie.color + (isHighlighted || isHovered ? 'FF' : 'AA'));
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.arc(movie.x, movie.y, movie.radius * 2 * glowIntensity, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(movie.x, movie.y, movie.radius, 0, Math.PI * 2);
  ctx.fillStyle = nodeColor;
  ctx.fill();

  ctx.font = isHighlighted || isHovered ? 'bold 12px Arial' : '12px Arial';
  ctx.fillStyle = isHighlighted || isHovered ? '#f8f8f2' : 'rgba(248, 248, 242, 0.7)';
  ctx.textAlign = 'center';
  ctx.fillText(movie.title, movie.x, movie.y + movie.radius + 20);

  if ((isHighlighted || isHovered) && movie.id !== (selectedMovie?.id || 0)) {
    ctx.beginPath();
    ctx.arc(movie.x, movie.y, movie.radius + 5 + Math.sin(performance.now() / 200) * 2, 0, Math.PI * 2);
    ctx.strokeStyle = movie.color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};