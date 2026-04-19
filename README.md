# Cinema Booking System Backend

This repository is a team-ready backend starter for a Cinema Booking System using Node.js, Express, MongoDB, and Mongoose.

It already includes:

- MVC folder structure
- MongoDB connection setup
- Mongoose models
- Express app and routes
- seat generation utility for each showtime
- starter documentation for architecture, workflow, and team planning

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose

## Project Structure

```text
config/
controllers/
docs/
models/
routes/
utils/
app.js
server.js
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Copy `.env.example` values into a local `.env` file.

Example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/cinema_booking_system
JWT_SECRET=replace_with_a_secure_secret
```

### 3. Run the server

Development:

```bash
npm run dev
```

Production-style:

```bash
npm start
```

## Available API Groups

- `/api/users`
- `/api/movies`
- `/api/halls`
- `/api/showtimes`
- `/api/bookings`
- `/api/orders`

Seat routes:

- `GET /api/showtimes/:showTimeId/seats`
- `POST /api/showtimes/:showTimeId/seats/seed`

## Main Models

- User
- Movie
- Hall
- ShowTime
- Seat
- Booking
- Order

## Important Current Notes

- Seats are unique per showtime
- Seat indexing is added for `showTimeId + status`
- Booking logic still needs full seat validation and seat status updates
- Authentication is not implemented yet

## Team Documentation

- [Project Overview](./docs/PROJECT_OVERVIEW.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Workflow](./docs/WORKFLOW.md)
- [Team Plan](./docs/TEAM_PLAN.md)

## Recommended Next Steps

1. Add authentication and password hashing
2. Add validation middleware
3. Implement booking transaction logic
4. Add cancellation flow
5. Add testing
