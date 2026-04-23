# MOVIE API TESTS

Base URL
http://localhost:5000/movies

Note

- Use `Content-Type: application/json` for all requests.
- Protected routes need `Authorization: Bearer <ADMIN_TOKEN>`.
- Admin user required for: Create, Update, Delete
- Public routes work for all users (authenticated or not)

# Suggested Test Order

1. Get All Movies (Public)
2. Create Movie (Admin)
3. Get Movie By ID (Public)
4. Search Movies (Public)
5. Filter Movies (Public)
6. Get Movies By Genre (Public)
7. Get Movies By Status (Public)
8. Get Popular Movies (Public)
9. Get Movie ShowTimes (Public)
10. Get Movie Stats (Public)
11. Update Movie (Admin)
12. Delete Movie (Admin)

================================================

1. # Get All Movies (with Pagination)
   Method: GET
   URL: http://localhost:5000/movies

Query Parameters (optional):

- page = 1 (default)
- limit = 10 (default, max 100)

Example:
http://localhost:5000/movies?page=1&limit=10

Expected Response:
{
"success": true,
"data": [
{
"\_id": "...",
"title": "Interstellar",
"description": "A science fiction movie...",
"duration": 169,
"genre": ["sci-fi", "drama"],
"language": "English",
"releaseDate": "2026-05-01T00:00:00.000Z",
"trailerUrl": "https://example.com/trailer",
"posterUrl": "https://example.com/poster.jpg",
"rating": 8.8,
"status": "now_showing",
"isDeleted": false,
"bookingCount": 0,
"createdBy": {
"\_id": "...",
"name": "Admin User",
"email": "admin@example.com"
},
"createdAt": "...",
"updatedAt": "..."
}
],
"pagination": {
"total": 5,
"page": 1,
"limit": 10,
"pages": 1
}
}

Save:

- movie id as `MOVIE_ID`

================================================ 2. Create Movie (Admin Only)
================================================
Method: POST
URL: http://localhost:5000/movies

Headers:
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

Body:
{
"title": "Interstellar",
"description": "A science fiction movie about space exploration and humanity's future.",
"duration": 169,
"genre": ["sci-fi", "drama"],
"language": "English",
"releaseDate": "2026-05-01",
"trailerUrl": "https://example.com/trailer",
"posterUrl": "https://example.com/poster.jpg",
"rating": 8.8,
"status": "now_showing"
}

Required Fields:

- title (min 2 chars, max 200)
- description (min 10 chars, max 2000)
- duration (min 1, max 720 minutes)
- genre (array, min 1 item, max 10 items)
- posterUrl (valid URL)

Optional Fields:

- language
- releaseDate
- trailerUrl
- rating (0-10)
- status (now_showing, coming_soon, archived)

Expected Response:
{
"success": true,
"message": "Movie created successfully",
"data": {
"\_id": "...",
"title": "Interstellar",
"description": "A science fiction movie...",
...
}
}

Save:

- movie id as `MOVIE_ID`

================================================ 3. Get Movie By ID
================================================
Method: GET
URL: http://localhost:5000/movies/:id

Example:
http://localhost:5000/movies/PUT_MOVIE_ID_HERE

Expected Response:
{
"success": true,
"data": {
"\_id": "...",
"title": "Interstellar",
"description": "...",
"createdBy": {
"\_id": "...",
"name": "Admin User",
"email": "admin@example.com"
},
...
}
}

Error Cases:

- Invalid ID format: status 400, "Invalid movie ID"
- Movie not found: status 404, "Movie not found"

================================================ 4. Search Movies
================================================
Method: GET
URL: http://localhost:5000/movies/search

Query Parameters (required):

- search = "keyword" (min 1 char, max 200)

Optional:

- page = 1 (default)
- limit = 10 (default, max 100)

Example:
http://localhost:5000/movies/search?search=Interstellar&page=1&limit=10

Searches in:

- title (case-insensitive)
- description (case-insensitive)

Expected Response:
{
"success": true,
"data": [...],
"pagination": {
"total": 2,
"page": 1,
"limit": 10,
"pages": 1
}
}

