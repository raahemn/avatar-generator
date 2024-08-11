import express from "express";
import querystring from "querystring";
import axios from "axios";
import dotenv from "dotenv";
import { Firestore } from "@google-cloud/firestore";
import jwt from "jsonwebtoken";

const router = express.Router();
dotenv.config();

//Auth Route
router.get("/", (req, res) => {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const redirectUri = "http://localhost:3000/auth/callback";

    //Implement the auth using Google OAuth2.0
    const authorizationUrl =
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        querystring.stringify({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: "openid email profile",
            access_type: "offline",
        });

    console.log("Redirecting to:", authorizationUrl);
    res.redirect(authorizationUrl);
});

//Callback Route after user has authenticated using OAuth
router.get("/callback", async (req, res) => {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const redirectUri = "http://localhost:3000/auth/callback";

    const code = req.query.code as string;
    console.log("Received code:", code);

    try {
        const tokenResponse = await axios.post(
            "https://oauth2.googleapis.com/token",
            querystring.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        console.log("Token response:", tokenResponse.data);

        const idToken = tokenResponse.data.id_token;
        const accessToken = tokenResponse.data.access_token;

        // Use the idToken to authenticate the user, create a session, etc.
        // console.log("Received idToken:", idToken);
        console.log("Received accessToken:", accessToken);

        // Get user info using the access token
        const userInfoResponse = await axios.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        console.log("User info response:", userInfoResponse.data);

        const { name, email } = userInfoResponse.data;
        console.log(`User: ${name}, Email: ${email}`);

        //Store this data in my firestore database
        const firestore = new Firestore({
            projectId: process.env.PROJECT_ID,
            databaseId: process.env.DATABASE_ID,
        });

        const usersCollection = firestore.collection("users");

        const existingUser = await usersCollection
            .where("email", "==", email)
            .get();

        if (existingUser.empty) {
            const newUserRef = await usersCollection.add({
                name: name,
                email: email,
            });
            console.log(`User added with ID: ${newUserRef.id}`);
        }

        //Set a JWT token as cookie for further authentication
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign({ email: email }, jwtSecret, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            httpOnly: false,
        });

        res.redirect("/home");
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Authentication failed" });
    }
});

//Logout Route
router.get("/logout", async (req, res) => {
    const idToken = req.cookies.idToken;

    // Clear the cookie that stores the idToken
    // res.clearCookie("idToken", {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    // });

    // Clear the session (if using session-based authentication)
    // req.session.destroy((err) => {
    //     if (err) {
    //         console.error("Failed to destroy session:", err);
    //     }
    // });

    try {
        await axios.post("https://oauth2.googleapis.com/revoke", null, {
            params: {
                token: idToken,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
    } catch (error) {
        console.error("Failed to revoke token:", error);
    }

    // Redirect to the login page or homepage

    res.redirect("/auth");
});

export { router };
