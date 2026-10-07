const express = require("express");
const router = express.Router();

const ChatMessage = require("../models/ChatMessage");
const { protect } = require("../middleware/authMiddleware");

// ======================================================
// GET CHAT MESSAGES
// ======================================================
router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role === "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin cannot access mess chat",
      });
    }

    const currentUserId = req.user._id;

    const messages = await ChatMessage.find({
      messId: req.user.messId._id,
      deletedFor: { $ne: currentUserId },
    })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get chat messages error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load chat messages",
    });
  }
});

// ======================================================
// SEND MESSAGE
// ======================================================
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role === "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin cannot send mess chat messages",
      });
    }

    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const newMessage = await ChatMessage.create({
      messId: req.user.messId._id,
      sender: req.user._id,
      message: message.trim(),
    });

    const populatedMessage = await newMessage.populate(
      "sender",
      "name email role"
    );

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Send chat message error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});



// ======================================================
// CLEAR ALL CHAT FOR ME
// ======================================================
router.delete("/clear/for-me", protect, async (req, res) => {
  try {
    if (req.user.role === "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin cannot access mess chat",
      });
    }

    await ChatMessage.updateMany(
      {
        messId: req.user.messId._id,
        deletedFor: { $ne: req.user._id },
      },
      {
        $addToSet: {
          deletedFor: req.user._id,
        },
      }
    );

    res.json({
      success: true,
      message: "Chat cleared for you",
    });
  } catch (error) {
    console.error("Clear chat error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear chat",
    });
  }
});

// ======================================================
// DELETE MESSAGE FOR ME
// ======================================================
router.delete("/:id/for-me", protect, async (req, res) => {
  try {
    if (req.user.role === "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin cannot access mess chat",
      });
    }

    const message = await ChatMessage.findOne({
      _id: req.params.id,
      messId: req.user.messId._id,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const alreadyDeleted = message.deletedFor.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!alreadyDeleted) {
      message.deletedFor.push(req.user._id);
      await message.save();
    }

    res.json({
      success: true,
      message: "Message deleted for you",
    });
  } catch (error) {
    console.error("Delete message for me error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
});

// ======================================================
// DELETE MESSAGE FOR EVERYONE
// Only the sender can do this
// ======================================================
router.delete("/:id/for-everyone", protect, async (req, res) => {
  try {
    if (req.user.role === "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin cannot access mess chat",
      });
    }

    const message = await ChatMessage.findOne({
      _id: req.params.id,
      messId: req.user.messId._id,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only message sender can delete for everyone
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages for everyone",
      });
    }

    if (message.isDeletedForEveryone) {
      return res.json({
        success: true,
        message: "Message is already deleted",
      });
    }

    message.message = "This message was deleted";
    message.isDeletedForEveryone = true;
    message.deletedAt = new Date();

    await message.save();

    const updatedMessage = await message.populate(
      "sender",
      "name email role"
    );

    res.json({
      success: true,
      message: "Message deleted for everyone",
      updatedMessage,
    });
  } catch (error) {
    console.error("Delete message for everyone error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete message for everyone",
    });
  }
});


module.exports = router;