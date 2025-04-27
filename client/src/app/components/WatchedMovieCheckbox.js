// WatchedMovieCheckbox.js
import React, { useLayoutEffect, useState } from "react";

const WatchedMovieCheckbox = ({
  movie, isWatched, addWatched, removeWatched, canvasRef
}) => {
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!canvasRef.current || !movie) return;
    const rect = canvasRef.current.getBoundingClientRect();
    // Position the checkbox next to the info box for the movie
    setPos({
      left: rect.left + movie.x + movie.radius + 50,
      top: rect.top + movie.y - 20
    });
  }, [movie, canvasRef]);

  if (!movie) return null;
  return (
    <div style={{
      position: 'absolute',
      left: pos.left,
      top: pos.top,
      zIndex: 20,
      background: 'rgba(40, 42, 54, 0.98)',
      borderRadius: 6,
      padding: '5px 14px',
      color: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.14)'
    }}>
      <label style={{ cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={isWatched}
          onChange={() => {
            if (isWatched) removeWatched(movie);
            else addWatched(movie);
          }}
          style={{ marginRight: 8 }}
        />
        Mark as watched
      </label>
    </div>
  );
};

export default WatchedMovieCheckbox;