Error Cases:

- Missing search parameter: status 400
- Empty search parameter: status 400

================================================ 5. Filter Movies (Advanced)
================================================
Method: GET
URL: http://localhost:5000/movies/filter

Query Parameters (all optional):

- genre = "sci-fi"
- status = "now_showing" | "coming_soon" | "archived"
- language = "English"
- minRating = 7 (0-10)
- maxRating = 9 (0-10)
- minDuration = 90 (minutes)
- maxDuration = 180 (minutes)
- page = 1 (default)
- limit = 10 (default, max 100)

Examples:
http://localhost:5000/movies/filter?genre=sci-fi&status=now_showing
http://localhost:5000/movies/filter?minRating=8&maxDuration=180
http://localhost:5000/movies/filter?genre=drama&minDuration=90&maxDuration=150&page=1&limit=20

Validation Rules:

- minRating must be <= maxRating
- minDuration must be <= maxDuration

Expected Response:
{
"success": true,
"data": [...],
"pagination": {
"total": 3,
"page": 1,
"limit": 10,
"pages": 1
}
}

Error Cases:

- minRating > maxRating: status 400, validation error
- minDuration > maxDuration: status 400, validation error
- Invalid status: ignored

================================================ 6. Get Movies By Genre
================================================
Method: GET
URL: http://localhost:5000/movies/genre

Query Parameters (required):

- genre = "sci-fi"

Optional:

- page = 1 (default)
- limit = 10 (default, max 100)

Example:
http://localhost:5000/movies/genre?genre=sci-fi&page=1&limit=10

Expected Response:
{
"success": true,
"data": [...],
"pagination": {
"total": 4,
"page": 1,
"limit": 10,
"pages": 1
}
}

Error Cases:

- Missing genre parameter: status 400
- Empty genre parameter: status 400

================================================ 7. Get Movies By Status
================================================
Method: GET
URL: http://localhost:5000/movies/status

Query Parameters (required):

- status = "now_showing" | "coming_soon" | "archived"

Optional:

- page = 1 (default)
- limit = 10 (default, max 100)

Examples:
http://localhost:5000/movies/status?status=now_showing
http://localhost:5000/movies/status?status=coming_soon&page=1&limit=15

Expected Response:
{
"success": true,
"data": [...],
"pagination": {
"total": 5,
"page": 1,
"limit": 10,
"pages": 1
}
}

Error Cases:

- Missing status parameter: status 400
- Invalid status value: status 400

================================================ 8. Get Popular Movies
================================================
Method: GET
URL: http://localhost:5000/movies/popular

Query Parameters (optional):

- page = 1 (default)
- limit = 10 (default, max 100)

Sorting:

- Primary: bookingCount (descending)
- Secondary: rating (descending)

Example:
http://localhost:5000/movies/popular?page=1&limit=10

Expected Response:
{
"success": true,
"data": [...],
"pagination": {
"total": 5,
"page": 1,
"limit": 10,
"pages": 1
}
}

================================================ 9. Get Movie ShowTimes
================================================
Method: GET
URL: http://localhost:5000/movies/:id/showtimes

Example:
http://localhost:5000/movies/PUT_MOVIE_ID_HERE/showtimes

Expected Response:
{
"success": true,
"data": {
"movie": {
"\_id": "...",
"title": "Interstellar",
"description": "...",
...
},
"showTimes": [
{
"_id": "...",
"movieId": "...",
"hallId": {
"_id": "...",
"name": "Hall 1"
},
"startTime": "2026-05-10T18:00:00.000Z",
"endTime": "2026-05-10T21:00:00.000Z",
"pricing": {...},
"status": "scheduled",
"format": "IMAX"
}
]
}
}

Error Cases:

- Invalid movie ID: status 400
- Movie not found: status 404

================================================ 10. Get Movie Stats
================================================
Method: GET
URL: http://localhost:5000/movies/:id/stats

Example:
http://localhost:5000/movies/PUT_MOVIE_ID_HERE/stats

