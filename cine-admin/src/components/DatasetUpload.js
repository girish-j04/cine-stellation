import React, { useState } from "react";
import { uploadDataset } from "../api";
import { Box, Button, Typography, Stack } from "@mui/material";

const DatasetUpload = () => {
  const [moviesFile, setMoviesFile] = useState(null);
  const [ratingsFile, setRatingsFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("movies_file", moviesFile);
    formData.append("ratings_file", ratingsFile);

    try {
      await uploadDataset(formData);
      alert("Dataset uploaded and processed!");
    } catch (err) {
      alert("Upload failed.");
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>📤 Upload Dataset</Typography>
      <Stack spacing={2}>
        <input type="file" onChange={(e) => setMoviesFile(e.target.files[0])} accept=".csv" />
        <input type="file" onChange={(e) => setRatingsFile(e.target.files[0])} accept=".csv" />
        <Button variant="contained" onClick={handleUpload} disabled={!moviesFile || !ratingsFile}>
          Upload & Initialize
        </Button>
      </Stack>
    </Box>
  );
};

export default DatasetUpload;
