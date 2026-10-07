require("dotenv").config();

const express = require("express");

const http = require("http");

const cors = require("cors");

const connectDB = require("./config/db");

require("./jobs/bazarDutyReminder");


const app = express();

const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

// ======================================================
// SOCKET.IO CHAT
// ======================================================






// Make Socket.IO available to Express routes if needed
app.set("io", io);

const emitPresence = async (messId) => {
  if (!messId) return;

  const roomName = `mess:${messId}`;
  const sockets = await io.in(roomName).fetchSockets();

  const users = [];
  const seen = new Set();

  for (const socket of sockets) {
    const userId = socket.data.userId;

    if (!userId || seen.has(userId.toString())) {
      continue;
    }

    seen.add(userId.toString());

    users.push({
      userId: userId.toString(),
      name: socket.data.userName || "Mess Member",
    });
  }

  io.to(roomName).emit("presence-update", {
    users,
  });
};

io.on("connection", (socket) => {
  console.log("Chat user connected:", socket.id);

  // ====================================================
  // JOIN MESS
  // ====================================================
  socket.on("join-mess", async (payload) => {
    const messId =
      typeof payload === "string"
        ? payload
        : payload?.messId;

    const userId =
      typeof payload === "object"
        ? payload?.userId
        : null;

    const userName =
      typeof payload === "object"
        ? payload?.userName
        : null;

    if (!messId) return;

    socket.data.messId = messId;
    socket.data.userId = userId;
    socket.data.userName = userName;

    const roomName = `mess:${messId}`;

    socket.join(roomName);

    console.log(
      `Socket ${socket.id} joined ${roomName}`
    );

    await emitPresence(messId);
  });

  // ====================================================
  // SEND MESSAGE
  // ====================================================
  socket.on("send-message", (data) => {
    const { messId, messageData } = data || {};

    if (!messId || !messageData) return;

    const roomName = `mess:${messId}`;

    socket.to(roomName).emit(
      "receive-message",
      messageData
    );
  });

  // ====================================================
  // TYPING
  // ====================================================
  socket.on("typing", (data) => {
    const {
      messId,
      userId,
      userName,
      isTyping,
    } = data || {};

    if (!messId || !userId) return;

    const roomName = `mess:${messId}`;

    socket.to(roomName).emit("user-typing", {
      userId,
      userName: userName || "Mess Member",
      isTyping: Boolean(isTyping),
    });
  });

  // ====================================================
  // DELETE FOR EVERYONE
  // ====================================================
  socket.on(
    "message-deleted-for-everyone",
    (data) => {
      const { messId, messageId } = data || {};

      if (!messId || !messageId) return;

      const roomName = `mess:${messId}`;

      socket.to(roomName).emit(
        "message-deleted-for-everyone",
        {
          messageId,
        }
      );
    }
  );

  // ====================================================
  // DISCONNECT
  // ====================================================
  socket.on("disconnect", async () => {
    console.log(
      "Chat user disconnected:",
      socket.id
    );

    if (socket.data.messId) {
      await emitPresence(socket.data.messId);
    }
  });
});

// Keep your existing:
// server.listen(PORT, ...)

app.use(cors());

app.use(express.json());

connectDB();

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

const memberRoutes = require("./routes/memberRoutes");

app.use("/api/members", memberRoutes);

const mealPollRoutes = require("./routes/mealPollRoutes");

app.use("/api/meal-polls", mealPollRoutes);

const mealVoteRoutes = require("./routes/mealVoteRoutes");

app.use("/api/meal-votes", mealVoteRoutes);

const mealRoutes = require("./routes/mealRoutes");

app.use("/api/meals", mealRoutes);

const expenseRoutes = require("./routes/expenseRoutes");

app.use("/api/expenses", expenseRoutes);

const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api/payments", paymentRoutes);

const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/notifications", notificationRoutes);

const reportRoutes = require("./routes/reportRoutes");

app.use("/api/reports", reportRoutes);

const profileRoutes = require("./routes/profileRoutes");

app.use("/api/profile", profileRoutes);

const messRoutes = require("./routes/messRoutes");

app.use("/api/mess", messRoutes);

const inviteRoutes = require("./routes/inviteRoutes");

app.use("/api/invites", inviteRoutes);

const joinRequestRoutes = require("./routes/joinRequestRoutes");

app.use("/api/join-requests", joinRequestRoutes);

const generalPollRoutes = require("./routes/generalPollRoutes");
const generalPollVoteRoutes = require("./routes/generalPollVoteRoutes");

const bazarRoutes = require("./routes/bazarRoutes");
app.use("/api/bazar", bazarRoutes);

const bazarScheduleRoutes = require("./routes/bazarScheduleRoutes");
app.use("/api/bazar-schedules", bazarScheduleRoutes);

app.use("/api/general-polls", generalPollRoutes);
app.use("/api/general-poll-votes", generalPollVoteRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

const menuRoutes = require("./routes/menuRoutes");
app.use("/api/menu", menuRoutes);

const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("MessMate Backend is Running 🚀");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});