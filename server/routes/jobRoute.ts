import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { Firestore } from "@google-cloud/firestore";

const router = express.Router();

dotenv.config();

//Route to get all jobs from the database
router.get("/", async (req: Request, res: Response) => {
    const user = req.body.user;
    //get the jobs for this particular user from Firestore database
    const firestore = new Firestore({
        projectId: process.env.PROJECT_ID,
        databaseId: process.env.DATABASE_ID,
    });

    const jobsCollection = firestore.collection("jobs");

    const jobs = jobsCollection.where("user", "==", user).get();


    // Render the jobs EJS page with jobs data
    res.render("jobs", {
        title: "Jobs",
        jobs: jobs,
        selectedJobGenerations: [], // No generations for this dummy example
        selectedJobId: null, // No selected job for this dummy example
    });
});

export { router };