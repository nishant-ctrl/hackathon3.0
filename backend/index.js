import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
} from "./controllers/user.controller.js";
import { searchDisease } from "./controllers/search.controller.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import { addDisease, showDisease } from "./controllers/disease.controller.js";

import { GoogleGenerativeAI } from "@google/generative-ai";
const geminiFunc=async (req,res) => {
    try {
        const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
        });
        const prompt="what is india";
        const result=await model.generateContent(prompt)

        return res.json(await result.json())
    } catch (error) {
        console.log("GEMINI error",error.message)
        res.json({error:error.message})
    }
}






dotenv.config();
const port = process.env.PORT || 5001;
connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERR: ", error);
            throw error;
        });
        app.listen(port, () => {
            console.log(`Server is running at port: ${port}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connecton failed : ", err);
    });

const app = express();
app.use(bodyParser.json());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


app.post("/register", registerUser);
app.post("/login", loginUser);
app.post("/search", searchDisease);
app.get("/get-current-user", verifyJWT, getCurrentUser);
app.get("/logout", verifyJWT, logoutUser);

app.post("/add",addDisease)
app.get("/show-all",showDisease)
app.get("/gemini",geminiFunc)

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
