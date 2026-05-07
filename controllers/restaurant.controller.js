const { RestaurantItem } = require("../models");
const {
  getPaginationParams,
  formatPaginatedResponse,
} = require("../utils/movieHelpers");

const createRestaurantItem = async (req, res, next) => {
  try {
    const item = await RestaurantItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const getRestaurantMenu = async (req, res, next) => {
  try {
    const { skip, limit, page } = getPaginationParams(req.query);
    const {
      search,
      category,
      isAvailable,
      sortBy = "category",
      sortOrder = "asc",
    } = req.query;

    const filter = {};

    if (category?.trim()) {
      filter.category = category.trim();
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === "true";
    } else {
      filter.isAvailable = true;
    }

    const allowedSortFields = ["name", "category", "price", "createdAt"];
    const normalizedSortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "category";
    const normalizedSortOrder = sortOrder === "desc" ? -1 : 1;

    const sort = {
      [normalizedSortField]: normalizedSortOrder,
      name: 1,
    };

    const [items, total] = await Promise.all([
      RestaurantItem.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      RestaurantItem.countDocuments(filter),
    ]);

    res.status(200).json(formatPaginatedResponse(items, total, page, limit));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRestaurantItem,
  getRestaurantMenu,
};
