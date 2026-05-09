const { Hall } = require("../models");
const {
  normalizeSeatLayout,
  validateMergedHallPayload,
} = require("../validations/hall.validation");

const createHall = async (req, res, next) => {
  try {
    const hall = await Hall.create(req.body);
    res.status(201).json(hall);
  } catch (error) {
    next(error);
  }
};

const getHalls = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
    const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'rows', 'cols'];
    const sortBy = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = (req.query.sortOrder || 'desc').toString().toLowerCase() === 'asc' ? 1 : -1;

    const total = await Hall.countDocuments();
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const halls = await Hall.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      data: halls,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      sorting: {
        sortBy,
        sortOrder: sortOrder === 1 ? 'asc' : 'desc',
      },
    });
  } catch (error) {
    next(error);
  }
};

const getHallById = async (req, res, next) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    res.status(200).json(hall);
  } catch (error) {
    next(error);
  }
};

const updateHall = async (req, res, next) => {
  try {
    const existingHall = await Hall.findById(req.params.id).lean();

    if (!existingHall) {
      return res.status(404).json({ message: "Hall not found" });
    }

    const mergedPayload = {
      ...existingHall,
      ...req.body,
      seatLayout:
        req.body.seatLayout !== undefined
          ? normalizeSeatLayout(req.body.seatLayout)
          : existingHall.seatLayout,
    };
    const validationResult = validateMergedHallPayload(mergedPayload);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.issues,
      });
    }

    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(hall);
  } catch (error) {
    next(error);
  }
};

const deleteHall = async (req, res, next) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);

    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    res.status(200).json({ message: 'Hall deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHall,
  getHalls,
  getHallById,
  updateHall,
  deleteHall,
};
