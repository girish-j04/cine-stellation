// #page.js

"use client";
import { useState } from 'react';
import Head from 'next/head';
import MovieRecommendationGraph from './components/MovieRecommendationGraph';
import HomePage from './components/HomePage';
import StarryBackground from './components/StarryBackground';
import './styles/movie-recommendation.css';

export default function App() {
  // State to track if we're on the home page or the graph page
  const [showHome, setShowHome] = useState(true);
  
  // Function to handle transition from homepage to graph
  const handleEnterApp = () => {
    setShowHome(false);
  };
  
  return (
    <>
      <Head>
        <title>{showHome ? "Cine-Stellation - Home" : "Cine-Stellation - Recommendations"}</title>
        <meta name="description" content="Interactive Movie Recommendation Graph" />
      </Head>
      
      {/* The StarryBackground is shown in both views */}
      <StarryBackground />
      
      {showHome ? (
        // Home Page Component
        <HomePage onEnterApp={handleEnterApp} />
      ) : (
        // Movie Graph Component
        <MovieRecommendationGraph />
      )}
    </>
  );
}