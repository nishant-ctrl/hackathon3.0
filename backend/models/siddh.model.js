import mongoose, { Schema } from "mongoose";

const siddhaSchema = new Schema(
    {
        id: Number,
        NAMC_CODE: String,
        NAMC_TERM: String,
        short_definition: String,
        long_definition: String,
    },
    { timestamps: true }
);

export const Siddhacode=mongoose.model("Siddhacode",siddhaSchema);