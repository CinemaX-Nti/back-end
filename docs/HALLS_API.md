# Halls API Documentation

## What Was Added

The `halls` module now supports:

- Full CRUD operations
- Request validation using `zod`
- Auth and role protection for admin actions
- Hall overview endpoint that links halls with showtimes, movies, and seat counts

## Endpoints

### 1) Create Hall (Admin only)

- Method: `POST`
- URL: `/halls`
- Protection: `auth + isAdmin`
- Validation: `createHallSchema`

Body example:

```json
{
  "name": "Hall 1",
  "rows": 5,
  "cols": 6,
  "seatLayout": [
    { "row": "A", "type": "standard" },
    { "row": "B", "type": "standard" },
    { "row": "C", "type": "premium" },
    { "row": "D", "type": "premium" },
    { "row": "E", "type": "vip" }
  ]
}
```

### 2) Get All Halls

- Method: `GET`
- URL: `/halls`
- Protection: public

### 3) Get Hall By ID

- Method: `GET`
- URL: `/halls/:id`
- Protection: public
- Validation: `hallParamsSchema`

### 4) Update Hall (Admin only)

- Method: `PATCH`
- URL: `/halls/:id`
- Protection: `auth + isAdmin`
- Validation: `updateHallSchema`

Notes:

- Update is partial
- At least one field is required in request body

### 5) Delete Hall (Admin only)

- Method: `DELETE`
- URL: `/halls/:id`
- Protection: `auth + isAdmin`
- Validation: `hallParamsSchema`

### 6) Halls Overview (Hall + Movie + Seats)

- Method: `GET`
- URL: `/halls/overview`
- Protection: public

This endpoint returns:

- Hall data
- `totalSeats` per hall (`rows * cols`)
- `currentMovie` (first showtime movie in the selected view)
- `showTimes` with movie details and `availableSeats`

## Overview Query Options

The overview endpoint supports query param `view`:

- `upcoming` (default): upcoming scheduled showtimes only
- `current`: currently running showtimes only
- `all`: all showtimes

Examples:

- `/halls/overview`
- `/halls/overview?view=upcoming`
- `/halls/overview?view=current`
- `/halls/overview?view=all`

## Validation Schemas Added

File: `validations/hall.validation.js`

- `hallParamsSchema`
- `createHallSchema`
- `updateHallSchema`

## Files Updated

- `controllers/hall.controller.js`
- `routes/hall.routes.js`
- `validations/hall.validation.js`
