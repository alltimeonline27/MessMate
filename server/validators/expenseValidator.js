const validateExpense = (req, res, next) => {
  const { title, amount, category } = req.body;

  if (!title || amount === undefined || !category) {
    return res.status(400).json({
      message: "Title, amount and category are required",
    });
  }

  if (amount < 0) {
    return res.status(400).json({
      message: "Amount cannot be negative",
    });
  }

  next();
};

module.exports = {
  validateExpense,
};