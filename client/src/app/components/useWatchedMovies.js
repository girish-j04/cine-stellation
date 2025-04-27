// useWatchedMovies.js
import { useState, useEffect } from "react";

const API_BASE = "http://127.0.0.1:8000"; // Or your deployed backend

const useWatchedMovies = (userEmail) => {
  const [watched, setWatched] = useState([]);

  useEffect(() => {
    if (!userEmail) return;
    fetch(`${API_BASE}/users/watched?email=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => setWatched(data.watched_movies ?? []));
  }, [userEmail]);

  const addWatched = async (movie) => {
    await fetch(`${API_BASE}/users/add-watched`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        movie_id: movie.id,
        movie_title: movie.title
      })
    });
    setWatched(w => [...w, { id: movie.id, title: movie.title }]);
  };

  const removeWatched = async (movie) => {
    await fetch(`${API_BASE}/users/remove-watched`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        movie_id: movie.id
      })
    });
    setWatched(w => w.filter(x => x.id !== movie.id));
  };

  return { watched, addWatched, removeWatched };
};

export default useWatchedMovies;
