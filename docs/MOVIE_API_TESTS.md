# 🎬 Movie API Tests - Postman Collection

**Base URL:** `http://localhost:5000/movies`

**Headers (All requests):**

- `Content-Type: application/json`

**Authentication:**

- Protected routes need `Authorization: Bearer {{adminToken}}`
- Save token after login

---

## 📋 Quick Test Order

1. Get All Movies
2. Create Movie (Save ID)
3. Get Movie By ID
4. Search
5. Filters (Genre, Status, Rating, Duration, Popular)
6. ShowTimes & Stats
7. Update Movie
8. Restore & Delete
9. Error Tests

---

## ✅ Test 1: Get All Movies

```
GET /
```

**Params:** `page=1&limit=10`

**Expected:** ✅ Status 200 + movies array + pagination

**Save:** `movieId` = first movie's `_id`

---

## ✅ Test 2: Create Movie (Admin)

```
POST /
Authorization: Bearer {{adminToken}}
```

**Body:**

```json
{
  "title": "Interstellar",
  "description": "A mind-bending sci-fi about space exploration.",
  "duration": 169,
  "genre": ["sci-fi", "drama"],
  "language": "English",
  "releaseDate": "2026-05-01",
  "trailerUrl": "https://example.com/trailer.mp4",
  "posterUrl": "https://example.com/poster.jpg",
  "rating": 8.8,
  "status": "now_showing"
}
```

**Expected:** ✅ Status 201 + movie object

**Save:** `newMovieId` = response `_id`

---

## ✅ Test 3: Get Movie By ID

```
GET /:id
```

**URL:** `{{movieId}}`

**Expected:** ✅ Status 200 + single movie

---

## ✅ Test 4: Search Movies

```
GET /?search=Interstellar
```

**Expected:** ✅ Status 200 + filtered results

---

## ✅ Test 5: Filter by Genre

```
GET /?genre=sci-fi
```

**Expected:** ✅ Status 200 + sci-fi movies

---

## ✅ Test 6: Filter by Status

```
GET /?status=now_showing
```

**Expected:** ✅ Status 200 + movies now showing

---

## ✅ Test 7: Filter by Rating

```
GET /?minRating=7&maxRating=10
```

**Expected:** ✅ Status 200 + movies 7-10 rating

---

## ✅ Test 8: Filter by Duration

```
GET /?minDuration=90&maxDuration=180
```

**Expected:** ✅ Status 200 + movies 90-180 min

---

## ✅ Test 9: Popular Movies

```
GET /?popular=true
```

**Expected:** ✅ Status 200 + sorted by bookings & rating

---

## ✅ Test 10: Get ShowTimes

```
GET /:id/showtimes
```

**URL:** `{{movieId}}`

**Expected:** ✅ Status 200 + movie + showTimes array

---

## ✅ Test 11: Get Movie Stats

```
GET /:id/stats
```

**URL:** `{{movieId}}`

**Expected:** ✅ Status 200 + stats (totalShowTimes, totalBookings, totalRevenue, average)

---

## ✅ Test 12: Update Movie (Admin)

```
PATCH /:id
Authorization: Bearer {{adminToken}}
```

**URL:** `{{movieId}}`

**Body:**

```json
{
  "rating": 9.2,
  "status": "archived"
}
```

**Expected:** ✅ Status 200 + updated movie

---

## ✅ Test 13: Restore Movie (Admin)

```
PATCH /:id/restore
Authorization: Bearer {{adminToken}}
```

**URL:** `{{movieId}}`

**Body:** `{}`

**Expected:** ✅ Status 200 + restored movie

---

## ✅ Test 14: Get Deleted Movies (Admin)

```
GET /deleted
Authorization: Bearer {{adminToken}}
```

**Params:** `page=1&limit=10`

**Expected:** ✅ Status 200 + deleted movies only

---

## ✅ Test 15: Bulk Delete (Admin)

```
POST /bulk/delete
Authorization: Bearer {{adminToken}}
```

**Body:**

```json
{
  "movieIds": ["id1", "id2", "id3"]
}
```

**Expected:** ✅ Status 200 + deleted count

---

## ✅ Test 16: Delete Movie (Admin)

```
DELETE /:id
Authorization: Bearer {{adminToken}}
```

**URL:** `{{movieId}}`

**Expected:** ✅ Status 200 + success message

