# Cinema Booking System Overview

## Purpose

This project is a backend system for managing a cinema booking platform.
It allows users to browse movies, check available showtimes, select seats, create bookings, and attach food orders to those bookings.

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
- `Booking`: selected seats linked to a user
- `Order`: food items linked to a booking

## Business Rule Highlights

- Seats are not shared between showtimes
- Each showtime creates its own seat map based on hall rows and columns
- Bookings should eventually lock and update seat status
- Orders belong to bookings, not directly to users
