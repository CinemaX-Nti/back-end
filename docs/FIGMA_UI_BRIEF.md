# Cinema Booking UI Brief For Figma AI

## Goal

This backend already supports the main cinema booking flows, but there is no UI yet.
Use this document to explain the product to Figma AI so it can generate the right pages, layouts, and components.

The product has 2 sides:

- Customer app
- Admin dashboard

The cinema system is built around these backend modules:

- User accounts and authentication
- Movies
- Halls
- Showtimes
- Seats
- Bookings
- Restaurant menu items

## Product Summary

This is a cinema booking platform where users can create an account, sign in, browse movies, view showtimes, pick seats, add food items like popcorn and drinks, and complete a booking. Admins manage movies, halls, showtimes, restaurant items, bookings, and users.

The UI should feel modern, premium, and cinematic. It should not look like a generic e-commerce app. Use a movie-theater atmosphere: large posters, strong hierarchy, clear seat states, bold time chips, ticket summaries, and food upsell cards.

## Roles

### 1. Customer

Customer can:

- Sign up with email and password
- Sign in with email or Google
- Confirm email with OTP
- Reset password with OTP
- View and edit profile
- Request account deletion with OTP
- Browse movies
- Filter movies by genre, status, language, rating, and duration
- View movie details
- View showtimes for a selected movie
- View a seat map for a showtime
- Select seats
- Add restaurant items to the booking
- Review booking summary
- View booking history

### 2. Admin

Admin can:

- View all users
- Create, edit, soft-delete, restore, and bulk-delete movies
- View deleted movies
- View movie stats and movie-specific showtimes
- Create, list, edit, and delete halls
- Create and list showtimes
- Seed seats for a showtime
- Create and list restaurant menu items
- View bookings with filters

## Backend-Supported Features

Design the UI around these real backend capabilities.

### Authentication

- Sign up with `firstName`, `lastName`, `email`, `password`, optional `phoneNumber`, optional `dateOfBirth`
- Sign in with `email` and `password`
- Sign in with Google
- Confirm email using `email + otp`
- Resend confirmation OTP
- Forgot password using `email`
- Reset password using `email + otp + newPassword`
- Update profile
- Update password
- Request delete profile OTP
- Delete profile using OTP

### Movies

- List movies
- Search movies by title or description
- Filter movies by genre, status, language, rating range, and duration range
- Sort popular movies by rating
- View single movie
- View showtimes for one movie
- View movie booking stats
- Admin can create, update, delete, restore, and bulk-delete movies

Movie fields:

- Title
- Description
- Duration
- Genre
- Language
- Release date
- Trailer URL
- Poster URL
- Rating
- Status: `now_showing`, `coming_soon`, `archived`

### Halls

- List halls with pagination and sorting
- View one hall
- Admin can create, edit, and delete a hall

Hall fields:

- Name
- Number of rows
- Number of columns
- Availability
- Seat layout by row type

Seat row types:

- Standard
- Premium
- VIP

### Showtimes

- List all showtimes
- Create showtime
- View available seat count for each showtime
- View seats for one showtime
- Seed seats for a showtime based on hall layout

Showtime fields:

- Movie
- Hall
- Start time
- End time
- Pricing for standard, premium, and VIP seats
- Format: `2D`, `3D`, `IMAX`
- Status: `scheduled`, `running`, `finished`, `cancelled`
- Available seats

### Seats

Each showtime has its own seat map. Seats are not shared across showtimes.

Seat fields:

- Seat number like `A1`, `A2`, `B5`
- Status: `available`, `reserved`, `booked`
- Type: `standard`, `premium`, `vip`
- Price

### Restaurant Menu

- List menu items with pagination
- Filter by category
- Filter by availability
- Sort by name, category, price, created date
- Admin can create menu items

Menu item fields:

- Name
- Description
- Category
- Price
- Availability

### Bookings

- Create booking
- List bookings with filters and pagination

Booking includes:

- User
- Movie
- Hall
- Showtime
- Seats
- Food items
- Ticket total
- Food total
- Total amount
- Booking status: `pending`, `confirmed`, `cancelled`
- Payment status: `pending`, `paid`, `failed`, `refunded`

## Pages We Should Build

Build the customer app first, then the admin dashboard.

## Customer App Pages