Expected Response:
{
"success": true,
"data": {
"movie": {
"\_id": "...",
"title": "Interstellar",
...
},
"totalShowTimes": 5,
"totalBookings": 42,
"totalRevenue": 15600,
"averageBookingsPerShow": 8
}
}

Error Cases:

- Invalid movie ID: status 400
- Movie not found: status 404

================================================ 11. Update Movie (Admin Only)
================================================
Method: PATCH
URL: http://localhost:5000/movies/:id

Headers:
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

Example:
http://localhost:5000/movies/PUT_MOVIE_ID_HERE

Body (all optional):
{
"title": "Interstellar: Extended",
"rating": 9.0,
"status": "archived",
"description": "Updated description...",
"duration": 180
}

Validation Rules:

- title: min 2, max 200 characters
- description: min 10, max 2000 characters
- duration: 1-720 minutes
- genre: array with 1-10 items
- rating: 0-10

Expected Response:
{
"success": true,
"message": "Movie updated successfully",
"data": {
"\_id": "...",
"title": "Interstellar: Extended",
"rating": 9.0,
"status": "archived",
...
}
}

Error Cases:

- Invalid movie ID: status 400
- Movie not found: status 404
- Unauthorized (not admin): status 403
- Validation error: status 400

================================================ 12. Delete Movie (Admin Only - Soft Delete)
================================================
Method: DELETE
URL: http://localhost:5000/movies/:id

Headers:
Authorization: Bearer <ADMIN_TOKEN>

Example:
http://localhost:5000/movies/PUT_MOVIE_ID_HERE

Expected Response:
{
"success": true,
"message": "Movie deleted successfully"
}

Note:

- This is a SOFT DELETE (movie is marked as deleted, not removed)
- Deleted movies won't appear in any list (isDeleted: true filter)
- Admin can restore by updating isDeleted: false

Error Cases:

- Invalid movie ID: status 400
- Movie not found: status 404
- Unauthorized (not admin): status 403

================================================
VALIDATION TESTS
================================================

## Test 1: Invalid Movie Creation (Missing Required Field)

Method: POST
URL: http://localhost:5000/movies

Headers:
Authorization: Bearer <ADMIN_TOKEN>

Body (title is missing):
{
"description": "A science fiction movie about space exploration.",
"duration": 169,
"genre": ["sci-fi"],
"posterUrl": "https://example.com/poster.jpg"
}

Expected:

- status 400
- validation error message

## Test 2: Invalid Title (Too Short)

Method: POST
URL: http://localhost:5000/movies

Body:
{
"title": "A",
"description": "A science fiction movie about space exploration.",
"duration": 169,
"genre": ["sci-fi"],
"posterUrl": "https://example.com/poster.jpg"
}

Expected:

- status 400
- "Title must be at least 2 characters"

## Test 3: Invalid Duration (Too Long)

Method: POST
URL: http://localhost:5000/movies

Body:
{
"title": "Interstellar",
"description": "A science fiction movie about space exploration.",
"duration": 900,
"genre": ["sci-fi"],
"posterUrl": "https://example.com/poster.jpg"
}

Expected:

- status 400
- "Duration must not exceed 720 minutes"

## Test 4: Empty Genre Array

Method: POST
URL: http://localhost:5000/movies

Body:
{
"title": "Interstellar",
"description": "A science fiction movie about space exploration.",
"duration": 169,
"genre": [],
"posterUrl": "https://example.com/poster.jpg"
}

Expected:

- status 400
- "At least one genre is required"

## Test 5: Invalid Rating (Out of Range)

Method: POST
URL: http://localhost:5000/movies

Body:
{
"title": "Interstellar",
"description": "A science fiction movie about space exploration.",
"duration": 169,
"genre": ["sci-fi"],
"rating": 15,
"posterUrl": "https://example.com/poster.jpg"
}

Expected:

- status 400
- "Rating must not exceed 10"

## Test 6: Invalid URL Format

Method: POST
URL: http://localhost:5000/movies

