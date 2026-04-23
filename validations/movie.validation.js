const { z } = require("zod");

const { GENRES } = require("../utils/movieHelpers");

// Pagination limits
const PAGINATION_LIMITS = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 10,
};

const createMovieSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(200, "Title must not exceed 200 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description must not exceed 2000 characters"),
    duration: z
      .number()
      .min(1, "Duration must be at least 1 minute")
      .max(720, "Duration must not exceed 720 minutes (12 hours)")
      .positive(),
    genre: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Genre name cannot be empty")
          .transform((val) => {
            return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
          })
          .refine((val) => GENRES.includes(val), {
            message: "Invalid genre",
          }),
      )
      .min(1, "At least one genre is required")
      .max(10, "Maximum 10 genres allowed"),

    language: z.string().trim().min(1).optional(),
    releaseDate: z.coerce.date().optional(),
    trailerUrl: z
      .string()
      .url("Invalid trailer URL")
      .optional()
      .or(z.literal("")),
    posterUrl: z.string().url("Invalid poster URL"),
    rating: z
      .number()
      .min(0, "Rating must be at least 0")
      .max(10, "Rating must not exceed 10")
      .optional(),
    status: z.enum(["now_showing", "coming_soon", "archived"]).optional(),
  }),
});

const updateMovieSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(200, "Title must not exceed 200 characters")
        .optional(),
      description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(2000, "Description must not exceed 2000 characters")
        .optional(),
      duration: z
        .number()
        .min(1, "Duration must be at least 1 minute")
        .max(720, "Duration must not exceed 720 minutes (12 hours)")
        .positive()
        .optional(),
      genre: z
        .array(
          z.string().trim().min(1, "Genre name cannot be empty").toLowerCase(),
        )
        .min(1, "At least one genre is required")
        .max(10, "Maximum 10 genres allowed")
        .optional(),
      language: z.string().trim().min(1).optional(),
      releaseDate: z.coerce.date().optional(),
      trailerUrl: z
        .string()
        .url("Invalid trailer URL")
        .optional()
        .or(z.literal("")),
      posterUrl: z.string().url("Invalid poster URL").optional(),
      rating: z
        .number()
        .min(0, "Rating must be at least 0")
        .max(10, "Rating must not exceed 10")
        .optional(),
      status: z.enum(["now_showing", "coming_soon", "archived"]).optional(),
    })
    .strict("No unknown fields allowed"),
});

const filterMoviesSchema = z.object({
  query: z
    .object({
      genre: z.string().trim().optional(),
      status: z.enum(["now_showing", "coming_soon", "archived"]).optional(),
      language: z.string().trim().optional(),
      minRating: z.coerce
        .number()
        .min(0, "Minimum rating must be at least 0")
        .max(10, "Minimum rating must not exceed 10")
        .optional(),
      maxRating: z.coerce
        .number()
        .min(0, "Maximum rating must be at least 0")
        .max(10, "Maximum rating must not exceed 10")
        .optional(),
      minDuration: z.coerce
        .number()
        .int()
        .positive("Minimum duration must be positive")
        .optional(),
      maxDuration: z.coerce
        .number()
        .int()
        .positive("Maximum duration must be positive")
        .optional(),
      page: z.coerce.number().int().positive().default(1).optional(),
      limit: z.coerce
        .number()
        .int()
        .min(PAGINATION_LIMITS.MIN_LIMIT, "Limit must be at least 1")
        .max(
          PAGINATION_LIMITS.MAX_LIMIT,
          `Limit must not exceed ${PAGINATION_LIMITS.MAX_LIMIT}`,
        )
        .default(PAGINATION_LIMITS.DEFAULT_LIMIT)
        .optional(),
    })
    .refine(
      (data) => {
        if (data.minRating !== undefined && data.maxRating !== undefined) {
          return data.minRating <= data.maxRating;
        }
        return true;
      },
      {
        message: "Minimum rating must be less than or equal to maximum rating",
        path: ["minRating"],
      },
    )
    .refine(
      (data) => {
        if (data.minDuration !== undefined && data.maxDuration !== undefined) {
          return data.minDuration <= data.maxDuration;
        }
        return true;
      },
      {
        message:
          "Minimum duration must be less than or equal to maximum duration",
        path: ["minDuration"],
      },
    ),
});

const searchMoviesSchema = z.object({
  query: z.object({
    search: z
      .string()
      .trim()
      .min(1, "Search query required")
      .max(200, "Search query must not exceed 200 characters"),
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce
      .number()
      .int()
      .min(PAGINATION_LIMITS.MIN_LIMIT, "Limit must be at least 1")
      .max(
        PAGINATION_LIMITS.MAX_LIMIT,
        `Limit must not exceed ${PAGINATION_LIMITS.MAX_LIMIT}`,
      )
      .default(PAGINATION_LIMITS.DEFAULT_LIMIT)
      .optional(),
  }),
});

module.exports = {
  createMovieSchema,
  updateMovieSchema,
  filterMoviesSchema,
  searchMoviesSchema,
  PAGINATION_LIMITS,
};
