import motor.motor_asyncio
from dotenv import load_dotenv
import os
import pandas as pd
from typing import List, Dict
import bcrypt

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client["cine_db"]

async def create_user(email: str, password: str):
    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        return None

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = { "email": email, "password": hashed_pw }
    result = await db.users.insert_one(user)

    # Prepare a clean response
    return {
        "id": str(result.inserted_id),
        "email": email
    }


async def verify_user(email: str, password: str):
    user = await db.users.find_one({"email": email})
    if not user:
        return None
    if bcrypt.checkpw(password.encode(), user["password"].encode()):
        return {
            "id": str(user["_id"]),
            "email": user["email"]
        }
    return None


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

async def save_constellation_data(data: dict):
    await db.constellations.delete_many({})
    await db.constellations.insert_one(data)

async def load_constellation_data():
    return await db.constellations.find_one()


def get_db():
    return db
