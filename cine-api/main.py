from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from cine_stellation_recommender import CineStellationRecommender
from database import insert_movies, insert_ratings, insert_similarity_matrix, load_movies, load_ratings, load_similarity_matrix
import shutil
import os
import pandas as pd
from fastapi import Body
from fastapi.middleware.cors import CORSMiddleware
from database import create_user, verify_user, save_constellation_data, load_constellation_data
from fastapi.responses import JSONResponse

from pydantic import BaseModel
from database import add_watched_movie, get_watched_movies

from database import remove_watched_movie

class RemoveWatchedRequest(BaseModel):
    email: str
    movie_id: int

class WatchedMovieRequest(BaseModel):
    email: str  # or user_id, depending on your authentication
    movie_id: int
    movie_title: str

app = FastAPI()
recommender = None

# Allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuthRequest(BaseModel):
    email: str
    password: str

class ConstellationRequest(BaseModel):
    min_ratings: int = 20
    similarity_threshold: float = 0.2
    max_connections: int = 5

@app.post("/initialize")
async def initialize():
    global recommender
    movies_data = await load_movies()
    ratings_data = await load_ratings()
    similarity_data = await load_similarity_matrix()

    if movies_data and ratings_data:
        print("✅ Loaded data from MongoDB.")
        movies_df = pd.DataFrame(movies_data)
        ratings_df = pd.DataFrame(ratings_data)
        recommender = CineStellationRecommender(dataframe_mode=True)
        recommender.set_dataframes(ratings_df, movies_df)
        recommender.build_genre_lists()
        if similarity_data:
            recommender.load_similarity_from_mongo(similarity_data)
        return {"message": "Recommender initialized from MongoDB."}
    else:
        print("⚠️ No data found in MongoDB, falling back to CSVs.")
        recommender = CineStellationRecommender("models/ratings.csv", "models/movies.csv")
        recommender.preprocess_data()
        await insert_movies(recommender.movies_df)
        await insert_ratings(recommender.ratings_df)
        return {"message": "Initialized from local CSV and inserted to MongoDB."}

@app.post("/upload-dataset")
async def upload_dataset(movies_file: UploadFile = File(...), ratings_file: UploadFile = File(...)):
    global recommender

    os.makedirs("models", exist_ok=True)
    movies_path = os.path.join("models", "movies.csv")
    ratings_path = os.path.join("models", "ratings.csv")

    with open(movies_path, "wb") as f:
        shutil.copyfileobj(movies_file.file, f)
    with open(ratings_path, "wb") as f:
        shutil.copyfileobj(ratings_file.file, f)

    recommender = CineStellationRecommender(ratings_path, movies_path)
    recommender.preprocess_data()
    recommender.compute_similarity()
    await insert_movies(recommender.movies_df)
    await insert_ratings(recommender.ratings_df)
    await insert_similarity_matrix(recommender.serialize_similarity_matrix())

    return {"message": "Dataset uploaded, processed, and stored in MongoDB."}

@app.post("/compute-similarity")
async def compute_similarity():
    if not recommender:
        raise HTTPException(status_code=400, detail="Recommender not initialized")
    recommender.compute_similarity()
    await insert_similarity_matrix(recommender.serialize_similarity_matrix())
    return {"message": "Similarity matrix computed and stored."}

@app.post("/create-constellations")
async def create_constellations(req: ConstellationRequest):
    if not recommender:
        raise HTTPException(status_code=400, detail="Recommender not initialized")
    recommender.create_genre_constellations(req.min_ratings, req.similarity_threshold, req.max_connections)
    data = recommender.get_constellation_data()
    await save_constellation_data(data)
    return {"message": "Constellations created and saved to MongoDB"}

@app.get("/recommend/{movie_id}")
def recommend(movie_id: int, top_n: int = 5):
    if not recommender:
        raise HTTPException(status_code=400, detail="Recommender not initialized")
    return recommender.recommend_similar_movies(movie_id, top_n)

@app.get("/export")
async def export():
    data = await load_constellation_data()
    if not data:
        raise HTTPException(status_code=404, detail="Constellation data not found")
    data.pop("_id", None)  # remove MongoDB ObjectId
    return JSONResponse(content=data)

@app.post("/users/signup")
async def signup(auth: AuthRequest):
    user = await create_user(auth.email, auth.password)
    if not user:
        raise HTTPException(status_code=409, detail="Email already registered.")
    return user

@app.post("/users/login")
async def login(auth: AuthRequest):
    user = await verify_user(auth.email, auth.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return user

@app.post("/users/add-watched")
async def add_watched(req: WatchedMovieRequest):
    success = await add_watched_movie(req.email, req.movie_id, req.movie_title)
    if not success:
        raise HTTPException(status_code=400, detail="Could not update watched list.")
    return {"message": "Movie added to watched list."}

@app.get("/users/watched")
async def fetch_watched(email: str):
    movies = await get_watched_movies(email)
    return {"watched_movies": movies}

@app.post("/users/remove-watched")
async def remove_watched(req: RemoveWatchedRequest):
    success = await remove_watched_movie(req.email, req.movie_id)
    if not success:
        raise HTTPException(status_code=400, detail="Could not remove watched movie.")
    return {"message": "Movie removed from watched list."}
