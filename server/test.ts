import axios from "axios";
import fs from "fs";

async function test() {
    //load and convert an image to base64 string
    let image = fs.readFileSync(
        "/Users/raahemnabeel/Downloads/download (1).jpeg"
    );
    let base64Image = image.toString("base64");
    // console.log("Base64 Image", base64Image)

    const photo_raw = fs.readFileSync(
        "/Users/raahemnabeel/Documents/Visa Stuff/Nabeel 2023 US/SDL_0583a.jpg"
    );

    const photo = photo_raw.toString("base64");
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

    let req = {
        width: 512,
        height: 512,
        prompt: "man in red pants standing in front of a building",
        restore_faces: true,
        negative_prompt: "(blurry) (unclear) (poor anatomy) (weird anatomy)",
        seed: -1,
        override_settings: {
            sd_model_checkpoint: "dreamshaper_8.safetensors [879db523c3]",
        },
        cfg_scale: 5,
        sampler_name: "Euler",
        num_inference_steps: 20,
        email: "test@example.com",
        alwayson_scripts: {
            controlnet: {
                args: [
                    {
                        enabled: true,
                        module: "openpose_full",
                        model: "control_sd15_openpose [fef5e48e]",
                        pixel_perfect: true,
                        image: base64Image,
                    },
                ],
            },
            reactor: { args: reactor_args },
        },
    };

    console.log("Req", req);

    let res = await axios.post(
        "https://2f084090e44cb2b953.gradio.live/sdapi/v1/txt2img",
        req
    );

    console.log(res.data);

    const recvd_base64 = res.data.images[0];

    //save this as an actual image file
    fs.writeFileSync("output.png", Buffer.from(recvd_base64, "base64"));
}

test();

// "alwayson_scripts": {
//     "controlnet": {
//         "args": [
//             {
//                 "module": "OpenPose",
//                 "model": "control_sd15_openpose [fef5e48e]",
//                 "input_image": "" ,
//             },
//         ],
//     },
// },
