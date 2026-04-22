const { Hall, ShowTime } = require("../models");

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
    const halls = await Hall.find().sort({ createdAt: -1 });
    res.status(200).json(halls);
  } catch (error) {
    next(error);
  }
};

const getHallsOverview = async (req, res, next) => {
  try {
    const view = (req.query.view || "upcoming").toString().toLowerCase();
    const halls = await Hall.find().sort({ createdAt: -1 }).lean();

    if (halls.length === 0) {
      return res.status(200).json([]);
    }

    const hallIds = halls.map((hall) => hall._id);
    const now = new Date();
    const showTimeQuery = { hallId: { $in: hallIds } };

    if (view === "upcoming") {
      showTimeQuery.startTime = { $gte: now };
      showTimeQuery.status = "scheduled";
    } else if (view === "current") {
      showTimeQuery.startTime = { $lte: now };
      showTimeQuery.endTime = { $gte: now };
      showTimeQuery.status = "running";
    }

    const showTimes = await ShowTime.find(showTimeQuery)
      .populate("movieId", "title posterUrl duration status")
      .sort({ startTime: 1 })
      .lean();

    const showTimesByHall = showTimes.reduce((accumulator, showTime) => {
      const hallId = showTime.hallId.toString();

      if (!accumulator[hallId]) {
        accumulator[hallId] = [];
      }

      accumulator[hallId].push(showTime);
      return accumulator;
    }, {});

    const overview = halls.map((hall) => {
      const hallShowTimes = showTimesByHall[hall._id.toString()] || [];
      const totalSeats = hall.rows * hall.cols;
      const currentShowTime = hallShowTimes[0] || null;

      return {
        ...hall,
        totalSeats,
        view,
        currentMovie: currentShowTime
          ? {
              _id: currentShowTime.movieId?._id || null,
              title: currentShowTime.movieId?.title || null,
            }
          : null,
        showTimes: hallShowTimes.map((showTime) => ({
          _id: showTime._id,
          startTime: showTime.startTime,
          endTime: showTime.endTime,
          status: showTime.status,
          format: showTime.format,
          availableSeats: showTime.availableSeats,
          movie: showTime.movieId
            ? {
                _id: showTime.movieId._id,
                title: showTime.movieId.title,
                posterUrl: showTime.movieId.posterUrl,
                duration: showTime.movieId.duration,
                status: showTime.movieId.status,
              }
            : null,
        })),
      };
    });

    return res.status(200).json(overview);
  } catch (error) {
    next(error);
  }
};

const getHallById = async (req, res, next) => {
  try {
    const hall = await Hall.findById(req.params.id);

    if (!hall) {
      return res.status(404).json({ message: "Hall not found" });
    }

    res.status(200).json(hall);
  } catch (error) {
    next(error);
  }
};

const updateHall = async (req, res, next) => {
  try {
    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hall) {
      return res.status(404).json({ message: "Hall not found" });
    }

    res.status(200).json(hall);
  } catch (error) {
    next(error);
  }
};

const deleteHall = async (req, res, next) => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);

    if (!hall) {
      return res.status(404).json({ message: "Hall not found" });
    }

    res.status(200).json({ message: "Hall deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHall,
  getHalls,
  getHallsOverview,
  getHallById,
  updateHall,
  deleteHall,
};
