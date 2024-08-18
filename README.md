# The SD Avatar Generator
Deployed Link: https://avatars-ujhoe434ua-uc.a.run.app

Note: currently only email addresses with the gaper.io and jetrr.com domains are allowed to login.

# Description:
In this project, I have created an AI powered avatar generator. Users can input a prompt describing their avatar along with an optional negative prompt to discourage the model from producing unwanted characteristics in the images. Additionally, the user must upload an image of their face and if they want their avatars to have a specific pose, they may choose to input an image of that pose as well after enabling the "Use Controlnet" option. The user can also select how many generations they want, between 1 and 100. The app then generates an avatar for them using a Stable Diffusion 1.5 checkpoint that has been deployed to Runpod.

# Technologies:
# Model specifications and GPU deployment:
In order to make this app, I needed to deploy a Stable Diffusion checkpoint along with a GPU so that generations do not take up a significant amount of time, thus losing the users' engagement. For this, I chose Runpod's platform which provides me with quick GPU access on-demand. The checkpoint that I used is called Dreamshaper (https://civitai.com/models/4384/dreamshaper), a great checkpoint for producing high quality avatars. 

# Face Swap:
For face swaps, I used the ReActor (https://github.com/Gourieff/sd-webui-reactor) extension. This was an excellent tool that allowed me to create very natural-looking face swaps.

# Pose Control:
For controlling poses, I used the sd-webui-controlnet extension (https://github.com/Mikubill/sd-webui-controlnet) paired with the OpenPose model from HuggingFace (https://huggingface.co/lllyasviel/sd-controlnet-openpose). This model does an excellent job of ensuring that the produced image has the same pose as the pose image provided.

For the entirety of this development, I utilized GCP Vertex AI Workbench with a GPU for faster testing. I cloned the stable-diffusion-webui repository, added Runpod handler and starting script, along with all the necessary packages my app would need. I then dockerized this application and finally deployed it to Runpod.

# Server:
For my web-server, I used Express Typescript. For storing image meta-data, jobs and user data, I used a Firestore database. The generated avatars themselves are uploaded to a private Cloud Storage Bucket and displayed to the user using signed URLs so that images remain private and safe from unauthorized access. For authentication, I used Google OAuth 2.0 and only specific domain emails were allowed to access the app for testing purposes since this app is not publicly released.

# Frontend:
Since the focus of this project was not on making a complex or particularly aesthetic frontend, I used EJS templating library to create static HTML pages, with vanilla CSS used for basic styling only. 
