# Team Plan

## Suggested Team Split

### 1. Authentication and Users

Responsible for:

- user registration
- login
- password hashing
- JWT authentication
- role-based access control

Suggested files:

- `models/user.model.js`
- `controllers/user.controller.js`
- `routes/user.routes.js`
- future `middlewares/auth.middleware.js`

### 2. Movies and Halls

Responsible for:

- creating and editing movies
- managing hall layout
- admin CRUD for cinema content

Suggested files:

- `models/movie.model.js`
- `models/hall.model.js`
- `controllers/movie.controller.js`
- `controllers/hall.controller.js`
- `routes/movie.routes.js`
- `routes/hall.routes.js`

### 3. Showtimes and Seats

Responsible for:

- creating showtimes
- generating seats from hall layout
- listing seats by showtime
- seat status updates

Suggested files:

- `models/showTime.model.js`
- `models/seat.model.js`
- `controllers/showTime.controller.js`
- `controllers/seat.controller.js`
- `routes/showTime.routes.js`
- `utils/seedSeats.js`

### 4. Bookings and Orders

Responsible for:

- creating bookings
- validating selected seats
- preventing double booking
- updating seat status
- attaching food orders to bookings

Suggested files:

- `models/booking.model.js`
- `models/order.model.js`
- `controllers/booking.controller.js`
- `controllers/order.controller.js`
- `routes/booking.routes.js`
- `routes/order.routes.js`

### 5. Quality and DevOps

Responsible for:

- environment setup
- code style rules
- API documentation
- test structure
- deployment preparation

Suggested areas:

- `README.md`
- `.env.example`
- `package.json`
- future `tests/`

## Topics To Discuss With The Team

- How users will authenticate
- Whether seat reservation needs timeout logic
- Whether booking and seat updates should use MongoDB transactions
- How admins will create movies, halls, and showtimes
- Whether food orders can be edited after booking
- What status flow seats should follow: `available -> reserved -> booked`
- Whether online payment will be added later
- What happens when a booking is cancelled
- Which routes are public and which are admin-only
- Whether pagination and filtering are needed for movies and showtimes
- Naming rules and branch strategy for the team
- Who owns testing and API documentation

## Recommended Delivery Order

1. Finish auth and user management
2. Finish admin CRUD for movie, hall, and showtime
3. Finish seat generation and seat listing
4. Finish booking transaction logic
5. Finish order flow
6. Add validation, auth middleware, and tests
