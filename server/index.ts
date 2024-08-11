import express from "express";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

import session from "express-session";
import { router as authRouter } from "./routes/authRoute";
import { router as imageRouter } from "./routes/imageRoute";

const app = express();
dotenv.config();

// Set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    session({
        secret: "your-secret-key", 
        resave: false,
        saveUninitialized: true,
    })
);

app.get("/", (req, res) => {
    res.render("login", { title: "Login Page" });
});

// Routes
app.use("/auth", authRouter);
app.use("/image", imageRouter);

app.get("/home", (req, res) => {
    res.render("index", { title: "Avatar Generator" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
