const validateMeal = (req, res, next) => {
  const { date, mealType, quantity } = req.body;

  if (!date || !mealType || !quantity) {
    return res.status(400).json({
      message: "Date, meal type and quantity are required",
    });
  }

  if (!["lunch", "dinner"].includes(mealType)) {
    return res.status(400).json({
      message: "Meal type must be lunch or dinner",
    });
  }

  next();
};

module.exports = {
  validateMeal,
};