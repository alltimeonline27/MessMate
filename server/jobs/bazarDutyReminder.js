const cron = require("node-cron");
const BazarSchedule = require("../models/BazarSchedule");
const Member = require("../models/Member");
const Notification = require("../models/Notification");

const createBazarDutyNotifications = async () => {
  try {
    const now = new Date();

    // Today starts at 00:00
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Tomorrow starts at 00:00
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Find today's bazar schedules
    const schedules = await BazarSchedule.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    if (schedules.length === 0) {
      console.log("No bazar duty scheduled for today.");
      return;
    }

    for (const schedule of schedules) {
      if (!schedule.assignedMembers.length) {
        continue;
      }

      const members = await Member.find({
        _id: { $in: schedule.assignedMembers },
        status: "active",
      }).select("userId name");

      for (const member of members) {
        if (!member.userId) {
          continue;
        }

        // Prevent duplicate notification on the same day
        const existingNotification = await Notification.findOne({
          user: member.userId,
          type: "bazar",
          title: "Bazar Duty Reminder",
          createdAt: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        });

        if (existingNotification) {
          continue;
        }

        await Notification.create({
          user: member.userId,
          title: "Bazar Duty Reminder",
          message: `Today is your bazar duty. Please complete the bazar shopping.`,
          type: "bazar",
        });

        console.log(
          `Bazar notification created for ${member.name}`
        );
      }
    }
  } catch (error) {
    console.error(
      "Bazar duty notification error:",
      error.message
    );
  }
};

// Run every day at 3:00 PM India time
cron.schedule(
  "0 15 * * *",
  createBazarDutyNotifications,
  {
    timezone: "Asia/Kolkata",
  }
);

console.log("Bazar duty reminder scheduler started.");