const Menu = require("../models/Menu");

const getDayName = (date) => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return days[new Date(date).getDay()];
};

const getDateKey = (date) => {
  const currentDate = new Date(date);

  return currentDate.toISOString().split("T")[0];
};

// Get menu for the current mess
const getMenu = async (req, res) => {
  try {
    const messId = req.user.messId._id;

    let menu = await Menu.findOne({ messId });

    // If menu does not exist yet, create an empty menu
    if (!menu) {
      menu = await Menu.create({
        messId,
      });
    }

    const today = new Date();
    const dayName = getDayName(today);
    const todayKey = getDateKey(today);

    const weeklyMenu = menu.weeklyRoutine[dayName];

    const todayOverride = menu.dailyOverrides.find(
      (item) => getDateKey(item.date) === todayKey
    );

    const todayMenu = {
      breakfast:
        todayOverride?.breakfast || weeklyMenu.breakfast || "",

      lunch:
        todayOverride?.lunch || weeklyMenu.lunch || "",

      dinner:
        todayOverride?.dinner || weeklyMenu.dinner || "",
    };

    res.json({
      success: true,
      menu: {
        weeklyRoutine: menu.weeklyRoutine,
        dailyOverrides: menu.dailyOverrides,
        today: {
          date: todayKey,
          day: dayName,
          menu: todayMenu,
          hasOverride: !!todayOverride,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu",
      error: error.message,
    });
  }
};

// Admin: Update weekly routine
const updateWeeklyRoutine = async (req, res) => {
  try {
    const messId = req.user.messId._id;

    const { weeklyRoutine } = req.body;

    if (!weeklyRoutine) {
      return res.status(400).json({
        success: false,
        message: "Weekly routine is required",
      });
    }

    let menu = await Menu.findOne({ messId });

    if (!menu) {
      menu = await Menu.create({
        messId,
        weeklyRoutine,
      });
    } else {
      menu.weeklyRoutine = weeklyRoutine;
      await menu.save();
    }

    res.json({
      success: true,
      message: "Weekly routine updated successfully",
      weeklyRoutine: menu.weeklyRoutine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update weekly routine",
      error: error.message,
    });
  }
};

// Admin: Create or update daily menu override
const updateDailyMenu = async (req, res) => {
  try {
    const messId = req.user.messId._id;

    const {
      date,
      breakfast,
      lunch,
      dinner,
    } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    let menu = await Menu.findOne({ messId });

    if (!menu) {
      menu = await Menu.create({
        messId,
      });
    }

    const dateKey = getDateKey(date);

    const existingOverrideIndex =
      menu.dailyOverrides.findIndex(
        (item) => getDateKey(item.date) === dateKey
      );

    const newOverride = {
      date: new Date(date),
      breakfast: breakfast || "",
      lunch: lunch || "",
      dinner: dinner || "",
    };

    if (existingOverrideIndex !== -1) {
      menu.dailyOverrides[existingOverrideIndex] =
        newOverride;
    } else {
      menu.dailyOverrides.push(newOverride);
    }

    await menu.save();

    res.json({
      success: true,
      message: "Daily menu updated successfully",
      dailyMenu: newOverride,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update daily menu",
      error: error.message,
    });
  }
};

// Admin: Remove daily override
const deleteDailyMenu = async (req, res) => {
  try {
    const messId = req.user.messId._id;
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const menu = await Menu.findOne({ messId });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    const dateKey = getDateKey(date);

    const originalLength = menu.dailyOverrides.length;

    menu.dailyOverrides = menu.dailyOverrides.filter(
      (item) => getDateKey(item.date) !== dateKey
    );

    if (
      menu.dailyOverrides.length === originalLength
    ) {
      return res.status(404).json({
        success: false,
        message: "Daily menu override not found",
      });
    }

    await menu.save();

    res.json({
      success: true,
      message:
        "Daily menu override removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove daily menu override",
      error: error.message,
    });
  }
};

module.exports = {
  getMenu,
  updateWeeklyRoutine,
  updateDailyMenu,
  deleteDailyMenu,
};