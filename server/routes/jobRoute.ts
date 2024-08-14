import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { Firestore } from "@google-cloud/firestore";
import axios from "axios";
import { Storage } from "@google-cloud/storage";

const router = express.Router();

dotenv.config();

async function processImages(images: string[], user: string, job_id: string) {
    const storage = new Storage();
    const bucket = storage.bucket("mod2b-bucket");
    const firestore = new Firestore({
        projectId: process.env.PROJECT_ID,
        databaseId: process.env.DATABASE_ID,
    });

    const imagesCollection = firestore.collection("images");

    // Process each image
    for (let i = 0; i < images.length; i++) {
        const recvd_base64 = images[i];
        const buffer = Buffer.from(recvd_base64, "base64");
        const filename = `image-${user}-${Date.now()}-${i}.jpg`; // Add index to filename
        const file = bucket.file(filename);

        file.save(
            buffer,
            {
                metadata: {
                    contentType: "image/jpeg", // Update this based on your image type
                },
            },
            (err: any) => {
                if (err) {
                    console.error("Error uploading file:", err);
                } else {
                    console.log("File uploaded successfully:", filename);
                }
            }
        );

        await imagesCollection.add({
            user,
            filename,
            job_id,
            url: `https://storage.googleapis.com/mod2b-bucket/${filename}`,
            createdAt: new Date(),
        });
    }
    console.log("All images processed successfully");

    return;
}

async function fetchJobs(user: string) {
    //get the jobs for this particular user from Firestore database
    const firestore = new Firestore({
        projectId: process.env.PROJECT_ID,
        databaseId: process.env.DATABASE_ID,
    });

    const jobsCollection = firestore.collection("jobs");

    const jobs_data = await jobsCollection.where("user", "==", user).get();

    const jobs = jobs_data.docs.map((doc) => doc.data());

    console.log("jobs fetched", jobs);

    return jobs;
}

async function checkAndProcessJobs() {
    const firestore = new Firestore({
        projectId: process.env.PROJECT_ID,
        databaseId: process.env.DATABASE_ID,
    });

    const pendingJobs = await firestore
        .collection("jobs")
        .where("status", "!=", "COMPLETED")
        .get();

    pendingJobs.forEach(async (jobDoc) => {
        const jobData = jobDoc.data();
        const jobId = jobData.job_id;
        const user = jobData.user;

        const response = await axios.get(
            `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/status/${jobId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
                },
            }
        );

        const statusData = response.data.status;

        if (statusData === "COMPLETED") {
            const images = response.data.output.images;
            await processImages(images, user, jobId);
            await firestore
                .collection("jobs")
                .doc(jobId)
                .update({ status: "COMPLETED" });
        }
    });
}

// Run the background worker every few minutes
setInterval(checkAndProcessJobs, 5 * 60 * 1000); // Run every 5 minutes

async function updateJobStatusByJobId(jobId: string, statusData: string) {
    const firestore = new Firestore({
        projectId: process.env.PROJECT_ID,
        databaseId: process.env.DATABASE_ID,
    });

    const jobsCollection = firestore.collection("jobs");

    const jobQuery = await jobsCollection.where("job_id", "==", jobId).get();

    if (!jobQuery.empty) {
        jobQuery.forEach(async (doc) => {
            await doc.ref.update({ status: statusData });
        });
    } else {
        console.log(`No job found with job_id: ${jobId}`);
    }

    return;
}

//Route to get all jobs from the database
router.get("/", async (req: Request, res: Response) => {
    console.log("fetching jobs");
    const user = req.body.user;

    const jobs = await fetchJobs(user);

    // Render the jobs EJS page with jobs data
    res.render("jobs", {
        jobs: jobs,
    });
});

router.get("/status", async (req, res) => {
    const { user } = req.body;
    const jobs = await fetchJobs(user);

    try {
        console.log("fetching jobs status for user", user);

        for (const job of jobs) {
            const jobId = job.job_id;

            if (job.status === "COMPLETED") {
                continue;
            } else {
                const response = await axios.get(
                    `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/status/${jobId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
                        },
                    }
                );

                console.log("Response from Runpod API", response.data);

                const statusData = response.data.status;

                if (statusData === "COMPLETED") {
                    //Get the base64 images and store them in bucket, with metadata in firestore

                    const images = response.data.output.images;
                    await processImages(images, user, jobId);
                    console.log("updating job status to COMPLETED");
                    job.status = statusData;
                } else {
                    job.status = statusData;
                }
                //update the job status in Firestore
                await updateJobStatusByJobId(jobId, statusData);
            }
        }
        console.log("RETURNING UPDATED JOBS", jobs);

        res.json({ jobs });
    } catch (error) {
        console.log("error", error);
        res.json({ jobs });
    }
});

router.get("/generations/:id", async (req, res) => {
    const { id } = req.params;
    const prompt = req.query.prompt;
    const user = req.body.user;

    //first, get the filenames of the images for this user for this job id from firestore images collection
    const firestore = new Firestore({
        projectId: process.env.PROJECT_ID,
        databaseId: process.env.DATABASE_ID,
    });

    const imagesCollection = firestore.collection("images");

    const images = await imagesCollection
        .where("user", "==", user)
        .where("job_id", "==", id)
        .get();

    const files = images.docs.map((doc) => doc.data().filename);

    const storage = new Storage();
    const bucket = storage.bucket("mod2b-bucket");
    const urls: string[] = [];

    for (const file of files) {
        console.log("file", file);
        const [url] = await bucket.file(file).getSignedUrl({
            version: "v4",
            action: "read",
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });
        urls.push(url);
    }

    res.render("generations", {
        urls: urls,
        job_id: id,
        prompt: prompt,
    });
});

export { router };
