# Cinema Booking System Overview

## Purpose

This project is a backend system for managing a cinema booking platform.
It allows users to browse movies, check available showtimes, select seats, create bookings, and include food selections inside those bookings.

The current project is built with:

- Node.js
- Express.js
- MongoDB
- Mongoose

## Main Goals

- Build a clean backend foundation for a team project
- Follow MVC architecture for clarity and maintainability
- Keep the code readable for junior developers
- Make it easy to divide work across team members

## Core Modules

- `User`: customer and admin accounts
- `Movie`: movie details shown in the cinema
- `Hall`: cinema hall layout
- `ShowTime`: movie schedule in a specific hall
- `Seat`: seats generated per showtime
- `Booking`: selected seats, show details, payment status, and food items linked to a user
- `RestaurantItem`: cinema menu items selected during booking

## Business Rule Highlights

- Seats are not shared between showtimes
- Each showtime creates its own seat map based on hall rows and columns
- Bookings should eventually lock and update seat status
- Food items are stored as snapshots inside bookings after checkout
