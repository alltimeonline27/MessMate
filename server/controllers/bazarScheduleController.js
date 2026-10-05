const BazarSchedule = require("../models/BazarSchedule");
const Member = require("../models/Member");

const validateAssignedMembers = async (assignedMembers, messId) => {
  if (!Array.isArray(assignedMembers) || assignedMembers.length === 0) {
    return null;
  }

  const uniqueMemberIds = [...new Set(assignedMembers.map(String))];

  const validMembers = await Member.find({
    _id: { $in: uniqueMemberIds },
    messId,
    status: "active",
  });

  if (validMembers.length !== uniqueMemberIds.length) {
    return null;
  }

  return uniqueMemberIds;
};

// Create OR update one day's bazar schedule
const createBazarSchedule = async (req, res) => {
  try {
    const { date, assignedMembers, note } = req.body;

    if (
      !date ||
      !Array.isArray(assignedMembers) ||
      assignedMembers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Date and at least one assigned member are required",
      });
    }

    const validMemberIds = await validateAssignedMembers(
      assignedMembers,
      req.user.messId._id
    );

    if (!validMemberIds) {
      return res.status(400).json({
        success: false,
        message: "One or more selected members are invalid",
      });
    }

    const scheduleDate = new Date(date);

    if (Number.isNaN(scheduleDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    const existingSchedule = await BazarSchedule.findOne({
      messId: req.user.messId._id,
      date: scheduleDate,
    });

    let schedule;
    let message;

    if (existingSchedule) {
      // Update existing schedule
      existingSchedule.assignedMembers = validMemberIds;
      existingSchedule.note = note ? note.trim() : "";
      existingSchedule.createdBy = req.user._id;

      // This date was manually edited
      existingSchedule.isManualOverride = true;

      // IMPORTANT:
      // Keep sourceDate so the original recurring pattern
      // is not lost.
      
      await existingSchedule.save();

      schedule = existingSchedule;
      message = "Bazar schedule updated successfully";
    } else {
      // Create new recurring schedule
      schedule = await BazarSchedule.create({
        messId: req.user.messId._id,
        date: scheduleDate,
        assignedMembers: validMemberIds,
        note: note ? note.trim() : "",
        createdBy: req.user._id,

        // New schedule becomes part of recurring pattern
        isManualOverride: false,

        sourceDate: null,
      });

      message = "Bazar schedule created successfully";
    }

    const populatedSchedule = await BazarSchedule.findById(schedule._id)
      .populate("assignedMembers", "name email phone roomNumber")
      .populate("createdBy", "name email role");

    res.status(existingSchedule ? 200 : 201).json({
      success: true,
      message,
      schedule: populatedSchedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save bazar schedule",
      error: error.message,
    });
  }
};

// Get all bazar schedules
const getBazarSchedules = async (req, res) => {
  try {
    const schedules = await BazarSchedule.find({
      messId: req.user.messId._id,
    })
      .populate("assignedMembers", "name email phone roomNumber")
      .populate("createdBy", "name email role")
      .sort({ date: 1 });

    res.json({
      success: true,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load bazar schedules",
      error: error.message,
    });
  }
};

// Create the schedule for an entire month
const createMonthlyBazarSchedule = async (req, res) => {
  try {
    const { year, month, schedule } = req.body;

    if (!year || !month || !Array.isArray(schedule)) {
      return res.status(400).json({
        success: false,
        message: "Year, month and schedule are required",
      });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: "Month must be between 1 and 12",
      });
    }

    if (schedule.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Monthly schedule cannot be empty",
      });
    }

    // Validate all assignments first
    for (const item of schedule) {
      if (!item.date || !Array.isArray(item.assignedMembers)) {
        return res.status(400).json({
          success: false,
          message: "Each schedule entry needs date and assigned members",
        });
      }

      if (item.assignedMembers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Each date must have at least one assigned member",
        });
      }

      const validMemberIds = await validateAssignedMembers(
        item.assignedMembers,
        req.user.messId._id
      );

      if (!validMemberIds) {
        return res.status(400).json({
          success: false,
          message: `Invalid member assignment for ${item.date}`,
        });
      }
    }

    const createdSchedules = [];

    for (const item of schedule) {
      const validMemberIds = await validateAssignedMembers(
        item.assignedMembers,
        req.user.messId._id
      );

      const itemDate = new Date(item.date);

      if (Number.isNaN(itemDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: `Invalid date: ${item.date}`,
        });
      }

      const existingSchedule = await BazarSchedule.findOne({
        messId: req.user.messId._id,
        date: itemDate,
      });

      if (existingSchedule) {
        // Do not overwrite manually edited dates
        if (existingSchedule.isManualOverride) {
          continue;
        }

        existingSchedule.assignedMembers = validMemberIds;
        existingSchedule.note = item.note ? item.note.trim() : "";
        existingSchedule.createdBy = req.user._id;

        await existingSchedule.save();

        createdSchedules.push(existingSchedule);
      } else {
        const newSchedule = await BazarSchedule.create({
          messId: req.user.messId._id,
          date: itemDate,
          assignedMembers: validMemberIds,
          note: item.note ? item.note.trim() : "",
          createdBy: req.user._id,
          isManualOverride: false,
          sourceDate: null,
        });

        createdSchedules.push(newSchedule);
      }
    }

    const populatedSchedules = await BazarSchedule.find({
      _id: {
        $in: createdSchedules.map((item) => item._id),
      },
    })
      .populate("assignedMembers", "name email phone roomNumber")
      .populate("createdBy", "name email role")
      .sort({ date: 1 });

    res.status(201).json({
      success: true,
      message: "Monthly bazar schedule created successfully",
      count: populatedSchedules.length,
      schedules: populatedSchedules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create monthly bazar schedule",
      error: error.message,
    });
  }
};

