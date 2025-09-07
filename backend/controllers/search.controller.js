import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";
import { Siddhacode } from "../models/siddh.model.js";

let accessToken = null;

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

async function getAccessToken() {
    try {
        // console.log("...REACHED...");
        const response = await axios.post(
            "https://icdaccessmanagement.who.int/connect/token",
            new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                scope: "icdapi_access",
                grant_type: "client_credentials",
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
        // console.log("🔑 Access Token:", response.data.access_token);
        // console.log(response.data)

        accessToken = response.data.access_token;
        console.log("✅ ICD API token received.");
        return accessToken;
    } catch (error) {
        console.error(
            "❌ Error fetching token:",
            error.response?.data || error.message
        );
    }
}

// Middleware to ensure we have a valid token
async function ensureToken(req, res, next) {
    if (!accessToken) {
        await getAccessToken();
    }
    next();
}

const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "API-Version": "v2",
    "Accept-Language": "en",
};

const searchDisease = asyncHandler(async (req, res) => {
    try {
        const { searchParam } = req.body;
        if (!searchParam || !searchParam.trim()) {
            throw new ApiError(400, "Search parameter is required");
        }
        if (!accessToken) {
            await getAccessToken();
        }

        // Call WHO ICD API
        const response = await axios.get(
            `https://id.who.int/icd/release/11/2023-01/mms/search?q=${encodeURIComponent(
                searchParam
            )}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                    "API-Version": "v2",
                    "Accept-Language": "en",
                },
            }
        );

        // Check if data is returned
        if (!response.data.destinationEntities?.length) {
            throw new ApiError(404, "No disease found for this search term");
        }

        // Send only useful data back
        const results = response.data.destinationEntities.map((entity, i) => {
          
                return {
                    id: entity.id,
                    code: entity.theCode,
                    title: entity.title,
                };

        });

        const data = await Siddhacode.findOne({
            $or: [
                { NAMC_TERM: { $regex: searchParam, $options: "i" } },
                { short_definition: { $regex: searchParam, $options: "i" } },
            ],
        });
        let namasteArray=[]
        namasteArray.push(data)

        res.status(200).json(new ApiResponse(200, [results || [],namasteArray||[]], "Found"));
    } catch (error) {
        console.log(error);
    }
});

export { searchDisease };
