export const drawMovieNode = (ctx, movie, isHighlighted, isHovered, selectedMovie, overrideColor) => {
  const glowIntensity = isHighlighted || isHovered ? 3 : 1;
  const r = movie.radius ?? 10;

  const baseColor = overrideColor || movie.color || '#ffffff';
  const nodeColor = (isHighlighted || isHovered) ? baseColor : baseColor + '99';

  ctx.beginPath();
  const gradient = ctx.createRadialGradient(
    movie.x, movie.y, 0,
    movie.x, movie.y, r * 2 * glowIntensity
  );
  gradient.addColorStop(0, baseColor + (isHighlighted || isHovered ? 'FF' : 'AA'));
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.arc(movie.x, movie.y, r * 2 * glowIntensity, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(movie.x, movie.y, r, 0, Math.PI * 2);
  ctx.fillStyle = nodeColor;
  ctx.fill();

  ctx.font = isHighlighted || isHovered ? 'bold 12px Arial' : '12px Arial';
  ctx.fillStyle = isHighlighted || isHovered ? '#f8f8f2' : 'rgba(248, 248, 242, 0.7)';
  ctx.textAlign = 'center';
  ctx.fillText(movie.title, movie.x, movie.y + r + 20);

  if ((isHighlighted || isHovered) && movie.id !== (selectedMovie?.id || 0)) {
    ctx.beginPath();
    ctx.arc(movie.x, movie.y, r + 5 + Math.sin(performance.now() / 200) * 2, 0, Math.PI * 2);
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};
