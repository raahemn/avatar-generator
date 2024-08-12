import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    console.log("Checking Auth");
    console.log("req cookies", req.cookies);
    console.log("req body", req.body);
    console.log("req headers", req.headers);


    try {
        if (!req.cookies.token) {
            console.log("cookies", req.cookies);
            console.log("No token found");
            return res.redirect("/login");
        }
        const token = req.cookies.token;

        console.log("token recvd", token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        //get the email property from decoded after converting it from string to json 

        req.body.user = JSON.parse(JSON.stringify(decoded)).email;

        console.log("decoded email", req.body.user);

        // console.log("Request body in middleware", req);

        next();
    } catch (error) {
        console.log("error in middleware", error);
        res.redirect("/login");
    }
};

export default checkAuth;
