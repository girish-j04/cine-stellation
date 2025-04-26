import React from "react";
import { Container, Typography, Box } from "@mui/material";
import Header from "./components/Header";
import DatasetUpload from "./components/DatasetUpload";
import ActionsPanel from "./components/ActionsPanel";
import RecommendationViewer from "./components/RecommendationViewer";

function App() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Header />
      <Box sx={{ my: 4 }}>
        <DatasetUpload />
        <ActionsPanel />
        <RecommendationViewer />
      </Box>
    </Container>
  );
}

export default App;
