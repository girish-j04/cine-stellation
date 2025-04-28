import { useEffect, useState } from 'react';

const API_BASE = "http://127.0.0.1:8000";

function randomPos(maxW, maxH) {
  return {
    x: Math.random() * (maxW - 200) + 100,
    y: Math.random() * (maxH - 200) + 100,
  };
}

export default function useMyConstellationData(email) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_BASE}/users/watched?email=${encodeURIComponent(email)}`);
      const watched = await res.json();

      const watchedMovies = watched.watched_movies || [];
      const watchedIds = new Set(watchedMovies.map(m => m.id));
      const nodeMap = {};
      const edgeList = [];

      // Add watched nodes
      watchedMovies.forEach((m) => {
        const { x, y } = randomPos(window.innerWidth, window.innerHeight);
        nodeMap[m.id] = {
          ...m,
          x,
          y,
          radius: 10,
          watched: true,
        };
      });

      // Fetch 5 suggestions for each watched movie
      for (let m of watchedMovies) {
        try {
          const recRes = await fetch(`${API_BASE}/recommend/${m.id}`);
          const recs = await recRes.json();
          recs.forEach(rec => {
            if (!watchedIds.has(rec.id) && !nodeMap[rec.id]) {
              const { x, y } = randomPos(window.innerWidth, window.innerHeight);
              nodeMap[rec.id] = {
                id: rec.id,
                title: rec.title,
                x,
                y,
                radius: 10,
                watched: false,
              };
            }
            edgeList.push({ source: m.id, target: rec.id });
          });
        } catch (e) {
          console.error(`Failed to get recs for ${m.title}`, e);
        }
      }

      setNodes(Object.values(nodeMap));
      setEdges(edgeList);
    };

    load();
  }, [email]);

  return { nodes, edges };
}
