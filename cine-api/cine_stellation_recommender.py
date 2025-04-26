import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import networkx as nx
import json

class CineStellationRecommender:
    def __init__(self, ratings_file=None, movies_file=None, dataframe_mode=False):
        self.similarity_matrix = None
        self.movie_features = None
        self.genre_networks = {}
        self.id_to_title_map = {}
        self.movies_df = None
        self.ratings_df = None
        self.movies_with_ratings = None
        self.movie_ratings = None
        self.tfidf = None

        if not dataframe_mode:
            self.ratings_df = pd.read_csv(ratings_file)
            self.movies_df = pd.read_csv(movies_file)
            self.preprocess_data()

    def set_dataframes(self, ratings_df, movies_df):
        self.ratings_df = ratings_df
        self.movies_df = movies_df

    def build_genre_lists(self):
        self.movies_df['genres'] = self.movies_df['genres'].apply(lambda g: g if isinstance(g, list) else g.split('|'))
        self.movies_df['content'] = self.movies_df.apply(lambda x: ' '.join([x['title']] + x['genres']), axis=1)
        self.movie_ratings = self.ratings_df.groupby('movieId')['rating'].agg(['mean', 'count'])
        self.movies_with_ratings = self.movies_df.merge(self.movie_ratings, left_on='movieId', right_index=True, how='left').fillna(0)

    def preprocess_data(self):
        self.build_genre_lists()
        self.id_to_title_map = dict(zip(self.movies_df['movieId'], self.movies_df['title']))
        print(f"Processed {len(self.movies_df)} movies and {len(self.ratings_df)} ratings")

    def compute_similarity(self):
        self.tfidf = TfidfVectorizer(stop_words='english')
        self.movie_features = self.tfidf.fit_transform(self.movies_with_ratings['content'])
        self.similarity_matrix = cosine_similarity(self.movie_features)
        print(f"Computed similarity matrix with shape {self.similarity_matrix.shape}")

    def serialize_similarity_matrix(self, top_n=20):
        result = []
        for idx, row in self.movies_with_ratings.iterrows():
            sims = list(enumerate(self.similarity_matrix[idx]))
            sims = sorted(sims, key=lambda x: x[1], reverse=True)[1:top_n + 1]
            entry = {
                "movieId": int(row['movieId']),
                "similarities": [{"movieId": int(self.movies_with_ratings.iloc[j]['movieId']), "score": float(score)}
                                 for j, score in sims]
            }
            result.append(entry)
        return result

    def load_similarity_from_mongo(self, similarity_data):
        size = len(self.movies_with_ratings)
        matrix = np.zeros((size, size))
        movie_index = {int(mid): idx for idx, mid in enumerate(self.movies_with_ratings['movieId'])}
        for doc in similarity_data:
            i = movie_index.get(doc['movieId'])
            if i is not None:
                for entry in doc['similarities']:
                    j = movie_index.get(entry['movieId'])
                    if j is not None:
                        matrix[i, j] = entry['score']
        self.similarity_matrix = matrix
        print("Loaded similarity matrix from MongoDB")

    def recommend_similar_movies(self, movie_id, top_n=5):
        try:
            movie_idx = self.movies_with_ratings[self.movies_with_ratings['movieId'] == movie_id].index[0]
            sim_scores = list(enumerate(self.similarity_matrix[movie_idx]))
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:top_n + 1]
            movie_indices = [i[0] for i in sim_scores]
            recommendations = []
            for idx in movie_indices:
                movie_row = self.movies_with_ratings.iloc[idx]
                recommendations.append({
                    'id': int(movie_row['movieId']),
                    'title': str(movie_row['title']),
                    'similarity': float(sim_scores[movie_indices.index(idx)][1]),
                    'rating': float(movie_row['mean']),
                    'genres': list(map(str, movie_row['genres']))
                })
            return recommendations
        except Exception as e:
            print(f"Error recommending similar movies: {e}")
            return []

    def create_genre_constellations(self, min_ratings=50, similarity_threshold=0.3, max_connections=5):
        popular_movies = self.movies_with_ratings[self.movies_with_ratings['count'] >= min_ratings]
        all_genres = set(g for genres in self.movies_df['genres'] for g in genres)
        for genre in all_genres:
            if genre == '(no genres listed)':
                continue
            genre_movies = popular_movies[popular_movies['genres'].apply(lambda x: genre in x)]
            if len(genre_movies) < 5:
                continue
            G = nx.Graph()
            for idx, row in genre_movies.iterrows():
                movie_id = row['movieId']
                G.add_node(movie_id, title=row['title'], rating=row['mean'], count=row['count'], year=self.extract_year(row['title']))
            for i, row_i in genre_movies.iterrows():
                idx_i = self.movies_with_ratings[self.movies_with_ratings['movieId'] == row_i['movieId']].index[0]
                similarities = []
                for j, row_j in genre_movies.iterrows():
                    if row_i['movieId'] == row_j['movieId']:
                        continue
                    idx_j = self.movies_with_ratings[self.movies_with_ratings['movieId'] == row_j['movieId']].index[0]
                    sim_score = self.similarity_matrix[idx_i, idx_j]
                    if sim_score >= similarity_threshold:
                        similarities.append((row_j['movieId'], sim_score))
                similarities.sort(key=lambda x: x[1], reverse=True)
                for movie_j_id, sim_score in similarities[:max_connections]:
                    G.add_edge(row_i['movieId'], movie_j_id, weight=sim_score)
            self.genre_networks[genre] = G
            print(f"Created constellation for {genre} with {G.number_of_nodes()} movies and {G.number_of_edges()} connections")

    def extract_year(self, title):
        try:
            year = title.strip()[-5:-1]
            return int(year) if year.isdigit() else None
        except:
            return None
    
    def get_constellation_data(self):
        
        """Return constellation data as a dictionary for API serving"""
        constellation_data = {
            "genres": [],
            "movies": [],
            "connections": []
        }

        movie_ids_added = set()

        for genre, G in self.genre_networks.items():
            genre_info = {
                "name": genre,
                "movieCount": G.number_of_nodes(),
                "connectionCount": G.number_of_edges()
            }
            constellation_data["genres"].append(genre_info)

            for movie_id, attrs in G.nodes(data=True):
                if movie_id not in movie_ids_added:
                    movie_info = {
                        "id": int(movie_id),
                        "title": attrs["title"],
                        "rating": float(attrs["rating"]),
                        "ratingCount": int(attrs["count"]),
                        "year": attrs["year"],
                        "genres": [g for g in self.movies_df[self.movies_df["movieId"] == movie_id]["genres"].iloc[0]]
                    }
                    constellation_data["movies"].append(movie_info)
                    movie_ids_added.add(movie_id)

            for movie_i, movie_j, attrs in G.edges(data=True):
                connection = {
                    "source": int(movie_i),
                    "target": int(movie_j),
                    "similarity": float(attrs["weight"]),
                    "genre": genre
                }
                constellation_data["connections"].append(connection)

        return constellation_data

    def export_constellation_data(self, output_file="constellation_data.json"):
        constellation_data = {"genres": [], "movies": [], "connections": []}
        movie_ids_added = set()
        for genre, G in self.genre_networks.items():
            constellation_data["genres"].append({
                "name": genre,
                "movieCount": G.number_of_nodes(),
                "connectionCount": G.number_of_edges()
            })
            for movie_id, attrs in G.nodes(data=True):
                if movie_id not in movie_ids_added:
                    movie_info = {
                        "id": int(movie_id),
                        "title": attrs["title"],
                        "rating": float(attrs["rating"]),
                        "ratingCount": int(attrs["count"]),
                        "year": attrs["year"],
                        "genres": [g for g in self.movies_df[self.movies_df["movieId"] == movie_id]["genres"].iloc[0]]
                    }
                    constellation_data["movies"].append(movie_info)
                    movie_ids_added.add(movie_id)
            for movie_i, movie_j, attrs in G.edges(data=True):
                constellation_data["connections"].append({
                    "source": int(movie_i),
                    "target": int(movie_j),
                    "similarity": float(attrs["weight"]),
                    "genre": genre
                })
        with open(output_file, 'w') as f:
            json.dump(constellation_data, f, indent=2)
        print(f"Exported constellation data to {output_file}")