/*
  Find the original recurring schedule.

  Example:

  October 2
  Amit + user3
       ↓
  November 2
  Rahul (manual edit)
       ↓
  December 2
  Amit + user3
*/

const findRecurringSchedule = async (
  schedule,
  messId,
  visitedIds = new Set()
) => {
  if (!schedule) {
    return null;
  }

  const scheduleId = String(schedule._id);

  // Prevent infinite loop
  if (visitedIds.has(scheduleId)) {
    return schedule;
  }

  visitedIds.add(scheduleId);

  // Normal recurring schedule
  if (!schedule.isManualOverride) {
    return schedule;
  }

  /*
    IMPORTANT FIX:

    sourceDate is a Date field, not MongoDB _id.
  */
  if (schedule.sourceDate) {
    const sourceSchedule = await BazarSchedule.findOne({
      date: schedule.sourceDate,
      messId,
    });

    if (sourceSchedule) {
      return findRecurringSchedule(
        sourceSchedule,
        messId,
        visitedIds
      );
    }
  }

  /*
    Fallback for older records where sourceDate
    may not exist.

    Find an earlier non-manual schedule
    having the same day of month.
  */
  const scheduleDay = new Date(schedule.date).getUTCDate();

  const fallbackSchedule = await BazarSchedule.findOne({
    messId,
    date: {
      $lt: schedule.date,
    },
    isManualOverride: false,
    $expr: {
      $eq: [
        {
          $dayOfMonth: "$date",
        },
        scheduleDay,
      ],
    },
  }).sort({
    date: -1,
  });

  return fallbackSchedule || schedule;
};

// Generate next month's schedule
const generateNextMonthBazarSchedule = async (req, res) => {
  try {
    const { year, month } = req.body;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Year and month are required",
      });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: "Month must be between 1 and 12",
      });
    }

    const targetYear = Number(year);
    const targetMonth = Number(month);

    // Previous month
    const previousMonthDate = new Date(
      Date.UTC(targetYear, targetMonth - 2, 1)
    );

    const previousYear =
      previousMonthDate.getUTCFullYear();

    const previousMonth =
      previousMonthDate.getUTCMonth();

    // Load previous month's schedules
    const previousSchedules = await BazarSchedule.find({
      messId: req.user.messId._id,
      date: {
        $gte: new Date(
          Date.UTC(
            previousYear,
            previousMonth,
            1
          )
        ),
        $lt: new Date(
          Date.UTC(
            previousYear,
            previousMonth + 1,
            1
          )
        ),
      },
    }).sort({
      date: 1,
    });

    if (previousSchedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No previous month bazar schedule found",
      });
    }

    // Number of days in target month
    const daysInTargetMonth = new Date(
      Date.UTC(
        targetYear,
        targetMonth,
        0
      )
    ).getUTCDate();

    const generatedSchedules = [];

    for (
      let day = 1;
      day <= daysInTargetMonth;
      day++
    ) {
      // Find same date number in previous month
      const previousSchedule =
        previousSchedules.find((schedule) => {
          const scheduleDay = new Date(
            schedule.date
          ).getUTCDate();

          return scheduleDay === day;
        });

      if (!previousSchedule) {
        continue;
      }

      // Resolve original recurring pattern
      const recurringSchedule =
        await findRecurringSchedule(
          previousSchedule,
          req.user.messId._id
        );

      if (!recurringSchedule) {
        continue;
      }

      const targetDate = new Date(
        Date.UTC(
          targetYear,
          targetMonth - 1,
          day
        )
      );

      // Never overwrite an existing schedule
      const existingSchedule =
        await BazarSchedule.findOne({
          messId: req.user.messId._id,
          date: targetDate,
        });

      if (existingSchedule) {
        continue;
      }

      const newSchedule =
        await BazarSchedule.create({
          messId: req.user.messId._id,
          date: targetDate,

          // Use ORIGINAL recurring members
          assignedMembers:
            recurringSchedule.assignedMembers,

          note: recurringSchedule.note || "",

          createdBy: req.user._id,

          // Automatically generated
          isManualOverride: false,

          // Save original recurring date
          sourceDate: recurringSchedule.date,
        });

      generatedSchedules.push(newSchedule);
    }

    const populatedSchedules =
      await BazarSchedule.find({
        _id: {
          $in: generatedSchedules.map(
            (item) => item._id
          ),
        },
      })
        .populate(
          "assignedMembers",
          "name email phone roomNumber"
        )
        .populate(
          "createdBy",
          "name email role"
        )
        .sort({
          date: 1,
        });

    res.status(201).json({
      success: true,
      message:
        "Next month's bazar schedule generated successfully",
      count: populatedSchedules.length,
      schedules: populatedSchedules,
    });
  } catch (error) {
    console.error(
      "Generate next month error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to generate next month's schedule",
      error: error.message,
    });
  }
};

module.exports = {
  createBazarSchedule,
  getBazarSchedules,
  createMonthlyBazarSchedule,
  generateNextMonthBazarSchedule,
};