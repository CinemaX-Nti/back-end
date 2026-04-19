# Workflow And System Actions

## Main User Flow

### 1. Browse Movies

When it happens:

- when a user opens the app or requests the movies page

What should happen:

- frontend calls `GET /api/movies`
- backend returns all active movies
- user chooses a movie to continue

### 2. View Showtimes

When it happens:

- after the user selects a movie

What should happen:

- frontend requests showtimes for that movie
- backend returns matching showtimes with hall and movie details
- user chooses one showtime

Note:

- filtering by movie is not implemented yet, but should be added

### 3. Load Seats For A Showtime

When it happens:

- after the user chooses a showtime

What should happen:

- backend loads all seats linked to that showtime only
- each seat includes its current status
- frontend displays the seat map

Current route:

- `GET /api/showtimes/:showTimeId/seats`

### 4. Seed Seats For A Showtime

When it happens:

- after an admin creates a new showtime
- before customers can book seats for that showtime

What should happen:

- admin triggers seat generation
- backend reads the hall rows and columns
- backend generates seat numbers like `A1`, `A2`, `B1`
- backend inserts seats linked to that showtime

Current route:

- `POST /api/showtimes/:showTimeId/seats/seed`

Important rule:

- every showtime gets its own seats

### 5. Create Booking

When it happens:

- after a user selects one or more seats

What should happen ideally:

- backend validates the seat list
- backend checks all selected seats belong to the showtime
- backend checks all selected seats are available
- backend updates seat status
- backend creates the booking
- backend returns booking details

Current state:

- booking document creation exists
- seat validation and seat locking still need implementation

### 6. Add Food Order

When it happens:

- after booking is created or during checkout

What should happen:

- backend creates an order linked to the booking
- each item includes name, price, and quantity
- backend returns order details

### 7. Booking Cancellation

When it happens:

- if a user or admin cancels a booking

What should happen ideally:

- booking status should change
- related seats should be released if policy allows
- related payment and food order rules should be checked

Current state:

- not implemented yet

## Admin Flow

### Admin Creates Movie

- add title, description, and duration

### Admin Creates Hall

- add hall name, rows, and columns

### Admin Creates Showtime

- choose movie
- choose hall
- choose date and time

### Admin Seeds Showtime Seats

- trigger seat generation for that showtime

## Technical Workflow

### App Startup

1. `server.js` starts the server
2. `config/db.js` connects to MongoDB
3. `app.js` prepares middleware and routes
4. API becomes available

### API Request Handling

1. request enters Express
2. matching route is selected
3. controller runs business logic
4. model interacts with MongoDB
5. response is returned as JSON

## Risks To Watch

- double booking if seat updates are not atomic
- route growth without validation middleware
- weak security if passwords are stored before hashing is added
- admin routes staying public if auth is delayed too long
