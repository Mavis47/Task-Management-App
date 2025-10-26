import express from "express";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes.ts";
import TaskRoutes from "./src/routes/task.routes.ts";
import adminRoutes from "./src/routes/admin.routes.ts";
import cors from "cors";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT" ,"DELETE"],
    credentials: true, 
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/task", TaskRoutes);
app.use("/api/admin",adminRoutes)
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Task Management Backend Running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));