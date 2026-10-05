const Meal = require("../models/Meal");
const Member = require("../models/Member");
const MealPoll = require("../models/MealPoll");
const MealVote = require("../models/MealVote");

// =====================================================
// ADMIN: Add / Update Actual Meal Entry
// =====================================================

const addMeal = async (req, res) => {
  try {
    const { date, mealType, meals } = req.body;

    if (!date || !mealType || !Array.isArray(meals)) {
      return res.status(400).json({
        success: false,
        message: "Date, meal type and meals are required",
      });
    }

    if (!["lunch", "dinner"].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: "Meal type must be lunch or dinner",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can submit actual meals",
      });
    }

    const messId = req.user.messId._id;

    // Validate that all submitted members belong
    // to the same mess and are active.
    const memberIds = meals.map((item) => item.memberId);

    const members = await Member.find({
      _id: { $in: memberIds },
      messId,
      status: "active",
    }).select("_id");

    const validMemberIds = new Set(
      members.map((member) => String(member._id))
    );

    // Normalize selected date to start of day.
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    // Remove previous actual meal entries for this
    // date + meal type so admin can correct entries.
    await Meal.deleteMany({
      messId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
      mealType,
    });

    const actualMeals = [];

    for (const item of meals) {
      const memberId = String(item.memberId);

      if (!validMemberIds.has(memberId)) {
        continue;
      }

      // Only actual YES meals are stored.
      if (item.ate === true) {
        actualMeals.push({
          messId,
          member: item.memberId,
          date: startDate,
          mealType,
          quantity: item.quantity || 1,
        });
      }
    }

    if (actualMeals.length > 0) {
      await Meal.insertMany(actualMeals);
    }

    res.status(201).json({
      success: true,
      message: "Actual meals saved successfully",
      totalActualMeals: actualMeals.length,
      meals: actualMeals,
    });
  } catch (error) {
    console.error("Add meal error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save actual meals",
      error: error.message,
    });
  }
};


// =====================================================
// ADMIN: Get Actual Meal Entry Screen
// =====================================================

const getMeals = async (req, res) => {
  try {
    const { date, mealType } = req.query;

    if (!date || !mealType) {
      return res.status(400).json({
        success: false,
        message: "Date and meal type are required",
      });
    }

    if (!["lunch", "dinner"].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: "Meal type must be lunch or dinner",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can access actual meal entry",
      });
    }

    const messId = req.user.messId._id;

    // Get all active members of this mess.
    const members = await Member.find({
      messId,
      status: "active",
    })
      .select("_id name email phone roomNumber")
      .sort({ name: 1 });

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    // Find meal poll for this date + meal type.
    const poll = await MealPoll.findOne({
      messId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
      mealType,
    }).sort({ createdAt: -1 });

    let votes = [];

    if (poll) {
      votes = await MealVote.find({
        messId,
        poll: poll._id,
      }).select("member vote");
    }

    const voteMap = new Map();

    votes.forEach((vote) => {
      voteMap.set(String(vote.member), vote.vote);
    });

    // Get already saved actual meals.
    const actualMeals = await Meal.find({
      messId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
      mealType,
    }).select("member quantity");

    const actualMealMap = new Map();

    actualMeals.forEach((meal) => {
      actualMealMap.set(String(meal.member), meal);
    });

    // Prepare admin entry data.
    const result = members.map((member) => {
      const memberId = String(member._id);

      const pollVote = voteMap.get(memberId) || null;

      const actualMeal = actualMealMap.get(memberId);

      let actual = null;

      if (actualMeal) {
        // Already saved actual meal has priority.
        actual = true;
      } else if (pollVote === "yes") {
        // Poll YES becomes initial YES.
        actual = true;
      } else if (pollVote === "no") {
        // Poll NO becomes initial NO.
        actual = false;
      }

      return {
        member: {
          _id: member._id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          roomNumber: member.roomNumber,
        },
        pollVote,
        actual,
        quantity: actualMeal?.quantity || 1,
      };
    });

    res.json({
      success: true,
      date: startDate,
      mealType,
      pollId: poll?._id || null,
      members: result,
    });
  } catch (error) {
    console.error("Get meals error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load actual meal data",
      error: error.message,
    });
  }
};


// =====================================================
// MEMBER: Get Own Meal History
// =====================================================

const getMyMealHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    if (!req.user.messId) {
      return res.status(400).json({
        success: false,
        message: "You are not connected to a mess",
      });
    }

    const messId = req.user.messId._id;

    // Find the logged-in user's member profile.
    const member = await Member.findOne({
      userId: req.user._id,
      messId,
      status: "active",
    }).select("_id name roomNumber");

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Active member profile not found",
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
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

    // IMPORTANT:
    // Only this member's meals are returned.
    const meals = await Meal.find({
      messId,
      member: member._id,
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .select("date mealType quantity")
      .sort({ date: 1 });

    // Group meals by date.
    const historyMap = new Map();

    meals.forEach((meal) => {
      const dateKey = meal.date.toISOString().split("T")[0];

      if (!historyMap.has(dateKey)) {
        historyMap.set(dateKey, {
          date: dateKey,
          lunch: 0,
          dinner: 0,
          total: 0,
        });
      }

      const day = historyMap.get(dateKey);

      const quantity = meal.quantity || 1;

      if (meal.mealType === "lunch") {
        day.lunch += quantity;
      }

      if (meal.mealType === "dinner") {
        day.dinner += quantity;
      }

      day.total += quantity;
    });

    const history = Array.from(historyMap.values());

    const totalLunch = history.reduce(
      (total, day) => total + day.lunch,
      0
    );

    const totalDinner = history.reduce(
      (total, day) => total + day.dinner,
      0
    );

    const totalMeals = history.reduce(
      (total, day) => total + day.total,
      0
    );

    res.json({
      success: true,

      member: {
        id: member._id,
        name: member.name,
        roomNumber: member.roomNumber,
      },

      startDate,
      endDate,

      history,

      summary: {
        totalLunch,
        totalDinner,
        totalMeals,
      },
    });
  } catch (error) {
    console.error("Get my meal history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load your meal history",
      error: error.message,
    });
  }
};


module.exports = {
  addMeal,
  getMeals,
  getMyMealHistory,
};