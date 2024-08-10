import express from "express";
import path from "path";
import axios from "axios";

const app = express();

// Set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index", { title: "Avatar Generator" });
});

// Routes
app.post("/generate", async (req, res) => {
    try {
        const { prompt } = req.body;

        let runpod_body = {
          "input": {
              "api_name": "txt2img",
              "prompt": prompt,
              "restore_faces": true,
              "negative_prompt": "(horse weapon axe club sword staff:1.3), (nude) (bad hands) (disfigured) (grain) (deformed) (poorly drawn) (mutilated) (lowres) (lowpoly) (blurry) (out-of-focus) (duplicate) (frame) (border) (watermark) (label) (signature) (text) (cropped) (artifacts)",
              "seed": -1,
              "override_settings": {
                  "sd_model_checkpoint": ""
              },
              "cfg_scale": 5,
              "sampler_index": "DDIM",
              "num_inference_steps": 20,
              "email": "test@example.com"
           }
      }

        const apiResponse = await axios.post(
            "https://api.runpod.ai/v2/baj4a9hr0n43pt/run",
            runpod_body,
            {
                headers: {
                    Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
            
        );
        const imageUrl = apiResponse.data.imageUrl;

        // Redirect to a new page with the image URL as a query parameter
        res.redirect(`/result?imageUrl=${encodeURIComponent(imageUrl)}`);
    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).send("An error occurred while generating the image.");
    }
});

app.get('/result', (req, res) => {
  const { imageUrl } = req.query;
  res.render('result', { title: 'Generated Image', imageUrl });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
