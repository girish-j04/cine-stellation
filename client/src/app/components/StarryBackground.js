"use client"
import { useEffect, useRef, useState } from 'react';

const StarryBackground = ({ width = '100%', height = '100vh' }) => {
  const canvasRef = useRef(null);
  const stars = useRef([]);
  const [viewport, setViewport] = useState({
    scale: 1, // Zoom level
    offsetX: 0, // Panning X
    offsetY: 0, // Panning Y
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    stars.current = generateStars(canvas.width, canvas.height, 2000);

    let animationFrame;
    const animate = () => {
      drawStars(ctx, canvas, viewport, stars.current);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [viewport]); // Redraw when viewport changes

  const generateStars = (width, height, count) => {
    return Array.from({ length: count }, () => ({
      x: Math.random() * width * 3 - width, // Spread stars across 3x width
      y: Math.random() * height * 3 - height, // Spread stars across 3x height
      radius: Math.random() * 1.5 + 0.2,
      baseOpacity: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 1000 + 2000,
    }));
  };

  const drawStars = (ctx, canvas, viewport, stars) => {
    const { scale, offsetX, offsetY } = viewport;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000014';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2 + offsetX, -canvas.height / 2 + offsetY);

    stars.forEach(star => {
      const twinkle = Math.sin(Date.now() / star.twinkleSpeed) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.baseOpacity * twinkle})`;
      ctx.fill();
    });

    ctx.restore();
  };

  const handleWheel = (event) => {
    setViewport(prev => {
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      return {
        ...prev,
        scale: Math.min(5, Math.max(0.5, prev.scale * zoomFactor)),
      };
    });
  };

  const handleMouseDrag = (event) => {
    if (event.buttons !== 1) return; // Only move on left click
    setViewport(prev => ({
      ...prev,
      offsetX: prev.offsetX - event.movementX / prev.scale,
      offsetY: prev.offsetY - event.movementY / prev.scale,
    }));
  };

  return (
    <canvas 
      ref={canvasRef}
      onWheel={handleWheel}
      onMouseMove={handleMouseDrag}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width,
        height,
        zIndex: -1,
        cursor: "grab",
      }}
    />
  );
};

export default StarryBackground;
