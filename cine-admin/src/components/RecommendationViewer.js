import React, { useState } from "react";
import { TextField, Button, Box, Typography, List, ListItem } from "@mui/material";
import { getRecommendation } from "../api";

const RecommendationViewer = () => {
  const [movieId, setMovieId] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const fetchRecommendations = async () => {
    try {
      const res = await getRecommendation(movieId);
      setRecommendations(res.data);
    } catch {
      alert("Failed to fetch recommendations.");
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>🎯 Get Recommendations</Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Movie ID"
          value={movieId}
          onChange={(e) => setMovieId(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={fetchRecommendations}>
          Get
        </Button>
      </Box>
      <List>
        {recommendations.map((rec, idx) => (
          <ListItem key={idx}>
            {rec.title} ({rec.rating.toFixed(1)}) — Similarity: {rec.similarity.toFixed(2)}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default RecommendationViewer;
