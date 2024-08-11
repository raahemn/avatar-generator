import express, { Request, Response } from "express";
import multer from "multer";
import axios from "axios";
import {} from "multer";
import fs from "fs";

const router = express.Router();

const upload = multer();

router.post(
    "/generate",
    upload.fields([{ name: "photo" }, { name: "controlNetImage" }]),
    async (req: any, res: Response) => {
        try {
            console.log("req", req.body);
            console.log("FILES", req.files);

            const { prompt, useControlNet } = req.body;
            console.log("prompt", prompt);
            console.log("useControlNet", useControlNet);
            console.log("req.files", req.files);

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
                "/home/jupyter/stable-diffusion-webui/models/insightface/inswapper_128.onnx", // Model path
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
                width: 512,
                height: 512,
                prompt: "man in black jeans standing on the beach",
                restore_faces: true,
                negative_prompt:
                    "(blurry) (unclear) (poor anatomy) (weird anatomy)",
                seed: -1,
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
                runpod_body.alwayson_scripts = {
                    ...runpod_body.alwayson_scripts,
                    ...controlnetArgs,
                };
            }

            // Construct the request body for Runpod API
            console.log("FInal request body", runpod_body);

            // const apiResponse = await axios.post(
            //     "https://api.runpod.ai/v2/baj4a9hr0n43pt/run",
            //     runpod_body,
            //     {
            //         headers: {
            //             Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
            //             "Content-Type": "application/json",
            //         },
            //     }
            // );

            // console.log("API response:", apiResponse.data);

            // const job_id = apiResponse.data.job_id;

            // const imageUrl = apiResponse.data.imageUrl;

            // // Redirect to a new page with the image URL as a query parameter
            // res.redirect(`/result?imageUrl=${encodeURIComponent(imageUrl)}`);

            let response = await axios.post(
                "https://1ae6abb0d016777eee.gradio.live/sdapi/v1/txt2img",
                runpod_body
            );

            console.log(response.data);

            const recvd_base64 = response.data.images[0];

            //here, upload the image to the google cloud storage bucket and store its metadata in the firestore database in the images collection.




            //save this as an actual image file
            fs.writeFileSync("output.png", Buffer.from(recvd_base64, "base64"));

            res.send(prompt);
        } catch (error) {
            console.error("Error generating image:", error);
            res.status(500).send(
                "An error occurred while generating the image."
            );
        }
    }
);

router.get("/result", (req, res) => {
    const { imageUrl } = req.query;

    res.render("result", { title: "Generated Image", imageUrl });
});

export { router };

// let runpod_body = {
//     input: {
//         api_name: "txt2img",
//         prompt: prompt,
//         restore_faces: true,
//         negative_prompt: "(unclear image)",
//         seed: -1,
//         override_settings: {
//             sd_model_checkpoint: "dreamshaper_8.safetensors",
//         },
//         cfg_scale: 5,
//         sampler_index: "DDIM",
//         num_inference_steps: 20,
//         email: "test@example.com",

//         //Use controlnet and reactor
//         alwayson_scripts: { reactor: { args: reactor_args } },
//     },
// };
