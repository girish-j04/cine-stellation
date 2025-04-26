import motor.motor_asyncio
from dotenv import load_dotenv
import os
import pandas as pd
from typing import List, Dict

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client["cine_db"]

async def insert_movies(movies_df: pd.DataFrame):
    records = movies_df.to_dict("records")
    await db.movies.delete_many({})
    if records:
        await db.movies.insert_many(records)

async def insert_ratings(ratings_df: pd.DataFrame):
    records = ratings_df.to_dict("records")
    await db.ratings.delete_many({})
    if records:
        await db.ratings.insert_many(records)

async def insert_similarity_matrix(matrix: List[Dict]):
    await db.similarities.delete_many({})
    await db.similarities.insert_many(matrix)

async def load_movies():
    return await db.movies.find().to_list(None)

async def load_ratings():
    return await db.ratings.find().to_list(None)

async def load_similarity_matrix():
    return await db.similarities.find().to_list(None)

def get_db():
    return db