import express, { Request, Response } from "express";
import multer from "multer";
import axios from "axios";
import {} from "multer";
import fs from "fs";
import { Storage } from "@google-cloud/storage";
import { Firestore } from "@google-cloud/firestore";
import jwt from "jsonwebtoken";

const router = express.Router();

const upload = multer();

router.post(
    "/generate",
    upload.fields([{ name: "photo" }, { name: "controlNetImage" }]),
    async (req: any, res: Response) => {
        try {
            // console.log("req", req.body);
            // console.log("FILES", req.files);

            const token = req.cookies.token;

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

            const user = JSON.parse(JSON.stringify(decoded)).email;
            console.log("user", user);

            const { prompt, useControlNet, numGenerations, negativePrompt } =
                req.body;
            // console.log("prompt", prompt);
            // console.log("useControlNet", useControlNet);
            // console.log("req.files", req.files);

            if (!prompt) {
                return res.status(400).send("Prompt is required.");
            }
            if (!req.files) {
                return res.status(400).send("Photo is required.");
            }

            let photo_raw = req.files["photo"][0];

            if (!photo_raw) {
                return res.status(400).send("Photo is required.");
            }

            const photo = photo_raw.buffer.toString("base64");

            const reactor_args = [
                photo, // Your base64 encoded image
                true, // Enable ReActor
                "0", // Use the first face from the source image
                "0", // Swap onto the first face in the generated image
                "inswapper_128.onnx", // Model path
                "CodeFormer", // Restore Face with CodeFormer
                1, // Restore visibility value
                true, // Restore face -> Upscale
                "4x_NMKD-Superscale-SP_178000_G", // Upscaler
                1.5, // Upscaler scale value
                1, // Upscaler visibility
                false, // Don't swap in source image
                true, // Swap in generated image
                1, // Console Log Level
                0, // No gender detection for source
                0, // No gender detection for target
                false, // Don't save the original image(s) before swapping
                0.8, // CodeFormer Weight
                false, // Disable Source Image Hash Check
                false, // Disable Target Image Hash Check
                "CUDA", // Use CUDA if available
                true, // Face Mask Correction
                0, // Select Source: Image
                null, // No face model filename needed
                null, // No path to folder containing source faces images
                null, // Skip it for API
                false, // Don't randomly select an image from path
                false, // Don't force Upscale if no face found
                0.6, // Face Detection Threshold
                2, // Maximum number of faces to detect
            ];

            //For Runpod, just add api name field and inclose it all under input
            let runpod_body = {
                input: {
                    api_name: "txt2img",
                    width: 512,
                    height: 512,
                    prompt: prompt,
                    restore_faces: true,
                    negative_prompt: negativePrompt,
                    seed: -1,
                    batch_size: numGenerations || 1,
                    override_settings: {
                        sd_model_checkpoint:
                            "dreamshaper_8.safetensors [879db523c3]",
                    },
                    cfg_scale: 5,
                    sampler_name: "Euler",
                    num_inference_steps: 20,
                    email: "test@example.com",
                    alwayson_scripts: {
                        reactor: { args: reactor_args },
                    },
                },
            };

            //if controlNet is enabled, get the controlNet image
            if (useControlNet && req.files["controlNetImage"]) {
                console.log("ControlNet image found");
                const controlNetImage_raw = req.files["controlNetImage"][0];
                const controlNetImage =
                    controlNetImage_raw.buffer.toString("base64");

                const controlnetArgs = {
                    controlnet: {
                        args: [
                            {
                                enabled: true,
                                module: "openpose_full",
                                model: "control_sd15_openpose [fef5e48e]",
                                pixel_perfect: true,
                                image: controlNetImage,
                            },
                        ],
                    },
                };

                // Merge ControlNet arguments with existing alwayson_scripts
                runpod_body.input.alwayson_scripts = {
                    ...runpod_body.input.alwayson_scripts,
                    ...controlnetArgs,
                };
            }

            // Construct the request body for Runpod API
            console.log("Final request body", runpod_body);

            // console.log("API response:", apiResponse.data);

            // const job_id = apiResponse.data.job_id;

            // const imageUrl = apiResponse.data.imageUrl;

            // // Redirect to a new page with the image URL as a query parameter
            // res.redirect(`/result?imageUrl=${encodeURIComponent(imageUrl)}`);

            let response = await axios.post(
                `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/run`,
                runpod_body,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
                        "Content-Type": "application/json", // Include if your request body is JSON
                    },
                }
            );

            console.log("Response from Runpod Async:", response.data);

            //Assuming Runpod Async Run returns only job id and status
            const job_id = response.data.id;
            const status = response.data.status;

            //Now, I want to store the job id and status in the firestore database
            const firestore = new Firestore({
                projectId: process.env.PROJECT_ID,
                databaseId: process.env.DATABASE_ID,
            });

            const jobsCollection = firestore.collection("jobs");

            const newJobRef = await jobsCollection.add({
                user,
                job_id,
                prompt,
                status,
                createdAt: new Date(),
            });

            res.redirect("/jobs");
        } catch (error) {
            console.error("Error generating image:", error);
            res.status(500).send(
                "An error occurred while generating the image."
            );
        }
    }
);


router.get("/library", async (req, res) => {
    const user = req.body.user;

    console.log("Library for user:", user);

    //first, get the filenames of all the images that belong to this user from the firestore collection
    const firestore = new Firestore({
        projectId: process.env.PROJECT_ID,
        databaseId: process.env.DATABASE_ID,
    });

    const imagesCollection = firestore.collection("images");

    //find images that belong to this user
    const filedata = await imagesCollection.where("user", "==", user).get();

    const files = filedata.docs.map((doc) => doc.data().filename);

    const storage = new Storage();
    const bucket = storage.bucket("mod2b-bucket");
    const urls: string[] = [];

    for (const file of files) {
        // console.log("file", file);
        const [url] = await bucket.file(file).getSignedUrl({
            version: "v4",
            action: "read",
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });
        urls.push(url);
    }

    res.render("library", { urls });
});

export { router };
