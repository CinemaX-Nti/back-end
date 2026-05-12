const { RestaurantItem } = require("../models");
const {
  getPaginationParams,
  formatPaginatedResponse,
  isValidObjectId,
} = require("../utils/movieHelpers");

const ALLOWED_RESTAURANT_FIELDS = [
  "name",
  "description",
  "category",
  "price",
  "isAvailable",
];

const sanitizeRestaurantItemBody = (body) => {
  const sanitized = {};

  ALLOWED_RESTAURANT_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      sanitized[field] = body[field];
    }
  });

  return sanitized;
};

const createRestaurantItem = async (req, res, next) => {
  try {
    const item = await RestaurantItem.create(sanitizeRestaurantItemBody(req.body));
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

    if (search?.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } },
      ];
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

const getRestaurantItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid restaurant item ID" });
    }

    const item = await RestaurantItem.findById(id).lean();

    if (!item) {
      return res.status(404).json({ message: "Restaurant item not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

const updateRestaurantItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid restaurant item ID" });
    }

    const updates = sanitizeRestaurantItemBody(req.body);

    const item = await RestaurantItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Restaurant item not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

const deleteRestaurantItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid restaurant item ID" });
    }

    const item = await RestaurantItem.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ message: "Restaurant item not found" });
    }

    return res.status(200).json({ message: "Restaurant item deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRestaurantItem,
  getRestaurantMenu,
  getRestaurantItemById,
  updateRestaurantItem,
  deleteRestaurantItem,
};
