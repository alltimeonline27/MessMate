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

io.on("connection", (socket) => {
  console.log("Chat user connected:", socket.id);

  // User joins their mess chat room
  socket.on("join-mess", (messId) => {
    if (!messId) return;

    const roomName = `mess:${messId}`;

    socket.join(roomName);

    console.log(`Socket ${socket.id} joined ${roomName}`);
  });

  // Send live message to everyone in the same mess
  socket.on("send-message", (data) => {
    const { messId, message } = data;

    if (!messId || !message || !message.trim()) {
      return;
    }

    const roomName = `mess:${messId}`;

    socket.to(roomName).emit("receive-message", {
      message: message.trim(),
      sender: data.sender,
      senderName: data.senderName,
      createdAt: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("Chat user disconnected:", socket.id);
  });
});

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