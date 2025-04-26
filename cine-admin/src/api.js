import axios from 'axios';

const BASE_URL = "http://localhost:8000";

export const initialize = () => axios.post(`${BASE_URL}/initialize`);
export const computeSimilarity = () => axios.post(`${BASE_URL}/compute-similarity`);
export const uploadDataset = (formData) =>
  axios.post(`${BASE_URL}/upload-dataset`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getRecommendation = (movieId, topN = 5) =>
  axios.get(`${BASE_URL}/recommend/${movieId}?top_n=${topN}`);
