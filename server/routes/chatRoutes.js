const express = require("express");
const router = express.Router();

const ChatMessage = require("../models/ChatMessage");
const { protect } = require("../middleware/authMiddleware");


// Get chat messages of logged-in user's mess
router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role === "superAdmin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin cannot access mess chat",
      });
    }

    const messages = await ChatMessage.find({
      messId: req.user.messId._id,
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


// Send a chat message
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


module.exports = router;