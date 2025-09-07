import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        // console.log("REACHED")
        // await user.save();
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and acces token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, password } = req.body;
    if ([fullName, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        username,
    });
    if (existedUser)
        throw new ApiError(409, "User with username already exists");

    const user = await User.create({
        fullName: fullName,
        password: password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    // console.log(createdUser)
    if (!createdUser)
        throw new ApiError(500, "Something went wrong while registering user");

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User registered successfuly"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username) throw new ApiError(400, "username is requires");

    const user = await User.findOne({
        $or: [{ username }],
    });
    if (!user) throw new ApiError(404, "user does not exist");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "password is incorrect");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
        maxAge: 10 * 24 * 60 * 60 * 1000,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "user logged in successfuly"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );
   const options = {
       httpOnly: true,
       secure: false, // ✅ for localhost
       sameSite: "strict",
       path: "/",
   };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Userloggedout"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorised request");
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);
        if (!user) throw new ApiError(401, "Invalid refresh token");
        if (incomingRefreshToken !== user?.refreshToken)
            throw new ApiError(401, "Refresh token is expired or used");

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { newAccessToken, newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);
        return res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { newAccessToken, newRefreshToken },
                    "Acccess token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "current user fetched successfully")
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
};