### 1. Welcome / Landing Page

Purpose:
Introduce the cinema product and direct users to sign in, sign up, or start browsing movies.

Main sections:

- Hero banner with featured movie poster or cinematic visual
- Search bar for movies
- CTA buttons for `Browse Movies`, `Sign In`, and `Create Account`
- Highlight cards for easy booking, premium seats, and food ordering

Figma AI prompt:

`Design a premium cinema booking landing page for a web and mobile app. The page should feel cinematic and modern, with a large hero banner, featured movie poster area, strong search bar, clear buttons for browse movies, sign in, and create account, plus promotional cards for premium seats, easy online booking, and snacks. Use a dark elegant theater mood with warm gold or red accents, bold typography, and card-based movie presentation.`

### 2. Sign Up Page

Purpose:
Allow new users to create an account.

Fields:

- First name
- Last name
- Email
- Password
- Phone number
- Date of birth

Actions:

- Create account
- Continue with Google
- Link to sign in

Figma AI prompt:

`Design a sign up page for a cinema booking app. Include inputs for first name, last name, email, password, phone number, and date of birth. Add a primary create account button, a continue with Google button, and a sign in link. The layout should feel polished, trustworthy, and easy to scan, with cinematic branding but clean form UX.`

### 3. Sign In Page

Purpose:
Allow returning users to log in with email or Google.

Fields:

- Email
- Password

Actions:

- Sign in
- Continue with Google
- Forgot password
- Go to sign up

Figma AI prompt:

`Design a modern sign in page for a cinema booking platform. Include email and password fields, sign in button, Google sign in button, forgot password link, and link to create account. The design should look premium and simple, with movie brand styling and strong spacing.`

### 4. Email Confirmation OTP Page

Purpose:
Let the user enter a one-time code to confirm their email.

Fields:

- Email
- OTP code

Actions:

- Confirm email
- Resend code

Figma AI prompt:

`Design an email verification page for a cinema app with a clean OTP entry experience. Include email display or input, 6-digit OTP input boxes, confirm button, resend code link, helpful countdown or message state, and friendly security guidance. Keep the visual style elegant and aligned with a premium cinema brand.`

### 5. Forgot Password Page

Purpose:
Collect the email to send a password reset OTP.

Fields:

- Email

Actions:

- Send reset code

Figma AI prompt:

`Design a forgot password page for a movie booking app. Include a simple email input, send reset code button, helper text explaining that an OTP will be sent by email, and a link back to sign in. Make it clear and reassuring.`

### 6. Reset Password Page

Purpose:
Let users reset password with email, OTP, and new password.

Fields:

- Email
- OTP code
- New password

Actions:

- Reset password

Figma AI prompt:

`Design a reset password page for a cinema booking app with email input, OTP input, and new password input. Use clear validation-friendly layout, secure visual cues, and a strong reset password button.`

### 7. Movies Listing Page

Purpose:
Show all movies and allow discovery through search and filters.

Main content:

- Search bar
- Filter panel
- Movie cards
- Tabs or chips for `Now Showing`, `Coming Soon`, `Archived`
- Popular sorting option

Filters:

- Genre
- Language
- Rating range
- Duration range

Movie card content:

- Poster
- Title
- Genre
- Rating
- Duration
- Status
- CTA: `View Details`

Figma AI prompt:

`Design a movie browsing page for a cinema booking platform. Include a strong search bar, sidebar or top filter controls for genre, language, rating range, duration range, and movie status. Show movies as rich poster cards with title, genre, duration, rating, status badges, and a view details button. The page should feel like a premium streaming and ticketing hybrid, optimized for both desktop and mobile.`

### 8. Movie Details Page

Purpose:
Show full details for one movie and drive the user toward selecting a showtime.

Main content:

- Large poster
- Title
- Description
- Genre tags
- Duration
- Language
- Release date
- Rating
- Trailer button
- Status badge
- Showtime section

Actions:

- Watch trailer
- Select showtime

Figma AI prompt:

`Design a movie details page for a cinema booking app. Show a large poster, movie title, rich description, genre chips, duration, language, release date, rating, trailer button, and status badge. The lower section should highlight available showtimes with clear date and time chips and a call to action to book seats. Keep it visually dramatic and easy to act on.`

