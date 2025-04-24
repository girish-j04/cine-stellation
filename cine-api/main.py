from fastapi import FastAPI, HTTPException
from cine_stellation_recommender import CineStellationRecommender
from database import insert_movies, insert_ratings
import os

app = FastAPI()
recommender = None

@app.on_event("startup")
async def startup_event():
    global recommender
    print("Starting recommender initialization...")
    ratings_path = "models/ratings.csv"
    movies_path = "models/movies.csv"

    # Check if files exist
    if not (os.path.exists(ratings_path) and os.path.exists(movies_path)):
        print("MovieLens CSV files not found in models/. Please add them.")
        return

    # Initialize and load into MongoDB
    recommender = CineStellationRecommender(ratings_path, movies_path)
    recommender.preprocess_data()
    await insert_movies(recommender.movies_df)
    await insert_ratings(recommender.ratings_df)
    print("Initialization complete.")

@app.post("/compute-similarity")
def compute_similarity():
    if not recommender:
        raise HTTPException(status_code=400, detail="Recommender not initialized")
    recommender.compute_similarity()
    return {"message": "Similarity matrix computed"}

@app.post("/create-constellations")
def create_constellations(min_ratings: int = 20, similarity_threshold: float = 0.2, max_connections: int = 5):
    if not recommender:
        raise HTTPException(status_code=400, detail="Recommender not initialized")
    recommender.create_genre_constellations(min_ratings, similarity_threshold, max_connections)
    return {"message": "Constellations created"}

@app.get("/recommend/{movie_id}")
def recommend(movie_id: int, top_n: int = 5):
    if not recommender:
        raise HTTPException(status_code=400, detail="Recommender not initialized")
    return recommender.recommend_similar_movies(movie_id, top_n)

@app.get("/export")
def export():
    if not recommender:
        raise HTTPException(status_code=400, detail="Recommender not initialized")
    recommender.export_constellation_data("constellation_data.json")
    return {"message": "Constellation data exported"}
