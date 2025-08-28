# Cine-Stellation

A sophisticated movie recommendation system that visualizes movie relationships as interactive constellation graphs using machine learning algorithms.

## Overview

Cine-Stellation combines advanced recommendation algorithms with stunning visual representations to help users discover movies through an intuitive, space-themed interface. The system uses TF-IDF vectorization and cosine similarity to identify relationships between movies, presenting them as interconnected constellations based on genres, themes, and user preferences.

## Architecture

The application follows a modern full-stack architecture:

- **Frontend**: Next.js 14 with React, featuring interactive canvas-based visualizations
- **Backend**: FastAPI with Python for high-performance API endpoints
- **Database**: MongoDB for scalable data persistence
- **ML Engine**: Scikit-learn for recommendation algorithms and similarity computations
- **Authentication**: NextAuth.js with JWT tokens

## Features

### Core Functionality
- **Interactive Movie Constellations**: Visual representation of movie relationships using force-directed graphs
- **Intelligent Recommendations**: Machine learning-powered suggestions based on content similarity
- **Plot-Based Search**: Find movies by describing plot elements or themes
- **Genre Filtering**: Filter movie constellations by specific genres
- **User Authentication**: Secure user accounts with bcrypt password hashing
- **Watched Movies Tracking**: Personal watchlists and viewing history

### Visual Features
- **Starry Background**: Immersive space-themed interface
- **Force-Directed Layouts**: Dynamic positioning based on movie similarity
- **Interactive Search**: Real-time movie search with autocomplete
- **Responsive Design**: Optimized for desktop and mobile experiences
- **Similarity Scoring**: Visual indicators showing relationship strength between movies

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Authentication**: NextAuth.js
- **Canvas Rendering**: HTML5 Canvas API
- **HTTP Client**: Fetch API

### Backend
- **API Framework**: FastAPI
- **ML Libraries**: 
  - Scikit-learn (TF-IDF, Cosine Similarity)
  - Pandas (Data manipulation)
  - NumPy (Numerical computations)
  - NetworkX (Graph algorithms)
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: bcrypt for password hashing
- **Environment**: Python 3.8+

## Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB instance (local or cloud)

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to API directory
cd cine-api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and other configurations

# Start the server
uvicorn main:app --reload
```

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

#### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/cine_db
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cine_db
```

## Usage

### Initial Setup
1. Start the backend server: `uvicorn main:app --reload`
2. Start the frontend: `npm run dev`
3. Initialize the recommender system by calling `POST /initialize`
4. Upload movie datasets (optional) or use provided sample data

### Core Workflows

#### Data Initialization
```bash
# Initialize with existing data
POST /initialize

# Upload custom datasets
POST /upload-dataset
```

#### User Authentication
```bash
# Register new user
POST /users/signup

# User login
POST /users/login
```

#### Movie Recommendations
```bash
# Get recommendations for a specific movie
GET /recommend/{movie_id}?top_n=5

# Search movies by plot description
POST /ml/query
```

### Frontend Navigation
- **Home Page**: Interactive movie constellation with search and filtering
- **Plot Search**: `/plot` - Search movies by plot descriptions
- **User Authentication**: Sign up/sign in functionality
- **Personal Watchlist**: Track and manage watched movies

## API Documentation

### Core Endpoints

#### System Management
- `POST /initialize` - Initialize the recommendation system
- `POST /upload-dataset` - Upload custom movie datasets
- `POST /compute-similarity` - Compute similarity matrices
- `POST /create-constellations` - Generate movie constellations

#### Recommendations
- `GET /recommend/{movie_id}` - Get similar movies for a given movie ID
- `POST /ml/query` - Search movies by plot description
- `GET /export` - Export constellation data

#### User Management
- `POST /users/signup` - Create new user account
- `POST /users/login` - Authenticate user
- `POST /users/add-watched` - Add movie to user's watched list
- `GET /users/watched` - Retrieve user's watched movies
- `POST /users/remove-watched` - Remove movie from watched list

### Request/Response Examples

#### Movie Recommendations
```json
GET /recommend/1?top_n=5

Response:
[
  {
    "id": 2,
    "title": "Jumanji (1995)",
    "similarity": 0.85,
    "rating": 4.2,
    "genres": ["Adventure", "Children", "Fantasy"]
  }
]
```

#### Plot Search
```json
POST /ml/query
{
  "query": "space adventure with aliens",
  "top_k": 5
}
```

## Database Schema

### Collections

#### movies
```json
{
  "movieId": 1,
  "title": "Toy Story (1995)",
  "genres": ["Animation", "Children", "Comedy"]
}
```

#### ratings
```json
{
  "userId": 1,
  "movieId": 1,
  "rating": 4.0,
  "timestamp": 964982703
}
```

#### users
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password": "hashed_password",
  "watched_movies": [
    {
      "id": 1,
      "title": "Toy Story (1995)"
    }
  ]
}
```

#### similarities
```json
{
  "movieId": 1,
  "similarities": [
    {
      "movieId": 2,
      "score": 0.85
    }
  ]
}
```

#### constellations
```json
{
  "genres": ["Action", "Comedy"],
  "movies": [],
  "connections": []
}
```

## Machine Learning Pipeline

### Recommendation Algorithm
1. **Data Preprocessing**: Clean and structure movie metadata and ratings
2. **Feature Extraction**: Generate TF-IDF vectors from movie content (titles + genres)
3. **Similarity Computation**: Calculate cosine similarity between all movie pairs
4. **Graph Generation**: Create genre-based movie networks using NetworkX
5. **Recommendation**: Return top-N similar movies with similarity scores

### Model Performance
- **Similarity Threshold**: 0.2 (configurable)
- **Maximum Connections**: 5 per movie (configurable)
- **Minimum Ratings**: 20 per movie for inclusion in constellations

## Development

### Frontend Development
- Components are organized in `client/src/app/components/`
- Pages use Next.js App Router in `client/src/app/`
- Styling with Tailwind CSS utility classes
- State management with React Hooks

### Backend Development
- API routes defined in `cine-api/main.py`
- ML models in `cine-api/cine_stellation_recommender.py`
- Database operations in `cine-api/database.py`
- Configuration via environment variables

### Testing
```bash
# Frontend testing
cd client
npm test

# Backend testing
cd cine-api
python -m pytest
```

## Data Requirements

### Expected Datasets
- **movies.csv**: Movie metadata with columns: `movieId`, `title`, `genres`
- **ratings.csv**: User ratings with columns: `userId`, `movieId`, `rating`, `timestamp`

### Data Format
- Genres should be pipe-separated (e.g., "Action|Adventure|Sci-Fi")
- Movie titles should include release year (e.g., "Toy Story (1995)")
- Ratings on a scale of 0.5-5.0

## Performance Considerations

- **Similarity Matrix**: Computed once and cached in MongoDB
- **Force-Directed Layout**: Optimized for 50-100 movies per constellation
- **Real-time Search**: Debounced input with efficient filtering algorithms
- **Memory Management**: Lazy loading of movie data and similarity scores

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Ensure all tests pass
5. Submit a pull request with a clear description

### Code Style
- **Frontend**: ESLint + Prettier configuration
- **Backend**: PEP 8 Python style guide
- **Commits**: Conventional commit format

## Acknowledgments

- MovieLens dataset for training data
- Scikit-learn for machine learning algorithms
- Next.js and FastAPI communities for excellent documentation
- Contributors and testers who helped shape this project