### 9. Showtimes Selection Page

Purpose:
Let the user compare available showtimes for a movie.

Showtime card content:

- Date
- Start time
- End time
- Hall name
- Format such as 2D, 3D, or IMAX
- Status
- Available seats
- Starting price or pricing summary

Actions:

- View seats

Figma AI prompt:

`Design a showtimes selection page for a cinema app. Present showtimes as clean cards or chips with date, start time, end time, hall name, format, status, available seats, and pricing summary. Make it easy to compare options and proceed to seat selection.`

### 10. Seat Selection Page

Purpose:
Allow the user to choose seats for a specific showtime.

Main content:

- Movie summary
- Hall name
- Showtime
- Seat map
- Screen label at top
- Legend for available, booked, reserved seats
- Legend for standard, premium, VIP pricing
- Booking summary sidebar or bottom sheet

Actions:

- Select or deselect seats
- Continue to snacks

Figma AI prompt:

`Design a seat selection page for a cinema booking app. Include a theater screen indicator, a realistic seat map, clear legends for available, reserved, and booked seats, and color or style differences for standard, premium, and VIP rows. Show a live booking summary with selected seats, ticket pricing, and a continue button. Make the experience feel exciting, premium, and easy to understand on both desktop and mobile.`

### 11. Food Add-ons Page

Purpose:
Allow users to add restaurant items before checkout.

Main content:

- Category filters
- Snack and drink cards
- Quantity stepper
- Price
- Availability state
- Sticky summary of selected seats and running total

Actions:

- Add item
- Change quantity
- Continue to booking summary

Figma AI prompt:

`Design a cinema snacks add-ons page that appears after seat selection. Show food and drink cards with image area, item name, description, category, price, availability badge, and quantity controls. Keep a sticky order summary with selected seats, ticket total, food total, and continue button. The page should feel playful but still premium.`

### 12. Booking Summary / Checkout Page

Purpose:
Show the final review before booking is submitted.

Main content:

- Movie info
- Hall
- Showtime
- Selected seats
- Food items with quantity and subtotal
- Ticket total
- Food total
- Grand total
- Booking status area
- Payment status placeholder

Actions:

- Confirm booking

Figma AI prompt:

`Design a booking summary page for a cinema app. Show a clean final review of movie, hall, showtime, selected seats, snack items, ticket total, food total, and total amount. Include a strong confirm booking button and a compact ticket-style summary design. Keep it premium and conversion-focused.`

### 13. Booking Success / Digital Ticket Page

Purpose:
Show successful reservation details in a shareable ticket-style layout.

Main content:

- Success state
- Movie title
- Hall
- Showtime
- Seats
- Food summary
- Booking status
- Payment status
- QR or barcode placeholder

Figma AI prompt:

`Design a booking success page for a cinema app with a premium digital ticket look. Show movie title, hall, showtime, seats, food order summary, booking status, payment status, and a QR code placeholder. The design should feel celebratory and polished, like a real e-ticket.`

### 14. Profile Page

Purpose:
Allow the user to view and update account info.

Fields and sections:

- Full name
- Email
- Phone number
- Date of birth
- Email confirmation state
- Change password section
- Delete profile section

Actions:

- Save profile changes
- Update password
- Request delete OTP

Figma AI prompt:

`Design a user profile and account settings page for a cinema booking platform. Include sections for personal information, email status, phone number, date of birth, change password, and delete account. The layout should feel organized, secure, and easy to manage.`

### 15. Delete Account OTP Confirmation Page

Purpose:
Confirm account deletion with OTP.

Fields:

- OTP code

Actions:

- Delete account permanently
- Cancel

Figma AI prompt:

`Design a secure delete account confirmation page for a cinema app. Include a warning message, OTP input, permanent delete button, and cancel action. Use a high-trust layout with clear danger styling but still consistent with the brand.`

### 16. Booking History Page

Purpose:
Let users review past and current bookings.

Booking card content:

- Movie title
- Poster thumbnail
- Date and time
- Hall
- Seats
- Booking status
- Payment status
- Total amount

Figma AI prompt:

`Design a booking history page for a cinema app. Show bookings as elegant cards or rows with poster thumbnail, movie title, showtime, hall, seats, booking status, payment status, and total amount. Include filters for current and past bookings if useful.`

