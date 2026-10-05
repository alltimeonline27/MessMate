const validateRequest = (req, res, next) => {
  // Request validation পরে এখানে যোগ করব
  next();
};

module.exports = {
  validateRequest,
};