import express from "express";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import { router as authRouter } from "./routes/authRoute";
import { router as imageRouter } from "./routes/imageRoute";
import { router as jobRouter } from "./routes/jobRoute";
import checkAuth from "./middleware/checkAuth";

const app = express();
dotenv.config();

// Set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser());


app.get("/", checkAuth, (req, res) => {
    console.log("home req", req.cookies);
    res.render("index", { title: "Home" });
});

app.get("/login", (req, res) => {
    res.render("login", { title: "Login Page" });
});

// Routes
app.use("/auth", authRouter);
app.use("/image", checkAuth, imageRouter);
app.use("/jobs", checkAuth, jobRouter);

// app.get("/jobs", async (req, res) => {
//     // Dummy jobs data
//     // const jobs = [
//     //     { jobId: '1', status: 'completed' },
//     //     { jobId: '2', status: 'pending' },
//     //     { jobId: '3', status: 'completed' },
//     //     { jobId: '4', status: 'pending' }
//     // ];

//     // // Render the jobs EJS page with dummy jobs data
//     // res.render("jobs", { 
//     //     title: "Jobs",
//     //     jobs: jobs,
//     //     selectedJobGenerations: [],  // No generations for this dummy example
//     //     selectedJobId: null           // No selected job for this dummy example
//     // });
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
