const calculateMealRate = (totalExpense, totalMeals) => {
  if (totalMeals === 0) {
    return 0;
  }

  return totalExpense / totalMeals;
};

module.exports = calculateMealRate;