---

---

# ❌ ERROR Tests

## ❌ Test 1: Invalid ID

```
GET /invalid_id
```

**Expected:** ❌ Status 400 + "Invalid movie ID"

---

## ❌ Test 2: Movie Not Found

```
GET /507f1f77bcf86cd799439099
```

**Expected:** ❌ Status 404 + "Movie not found"

---

## ❌ Test 3: No Authorization

```
POST /
Body: { title: "Test" }
```

**Expected:** ❌ Status 401 + "Invalid or missing token"

---

## ❌ Test 4: Not Admin

```
PATCH /:id
Authorization: Bearer USER_TOKEN
```

**Expected:** ❌ Status 403 + "Access denied: Admins only"

---

## ❌ Test 5: Missing Title

```
POST /
Body: { description: "No title", ... }
```

**Expected:** ❌ Status 400 + validation error

---

## ❌ Test 6: Title Too Short

```
POST /
Body: { title: "A", ... }
```

**Expected:** ❌ Status 400 + "Title must be at least 2 characters"

---

## ❌ Test 7: Duration Too Long

```
POST /
Body: { duration: 1000, ... }
```

**Expected:** ❌ Status 400 + "Duration must not exceed 720 minutes"

---

## ❌ Test 8: Empty Genre

```
POST /
Body: { genre: [], ... }
```

**Expected:** ❌ Status 400 + "At least one genre is required"

---

## ❌ Test 9: Invalid Rating

```
POST /
Body: { rating: 15, ... }
```

**Expected:** ❌ Status 400 + "Rating must not exceed 10"

---

## ❌ Test 10: Invalid URL

```
POST /
Body: { posterUrl: "not-a-url", ... }
```

**Expected:** ❌ Status 400 + "Invalid poster URL"

---

## ❌ Test 11: Min Rating > Max Rating

```
GET /?minRating=10&maxRating=5
```

**Expected:** ❌ Status 400 + "Minimum rating must be less than or equal to maximum rating"

---

## ❌ Test 12: Min Duration > Max Duration

```
GET /?minDuration=200&maxDuration=100
```

**Expected:** ❌ Status 400 + "Minimum duration must be less than or equal to maximum duration"

---

---

# 📊 Response Format

## ✅ Success (List with Pagination)

```json
{
  "success": true,
  "data": [...movies...],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

## ✅ Success (Single Item)

```json
{
  "success": true,
  "message": "...",
  "data": {...movie...}
}
```

## ❌ Error

```json
{
  "message": "Error description",
  "status": 400 | 401 | 403 | 404
}
```

---

---

# 🛠️ Postman Collection Setup

## Variables

```
adminToken = Bearer token from login
movieId = ID from Test 1
newMovieId = ID from Test 2
```

## Collection Pre-request Script

```javascript
// Validate required variables
if (!pm.globals.get("adminToken")) {
  console.warn("⚠️ adminToken not set!");
}
```

## Test Tab Script (Example)

```javascript
pm.test("Status is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Has success field", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success || jsonData.data).to.exist;
});
```

---

---

# 📋 Field Validation

| Field       | Min | Max  | Rules                                  |
| ----------- | --- | ---- | -------------------------------------- |
| title       | 2   | 200  | letters & numbers                      |
| description | 10  | 2000 | text                                   |
| duration    | 1   | 720  | minutes                                |
| genre       | 1   | 10   | array items                            |
| rating      | 0   | 10   | decimal                                |
| posterUrl   | -   | -    | valid URL                              |
| trailerUrl  | -   | -    | valid URL (optional)                   |
| status      | -   | -    | now_showing \| coming_soon \| archived |

---

---

# ⚡ Quick Tips

1. **Genre Normalization:** "Sci-Fi" → "sci-fi" (auto lowercase)
2. **Soft Delete:** Deleted movies not removed, just marked deleted
3. **Restore:** PATCH `/:id/restore` to restore deleted movies
4. **Bulk Delete:** POST `/bulk/delete` with movieIds array
5. **Sorting:** Popular = bookingCount ↓, rating ↓
6. **Pagination:** Default limit=10, max=100
7. **Search:** Searches title + description (case-insensitive)
8. **Admin Only:** POST, PATCH, DELETE, GET /deleted, POST /bulk/delete

---

\*\*🚀 Ready to test!
