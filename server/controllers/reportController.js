const Payment = require("../models/Payment");
const Bazar = require("../models/Bazar");
const Expense = require("../models/Expense");
const Meal = require("../models/Meal");
const Member = require("../models/Member");

const getMonthlyReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    const messId = req.user.messId._id;

    // --------------------------------
    // 1. SUCCESSFUL PAYMENTS
    // --------------------------------

    const payments = await Payment.find({
      messId,
      status: "successful",
      paymentDate: {
        $gte: start,
        $lte: end,
      },
    });

    const totalMoneyReceived = payments.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

    // --------------------------------
    // 2. BAZAR EXPENSE
    // --------------------------------

    const bazarExpenses = await Bazar.find({
      messId,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    const totalBazarExpense = bazarExpenses.reduce(
      (total, bazar) =>
        total + Number(bazar.amount || 0),
      0
    );

    // --------------------------------
    // 3. OTHER EXPENSE
    // --------------------------------

    const otherExpenses = await Expense.find({
      messId,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    const totalOtherExpense = otherExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

    // --------------------------------
    // 4. TOTAL EXPENSE
    // --------------------------------

    const totalExpense =
      totalBazarExpense + totalOtherExpense;

    // --------------------------------
    // 5. AVAILABLE BALANCE
    // --------------------------------

    const availableBalance =
      totalMoneyReceived - totalExpense;

    // --------------------------------
    // 6. ACTUAL MEALS
    // --------------------------------

    const meals = await Meal.find({
      messId,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    const totalActualMeals = meals.reduce(
      (total, meal) =>
        total + Number(meal.quantity || 1),
      0
    );

    // --------------------------------
    // 7. MEAL RATE
    // --------------------------------

    const mealRate =
      totalActualMeals > 0
        ? totalExpense / totalActualMeals
        : 0;

    // --------------------------------
    // 8. MEMBER-WISE REPORT
    // --------------------------------

    const members = await Member.find({
      messId,
      status: "active",
    })
      .select("_id name email phone roomNumber")
      .sort({ name: 1 });

    const memberReports = [];

    for (const member of members) {
      const memberMeals = meals.filter(
        (meal) =>
          String(meal.member) ===
          String(member._id)
      );

      const totalMeals = memberMeals.reduce(
        (total, meal) =>
          total + Number(meal.quantity || 1),
        0
      );

      const memberBill =
        totalMeals * mealRate;

      const memberPayments = payments.filter(
        (payment) =>
          String(payment.member) ===
          String(member._id)
      );

      const totalPaid = memberPayments.reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

      const due = Math.max(
        memberBill - totalPaid,
        0
      );

      memberReports.push({
        member: {
          id: member._id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          roomNumber: member.roomNumber,
        },

        totalMeals,

        memberBill: Number(
          memberBill.toFixed(2)
        ),

        totalPaid: Number(
          totalPaid.toFixed(2)
        ),

        due: Number(
          due.toFixed(2)
        ),
      });
    }

    // --------------------------------
    // 9. EXPENSE CATEGORY SUMMARY
    // --------------------------------

    const categoryTotals = {};

    otherExpenses.forEach((expense) => {
      const category = expense.category;

      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }

      categoryTotals[category] += Number(
        expense.amount || 0
      );
    });

    // --------------------------------
    // FINAL RESPONSE
    // --------------------------------

    res.json({
      success: true,

      period: {
        startDate: start,
        endDate: end,
      },

      financial: {
        totalMoneyReceived: Number(
          totalMoneyReceived.toFixed(2)
        ),

        totalBazarExpense: Number(
          totalBazarExpense.toFixed(2)
        ),

        totalOtherExpense: Number(
          totalOtherExpense.toFixed(2)
        ),

        totalExpense: Number(
          totalExpense.toFixed(2)
        ),

        availableBalance: Number(
          availableBalance.toFixed(2)
        ),
      },

      meals: {
        totalActualMeals,
        mealRate: Number(
          mealRate.toFixed(2)
        ),
      },

      categoryTotals,

      memberReports,
    });
  } catch (error) {
    console.error(
      "Monthly report error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to generate monthly report",
      error: error.message,
    });
  }
};

module.exports = {
  getMonthlyReport,
};