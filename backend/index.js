import dotenv from "dotenv";
dotenv.config({});
import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./socket/socket.js";

import passport from "passport";
import { setupPassport } from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
app.set("trust proxy", 1);

setupPassport();

app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const normalize = (url) => url?.replace(/\/$/, "");

const allowedOrigins = [
  normalize(process.env.CLIENT_URL),
  "http://localhost:5173",
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(normalize(origin))) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));



app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
    return res.status(200).json({
        message: "I'm coming from backend",
        success: true
    })
})



app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);


server.listen(PORT, () => {
    connectDB();
    console.log(`Server Listen at Port ${PORT}`);
})
