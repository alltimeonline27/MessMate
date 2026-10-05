const Member = require("../models/Member");
const Meal = require("../models/Meal");
const Expense = require("../models/Expense");
const Bazar = require("../models/Bazar");
const Payment = require("../models/Payment");

const getDashboard = async (req, res) => {
  try {
    const messId = req.user.messId._id;

    // Current month date range
    const now = new Date();

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    );

    endDate.setHours(23, 59, 59, 999);

    // Today's date range
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    todayEnd.setHours(23, 59, 59, 999);

    // Active members
    const totalMembers = await Member.countDocuments({
      messId,
      status: "active",
    });

    // Current month meals
    const monthlyMeals = await Meal.find({
      messId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalMeals = monthlyMeals.reduce(
      (total, meal) =>
        total + Number(meal.quantity || 1),
      0
    );

    // Current month bazar
    const monthlyBazar = await Bazar.find({
      messId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalBazarExpense = monthlyBazar.reduce(
      (total, bazar) =>
        total + Number(bazar.amount || 0),
      0
    );

    // Current month other expenses
    const monthlyExpenses = await Expense.find({
      messId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalOtherExpense = monthlyExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

    const totalExpense =
      totalBazarExpense + totalOtherExpense;

    // Successful payments in current month
    const successfulPayments = await Payment.find({
      messId,
      status: "successful",
      paymentDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalMoneyReceived =
      successfulPayments.reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

    // Available balance
    const availableBalance =
      totalMoneyReceived - totalExpense;

    // Today's meals
    const todayMeals = await Meal.find({
      messId,
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    const todaysMeals = todayMeals.reduce(
      (total, meal) =>
        total + Number(meal.quantity || 1),
      0
    );

    // Today's bazar
    const todayBazar = await Bazar.find({
      messId,
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    const todaysBazarExpense =
      todayBazar.reduce(
        (total, bazar) =>
          total + Number(bazar.amount || 0),
        0
      );

    // Current meal rate
    const mealRate =
      totalMeals > 0
        ? totalExpense / totalMeals
        : 0;

    // Pending payment verification
    const pendingPaymentVerification =
      await Payment.countDocuments({
        messId,
        status: "pending_verification",
      });

    // Total paid
    const totalPaid = totalMoneyReceived;

    // Calculate total member bill
    const totalBill =
      totalMeals * mealRate;

    // Total due
    const totalDue = Math.max(
      totalBill - totalPaid,
      0
    );

    res.json({
      success: true,

      period: {
        startDate,
        endDate,
      },

      members: {
        totalMembers,
      },

      meals: {
        totalMeals,
        todaysMeals,
        mealRate: Number(
          mealRate.toFixed(2)
        ),
      },

      financial: {
        totalExpense: Number(
          totalExpense.toFixed(2)
        ),

        totalBazarExpense: Number(
          totalBazarExpense.toFixed(2)
        ),

        totalOtherExpense: Number(
          totalOtherExpense.toFixed(2)
        ),

        totalMoneyReceived: Number(
          totalMoneyReceived.toFixed(2)
        ),

        totalPaid: Number(
          totalPaid.toFixed(2)
        ),

        totalDue: Number(
          totalDue.toFixed(2)
        ),

        availableBalance: Number(
          availableBalance.toFixed(2)
        ),
      },

      bazar: {
        todaysBazarExpense: Number(
          todaysBazarExpense.toFixed(2)
        ),
      },

      payments: {
        pendingPaymentVerification,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};