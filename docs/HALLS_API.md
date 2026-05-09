# Halls API Documentation

## What Was Added

The `halls` module now supports:

- Full CRUD operations
- Request validation using `zod`
- Auth and role protection for admin actions
- Paginated hall listing with default sorting

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
    { "rows": ["C", "D"], "type": "premium" },
    { "rows": ["E"], "type": "vip" }
  ],
  "availability": true
}
```

Notes:

- `seatLayout` now supports grouped row assignment
- Any row not listed in `seatLayout` defaults to `standard`
- Backward-compatible flat format is still accepted:

```json
[
  { "row": "A", "type": "standard" },
  { "row": "B", "type": "standard" },
  { "row": "C", "type": "premium" }
]
```

### 2) Get All Halls

- Method: `GET`
- URL: `/halls`
- Protection: `auth`

Query params:

- `page` (default: `1`)
- `limit` (default: `10`, max: `100`)
- `sortBy` (default: `createdAt`)
  - allowed: `createdAt`, `updatedAt`, `name`, `rows`, `cols`
- `sortOrder` (default: `desc`)
  - allowed: `asc`, `desc`

This endpoint returns:

- paginated hall data
- pagination metadata
- sorting metadata

Example:

- `/halls`
- `/halls?page=2&limit=5`
- `/halls?sortBy=name&sortOrder=asc`
- `/halls?page=1&limit=10&sortBy=createdAt&sortOrder=desc`

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

## Validation Schemas Added

File: `validations/hall.validation.js`

- `hallParamsSchema`
- `createHallSchema`
- `updateHallSchema`

## Files Updated

- `controllers/hall.controller.js`
- `routes/hall.routes.js`
- `validations/hall.validation.js`
