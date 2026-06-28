import express from "express";
import authRoutes from "./routes/authRoutes.js";
import arenaRoutes from "./routes/arenaRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import internalRoutes from "./routes/internalRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Create an instance of the express application
const app = express();
const port = process.env.PORT || 3000;

// Use the payment routes for handling payment-related endpoints
app.use("/payments", paymentRoutes);

app.use(express.json()); // Add JSON body parser for POST requests

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRoutes);
app.use("/arenas", arenaRoutes);
app.use("/bookings", bookingRoutes);
app.use("/ai", aiRoutes);
app.use("/internal", internalRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5137",
    methods: ["GET", "POST"],
  },
});

// Make io accessible throughout the application
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_court", (data: { courtId: string }) => {
    const roomName = `court_${data.courtId}`;

    socket.join(roomName);

    console.log(`User [${socket.id}] joined Room: ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
