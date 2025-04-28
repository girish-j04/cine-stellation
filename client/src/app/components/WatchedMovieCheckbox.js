// WatchedMovieCheckbox.js
import React from "react";

const WatchedMovieCheckbox = ({
  movie, isWatched, addWatched, removeWatched
}) => {
  if (!movie) return null;
  return (
    <div style={{
      background: 'rgba(40, 42, 54, 0.98)',
      borderRadius: 6,
      padding: '5px 14px',
      color: '#fff',
      marginTop: '10px',
      display: "inline-block"
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
