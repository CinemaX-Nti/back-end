# Architecture

## Pattern

The project uses MVC:

- `models/` stores Mongoose schemas and database rules
- `controllers/` handles request logic and responses
- `routes/` maps API endpoints to controller functions
- `config/` stores shared configuration like MongoDB connection
- `utils/` stores reusable helper logic such as seat generation

## Current Structure

```text
back-end/
|-- config/
|   `-- db.js
|-- controllers/
|   |-- booking.controller.js
|   |-- hall.controller.js
|   |-- movie.controller.js
|   |-- order.controller.js
|   |-- seat.controller.js
|   |-- showTime.controller.js
|   `-- user.controller.js
|-- docs/
|   |-- ARCHITECTURE.md
|   |-- PROJECT_OVERVIEW.md
|   |-- TEAM_PLAN.md
|   `-- WORKFLOW.md
|-- models/
|   |-- booking.model.js
|   |-- hall.model.js
|   |-- index.js
|   |-- movie.model.js
|   |-- order.model.js
|   |-- seat.model.js
|   |-- showTime.model.js
|   `-- user.model.js
|-- routes/
|   |-- booking.routes.js
|   |-- hall.routes.js
|   |-- index.js
|   |-- movie.routes.js
|   |-- order.routes.js
|   |-- showTime.routes.js
|   `-- user.routes.js
|-- utils/
|   `-- seedSeats.js
|-- .env.example
|-- .gitignore
|-- app.js
|-- package.json
`-- server.js
```

## Request Flow

1. A client sends an HTTP request to the Express server.
2. The request enters `app.js`.
3. `app.js` forwards the request to the matching route in `routes/`.
4. The route calls the related controller method.
5. The controller uses one or more Mongoose models.
6. MongoDB returns data or saves data.
7. The controller sends the final JSON response back to the client.

## Recommended Next Layers

For a larger team project, these folders should be added next:

- `middlewares/` for auth, validation, and error wrappers
- `services/` for business logic such as booking transactions
- `validators/` for request validation rules
- `constants/` for enums and shared settings
- `tests/` for unit and integration tests

## Important Design Notes

- Booking logic should move into a service layer once the team starts implementing seat locking
- Authentication should be isolated from movie and booking logic
- Admin actions should be protected from normal user routes
