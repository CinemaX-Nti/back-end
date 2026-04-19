const { Hall } = require('../models');

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

module.exports = {
  createHall,
  getHalls,
};
