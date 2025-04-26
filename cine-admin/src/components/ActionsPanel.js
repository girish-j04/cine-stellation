import React from "react";
import { Button, Stack, Typography } from "@mui/material";
import { initialize, computeSimilarity } from "../api";

const ActionsPanel = () => {
  return (
    <div style={{ marginTop: 40 }}>
      <Typography variant="h6" gutterBottom>⚙️ Admin Actions</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={() => initialize().then(() => alert("Initialized!")).catch(() => alert("Failed"))}>
          Initialize from DB
        </Button>
        <Button variant="outlined" onClick={() => computeSimilarity().then(() => alert("Computed!")).catch(() => alert("Failed"))}>
          Compute Similarity
        </Button>
      </Stack>
    </div>
  );
};

export default ActionsPanel;