## Admin Dashboard Pages

### 1. Admin Dashboard Home

Purpose:
Give admins a quick summary of cinema operations.

Main widgets:

- Total movies
- Total bookings
- Revenue summary
- Active showtimes
- Recent bookings
- Quick links to movies, halls, showtimes, bookings, menu, and users

Figma AI prompt:

`Design an admin dashboard for a cinema booking system. Use a professional layout with KPI cards for movies, bookings, revenue, and active showtimes, plus recent bookings table and quick action panels. The design should feel modern, efficient, and suitable for operations management.`

### 2. Movies Management Page

Purpose:
Manage movie catalog.

Main content:

- Table or card list of movies
- Search
- Filters
- Status badges
- Bulk selection
- Actions for create, edit, delete, restore, and view stats

Figma AI prompt:

`Design an admin movies management page for a cinema platform. Include a searchable, filterable table or card grid of movies with poster thumbnail, title, genre, rating, status, created by, and actions for edit, delete, restore, bulk delete, and stats. Keep the interface efficient but visually polished.`

### 3. Create / Edit Movie Form

Purpose:
Create or update movie records.

Fields:

- Title
- Description
- Duration
- Genres
- Language
- Release date
- Trailer URL
- Poster URL
- Rating
- Status

Figma AI prompt:

`Design an admin movie form page for creating and editing movies. Include fields for title, description, duration, genres, language, release date, trailer URL, poster URL, rating, and status. Make the form structured, image-friendly, and easy for staff to complete.`

### 4. Deleted Movies Page

Purpose:
Show soft-deleted movies and allow restore.

Main content:

- Deleted movies list
- Restore action
- Deleted status presentation

Figma AI prompt:

`Design an admin page for deleted movies in a cinema management dashboard. Show a clean list of soft-deleted movie records with poster, title, deleted state, and restore action.`

### 5. Movie Stats Page

Purpose:
Show performance insights for one movie.

Main content:

- Movie summary header
- Total showtimes
- Total bookings
- Total revenue
- Average bookings per show
- Related showtimes list

Figma AI prompt:

`Design a movie analytics page inside a cinema admin dashboard. Show a movie header with poster and title, KPI cards for total showtimes, total bookings, total revenue, and average bookings per show, plus a related showtimes section. Keep it professional and easy to scan.`

### 6. Halls Management Page

Purpose:
Manage cinema halls.

Main content:

- Halls table or cards
- Sort by name, rows, columns, created date, updated date
- Status for availability
- Actions to create, edit, delete, and inspect layout

Figma AI prompt:

`Design an admin halls management page for a cinema system. Show halls with name, rows, columns, seat capacity, availability status, and actions for create, edit, delete, and view layout. Use a clear operations-focused design.`

### 7. Create / Edit Hall Form

Purpose:
Allow admins to define hall structure and seat row types.

Fields:

- Hall name
- Number of rows
- Number of columns
- Availability toggle
- Seat layout builder mapping rows to standard, premium, or VIP

Figma AI prompt:

`Design an admin hall creation page for a cinema platform. Include inputs for hall name, total rows, total columns, availability toggle, and a smart seat layout builder where row labels can be assigned to standard, premium, or VIP seat types. The page should feel technical but easy to use.`

### 8. Showtimes Management Page

Purpose:
List and create showtimes.

Main content:

- Showtime list
- Movie
- Hall
- Start time
- End time
- Format
- Status
- Available seats
- Pricing breakdown
- Action to seed seats

Figma AI prompt:

`Design an admin showtimes management page for a cinema booking system. Show a structured table or card list with movie, hall, start time, end time, format, status, available seats, and pricing for standard, premium, and VIP. Include primary actions to create showtime and seed seats.`

### 9. Create Showtime Form

Purpose:
Allow admins to schedule a movie in a hall.

Fields:

- Movie selector
- Hall selector
- Start time
- End time
- Format
- Status
- Pricing for standard, premium, and VIP

Figma AI prompt:

`Design an admin create showtime form for a cinema system. Include selectors for movie and hall, date and time pickers for start and end time, format options like 2D, 3D, IMAX, status selection, and pricing inputs for standard, premium, and VIP seats.`

### 10. Seat Map Admin View

