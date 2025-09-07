import mongoose from "mongoose";

const diseaseSchema = new mongoose.Schema(
    {
        doctorName: {
            type: String,
            required: true,
            trim: true,
        },
        patientName: {
            type: String,
            required: true,
            trim: true,
        },
        age: {
            type: Number,
            min: 0,
        },
        gender: {
            type: String,
        },
        notes: {
            type: String,
            trim: true,
        },
        symptoms: {
            type: [String], // array of symptoms
            default: [],
        },
        codes: {
            type: [mongoose.Schema.Types.Mixed],
            // can be array of objects or strings depending on how `selectedCodes` looks
            default: [],
        },
    },
    { timestamps: true } // adds createdAt and updatedAt
);

export const Disease = mongoose.model("Disease", diseaseSchema);