Body:
{
"title": "Interstellar",
"description": "A science fiction movie about space exploration.",
"duration": 169,
"genre": ["sci-fi"],
"posterUrl": "not-a-valid-url"
}

Expected:

- status 400
- "Invalid poster URL"

## Test 7: Invalid Status Enum

Method: POST
URL: http://localhost:5000/movies

Body:
{
"title": "Interstellar",
"description": "A science fiction movie about space exploration.",
"duration": 169,
"genre": ["sci-fi"],
"posterUrl": "https://example.com/poster.jpg",
"status": "invalid_status"
}

Expected:

- status 400
- validation error

## Test 8: Filter - minRating > maxRating

Method: GET
URL: http://localhost:5000/movies/filter?minRating=9&maxRating=7

Expected:

- status 400
- "Minimum rating must be less than or equal to maximum rating"

## Test 9: Filter - minDuration > maxDuration

Method: GET
URL: http://localhost:5000/movies/filter?minDuration=200&maxDuration=100

Expected:

- status 400
- "Minimum duration must be less than or equal to maximum duration"

## Test 10: Search - Empty Query

Method: GET
URL: http://localhost:5000/movies/search?search=

Expected:

- status 400
- "Search query required"

## Test 11: Unauthorized Update (Not Admin)

Method: PATCH
URL: http://localhost:5000/movies/PUT_MOVIE_ID_HERE

Headers:
Authorization: Bearer <USER_TOKEN>

Body:
{
"rating": 9.0
}

Expected:

- status 403
- "Access denied: Admins only"

## Test 12: Unauthorized Delete (Not Admin)

Method: DELETE
URL: http://localhost:5000/movies/PUT_MOVIE_ID_HERE

Headers:
Authorization: Bearer <USER_TOKEN>

Expected:

- status 403
- "Access denied: Admins only"

## Test 13: Missing Authorization Header

Method: PATCH
URL: http://localhost:5000/movies/PUT_MOVIE_ID_HERE

Body:
{
"rating": 9.0
}

Expected:

- status 401
- "Invalid or missing token"

================================================
POSTMAN VARIABLES
================================================

Variable Name Value
adminToken token from admin account
movieId id from create movie response
movieTitle "Interstellar"
movieGenre "sci-fi"
movieStatus "now_showing"
searchQuery "Interstellar"
movieRating 8.8
minRating 7
maxRating 10
minDuration 90
maxDuration 180
page 1
limit 10

================================================
QUICK REFERENCE - ROUTES SUMMARY
================================================

Public Routes (No Auth Required):

- GET / Get all movies (paginated)
- GET /search Search movies
- GET /filter Filter movies (advanced)
- GET /genre Get movies by genre
- GET /status Get movies by status
- GET /popular Get popular movies
- GET /:id Get movie by ID
- GET /:id/showtimes Get movie showtimes
- GET /:id/stats Get movie statistics

Admin Only Routes:

- POST / Create movie
- PATCH /:id Update movie
- DELETE /:id Delete movie (soft delete)

Pagination Limits:

- Min limit: 1
- Max limit: 100
- Default limit: 10

Status Values:

- now_showing
- coming_soon
- archived

================================================
TIPS & TRICKS
================================================

1. Genre Normalization:
   - All genres are automatically converted to lowercase
   - "Sci-Fi" becomes "sci-fi"

2. Sorting:
   - List endpoints: sorted by createdAt (newest first)
   - Popular: sorted by bookingCount then rating (descending)
   - ShowTimes: sorted by startTime (ascending)

3. Soft Delete:
   - Deleted movies are marked as deleted but not removed
   - They won't appear in any listings
   - Can be restored by updating isDeleted: false (if needed)

4. Pagination:
   - All list endpoints support pagination
   - Use page and limit query parameters
   - Response includes total count and total pages

5. Search:
   - Searches title and description
   - Case-insensitive
   - Supports partial matches

6. Rating:
   - Optional field
   - Range: 0 to 10
   - Can be decimal (e.g., 8.5)

7. Booking Count:
   - Automatically incremented when bookings are created
   - Used for sorting in popular movies endpoint