Purpose:
Inspect seats for one showtime and understand seat states.

Main content:

- Showtime summary
- Seat map
- Count of available, reserved, and booked seats
- Action to seed seats if not generated

Figma AI prompt:

`Design an admin seat map page for a specific cinema showtime. Show the movie, hall, time, seat grid, and seat state counts for available, reserved, and booked. Include an action for generating seats if they do not exist yet.`

### 11. Restaurant Menu Management Page

Purpose:
Manage snack and drink items.

Main content:

- Search and filters
- Category
- Price
- Availability
- Create new item button

Figma AI prompt:

`Design an admin restaurant menu management page for a cinema app. Include a searchable and filterable list of snack and drink items with category, price, availability, and create item action. The layout should feel organized and lightweight.`

### 12. Create Restaurant Item Form

Purpose:
Create a snack or drink item.

Fields:

- Name
- Description
- Category
- Price
- Availability

Figma AI prompt:

`Design an admin form for adding cinema snack and drink items. Include fields for name, description, category, price, and availability status. Keep the form compact and practical.`

### 13. Bookings Management Page

Purpose:
Allow admins to inspect bookings and filter them.

Filters:

- User
- Showtime
- Hall
- Movie
- Booking status
- Payment status
- Film name

Booking row content:

- User
- Movie
- Hall
- Showtime
- Seats
- Food total
- Ticket total
- Total amount
- Booking status
- Payment status

Figma AI prompt:

`Design an admin bookings management page for a cinema booking system. Include advanced filters for user, showtime, hall, movie, booking status, payment status, and movie name. Show bookings in a data-rich table with seats, food total, ticket total, total amount, and status badges.`

### 14. Users Management Page

Purpose:
Allow admins to view all users.

User row content:

- Name
- Email
- Role
- Provider
- Confirmation state
- Phone number
- Created date

Figma AI prompt:

`Design an admin users management page for a cinema platform. Show a clean table of users with name, email, role, login provider, email confirmation state, phone number, and created date. Keep it simple, secure, and administrative.`

## Shared Components Figma Should Generate

Ask Figma AI to reuse these components across screens:

- Header and navigation
- Movie cards
- Showtime chips
- Seat component with status variants
- Status badges
- OTP input component
- Search bar
- Filter drawer or sidebar
- Booking summary card
- Food item card
- Admin table
- KPI cards
- Modal for dangerous actions like delete or restore

## UX States That Must Exist

Do not design only the happy path. The UI needs states for:

- Empty movie list
- Empty bookings
- No showtimes available
- No seats generated yet
- Seat unavailable
- Invalid OTP
- Email not confirmed
- Loading state
- Success state
- Error state
- Soft-deleted movie state
- Unavailable menu item state

## Important Notes For Design Scope

These pages are strongly supported by the backend and should be built first:

- Authentication pages
- Movies browsing pages
- Movie details and showtimes pages
- Seat selection page
- Food add-ons page
- Booking summary and success page
- Profile and booking history pages
- Admin dashboard for movies, halls, showtimes, bookings, menu, and users

These areas have backend limitations and should be treated carefully in design:

- There is no real payment integration yet, so payment UI should be placeholder-level
- There is no booking cancellation endpoint yet
- There is no showtime edit or delete endpoint yet, only create and list
- There is no restaurant item edit or delete endpoint yet, only create and list

## Master Prompt For Figma AI

Use this if you want Figma AI to generate the whole product structure at once:

`Design a complete cinema booking product with two sides: a customer-facing app and an admin dashboard. The customer app should include landing page, sign up, sign in, Google login, email OTP confirmation, forgot password, reset password, movies listing with filters and search, movie details, showtimes selection, seat selection with seat status and seat type legend, snacks add-ons page, booking summary, booking success digital ticket, profile settings, delete account OTP confirmation, and booking history. The admin side should include dashboard home, movies management, create and edit movie form, deleted movies page, movie stats page, halls management, create and edit hall form with seat row type builder, showtimes management, create showtime form, seat map admin view, restaurant menu management, create menu item form, bookings management, and users management. The visual style should feel premium, cinematic, modern, and elegant, with strong movie poster presentation, rich card layouts, ticket-inspired details, and clear operational dashboards. Make layouts responsive for desktop and mobile where relevant.`
