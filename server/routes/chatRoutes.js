const express = require("express");
const router = express.Router();

const ChatMessage = require("../models/ChatMessage");
const { protect } = require("../middleware/authMiddleware");

const populateChatMessage = (query) =>
  query
    .populate("sender", "name email role")
    .populate({
      path: "replyTo",
      select: "message sender createdAt isDeletedForEveryone",
      populate: {
        path: "sender",
        select: "name",
      },
    });

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

    const messages = await populateChatMessage(
      ChatMessage.find({
        messId: req.user.messId._id,
        deletedFor: { $ne: req.user._id },
      })
        .sort({ createdAt: 1 })
        .limit(100)
    );

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

    const { message, replyTo } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    let replyMessage = null;

    if (replyTo) {
      replyMessage = await ChatMessage.findOne({
        _id: replyTo,
        messId: req.user.messId._id,
      });

      if (!replyMessage) {
        return res.status(400).json({
          success: false,
          message: "Reply message not found",
        });
      }
    }

    const newMessage = await ChatMessage.create({
      messId: req.user.messId._id,
      sender: req.user._id,
      message: message.trim(),
      replyTo: replyMessage?._id || null,
    });

    const populatedMessage = await populateChatMessage(
      ChatMessage.findById(newMessage._id)
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
// CLEAR CHAT FOR ME
// IMPORTANT: keep this BEFORE /:id routes
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
// DELETE FOR ME
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

    await ChatMessage.updateOne(
      { _id: message._id },
      {
        $addToSet: {
          deletedFor: req.user._id,
        },
      }
    );

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
// DELETE FOR EVERYONE
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

    res.json({
      success: true,
      message: "Message deleted for everyone",
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
