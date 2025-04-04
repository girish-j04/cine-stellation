import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import networkx as nx
from collections import defaultdict
import matplotlib.pyplot as plt
import json

class CineStellationRecommender:
    def __init__(self, ratings_file, movies_file):
        """
        Initialize the recommender system with MovieLens dataset files
        
        """
        self.ratings_df = pd.read_csv(ratings_file)
        self.movies_df = pd.read_csv(movies_file)
        self.similarity_matrix = None
        self.movie_features = None
        self.genre_networks = {}
        self.id_to_title_map = {}
        
    def preprocess_data(self):
        """Preprocess the datasets and create necessary mappings"""
        # Create a mapping from movieId to title
        self.id_to_title_map = dict(zip(self.movies_df['movieId'], self.movies_df['title']))
        
        # Extract genres and create a list of genres for each movie
        self.movies_df['genres'] = self.movies_df['genres'].str.split('|')
        
        # Create a content string for each movie (combining title and genres)
        self.movies_df['content'] = self.movies_df.apply(
            lambda x: ' '.join([x['title']] + x['genres']), axis=1)
            
        # Compute average ratings for each movie
        self.movie_ratings = self.ratings_df.groupby('movieId')['rating'].agg(['mean', 'count'])
        
        # Merge ratings with movie metadata
        self.movies_with_ratings = self.movies_df.merge(
            self.movie_ratings, left_on='movieId', right_index=True, how='left')
        
        # Fill NaN values for movies without ratings
        self.movies_with_ratings['mean'] = self.movies_with_ratings['mean'].fillna(0)
        self.movies_with_ratings['count'] = self.movies_with_ratings['count'].fillna(0)
        
        print(f"Processed {len(self.movies_df)} movies and {len(self.ratings_df)} ratings")
        
    def compute_similarity(self):
        """Compute similarity between movies based on content"""
        tfidf = TfidfVectorizer(stop_words='english')
        
        self.movie_features = tfidf.fit_transform(self.movies_with_ratings['content'])
        
        self.similarity_matrix = cosine_similarity(self.movie_features)
        
        print(f"Computed similarity matrix with shape {self.similarity_matrix.shape}")
        
    def create_genre_constellations(self, min_ratings=50, similarity_threshold=0.3, max_connections=5):
        """
        Create genre-based constellations with connected similar movies
        
        Parameters:
        min_ratings: minimum number of ratings for a movie to be included
        similarity_threshold: minimum similarity score for movies to be connected
        max_connections: maximum number of connections per movie
        """
        popular_movies = self.movies_with_ratings[self.movies_with_ratings['count'] >= min_ratings]
        
        all_genres = set()
        for genres in self.movies_df['genres']:
            all_genres.update(genres)
        
        for genre in all_genres:
            if genre == '(no genres listed)':
                continue
                
            # Filter movies of this genre
            genre_movies = popular_movies[popular_movies['genres'].apply(lambda x: genre in x)]
            
            if len(genre_movies) < 5:  # Skip genres with too few movies
                continue
                
            # Create a graph for this genre
            G = nx.Graph()
            
            # Add nodes (movies)
            for idx, row in genre_movies.iterrows():
                movie_id = row['movieId']
                G.add_node(movie_id, title=row['title'], rating=row['mean'], 
                           count=row['count'], year=self.extract_year(row['title']))
            
            # Add edges (connections between similar movies)
            for i, row_i in genre_movies.iterrows():
                movie_i_idx = self.movies_with_ratings[self.movies_with_ratings['movieId'] == row_i['movieId']].index[0]
                
                # Find similar movies and sort by similarity
                similarities = []
                for j, row_j in genre_movies.iterrows():
                    if row_i['movieId'] == row_j['movieId']:
                        continue
                        
                    movie_j_idx = self.movies_with_ratings[self.movies_with_ratings['movieId'] == row_j['movieId']].index[0]
                    sim_score = self.similarity_matrix[movie_i_idx, movie_j_idx]
                    
                    if sim_score >= similarity_threshold:
                        similarities.append((row_j['movieId'], sim_score))
                
                # Sort by similarity and take top connections
                similarities.sort(key=lambda x: x[1], reverse=True)
                for movie_j_id, sim_score in similarities[:max_connections]:
                    G.add_edge(row_i['movieId'], movie_j_id, weight=sim_score)
            
            self.genre_networks[genre] = G
            print(f"Created constellation for {genre} with {G.number_of_nodes()} movies and {G.number_of_edges()} connections")
    
    def extract_year(self, title):
        """Extract year from movie title"""
        try:
            year = title.strip()[-5:-1]
            if year.isdigit():
                return int(year)
            return None
        except:
            return None
    
    def export_constellation_data(self, output_file="constellation_data.json"):
        """Export constellation data to JSON for frontend visualization"""
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
            
            # Export movie nodes
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
            
            # Export connections
            for movie_i, movie_j, attrs in G.edges(data=True):
                connection = {
                    "source": int(movie_i),
                    "target": int(movie_j),
                    "similarity": float(attrs["weight"]),
                    "genre": genre
                }
                constellation_data["connections"].append(connection)
        
        with open(output_file, 'w') as f:
            json.dump(constellation_data, f, indent=2)
            
        print(f"Exported constellation data to {output_file}")
        print(f"Total movies: {len(constellation_data['movies'])}")
        print(f"Total connections: {len(constellation_data['connections'])}")
        
    def visualize_constellation(self, genre, output_file=None):
        """
        Visualize a genre constellation using NetworkX
        mainly for debugging purposes
        """
        if genre not in self.genre_networks:
            print(f"Genre '{genre}' not found")
            return
            
        G = self.genre_networks[genre]
        
        plt.figure(figsize=(12, 12))
        
        pos = nx.spring_layout(G, seed=42)
        
        nx.draw_networkx_nodes(G, pos, node_size=[G.nodes[n]['rating'] * 20 for n in G.nodes()],
                              node_color='skyblue', alpha=0.8)
        
        for u, v, d in G.edges(data=True):
            nx.draw_networkx_edges(G, pos, edgelist=[(u, v)], width=d['weight']*2, alpha=d['weight'])
        
        labels = {n: G.nodes[n]['title'].split('(')[0] for n in G.nodes()}
        nx.draw_networkx_labels(G, pos, labels=labels, font_size=8)
        
        plt.title(f"Movie Constellation: {genre}")
        plt.axis('off')
        
        if output_file:
            plt.savefig(output_file, dpi=300, bbox_inches='tight')
            print(f"Saved visualization to {output_file}")
        else:
            plt.show()
            
    def recommend_similar_movies(self, movie_id, top_n=5):
        """
        Recommend similar movies to a given movie
        
        Parameters:
        movie_id: ID of the movie
        top_n: number of recommendations to return
        """
        try:
            movie_idx = self.movies_with_ratings[self.movies_with_ratings['movieId'] == movie_id].index[0]
            
            sim_scores = list(enumerate(self.similarity_matrix[movie_idx]))
            
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
            
            sim_scores = sim_scores[1:top_n+1]
            
            movie_indices = [i[0] for i in sim_scores]
            
            recommendations = []
            for idx in movie_indices:
                movie_row = self.movies_with_ratings.iloc[idx]
                recommendations.append({
                    'id': movie_row['movieId'],
                    'title': movie_row['title'],
                    'similarity': sim_scores[movie_indices.index(idx)][1],
                    'rating': movie_row['mean'],
                    'genres': movie_row['genres']
                })
                
            return recommendations
            
        except Exception as e:
            print(f"Error recommending similar movies: {e}")
            return []