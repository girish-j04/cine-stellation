# ml_engine.py

import os
import pandas as pd
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

# Constants
DATA_PATH = "models/TMDB_all_movies.csv"
MODEL_PATH = "models/movie_retrieval_model_best"
INDEX_PATH = "models/movie_index.faiss"

# Global cache
model = None
index = None
movies_df = None

def load_model_and_index():
    global model, index, movies_df

    if model is None:
        model = SentenceTransformer(MODEL_PATH)
        print("✅ Model loaded")

    if index is None:
        index = faiss.read_index(INDEX_PATH)
        print("✅ FAISS index loaded")

    if movies_df is None:
        movies_df = pd.read_csv(DATA_PATH)
        print("✅ Movie CSV loaded")

def fetch_movies(query: str, top_k: int = 10):
    load_model_and_index()
    
    query_embedding = model.encode([query])
    distances, indices = index.search(query_embedding, k=top_k)

    results = []
    for idx in indices[0]:
        if 0 <= idx < len(movies_df):
            movie_row = movies_df.iloc[idx].fillna("")

            results.append({
                "title": str(movie_row.get("title", "Unknown")),
                "overview": str(movie_row.get("overview", "")),
                "release_date": str(movie_row.get("release_date", "")),
                "cast": str(movie_row.get("cast", "")),
                "director": str(movie_row.get("director", ""))
            })

    return results
