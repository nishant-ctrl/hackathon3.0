import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Disease } from "../models/disease.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const addDisease=async (req,res) => {
    try {
        const { doctorName, patientName, age, gender, notes, symptoms, codes } =
        req.body;
        
        // console.log(codes)
        if (!doctorName || !patientName) {
            throw new ApiError(400, "All fields are required");
        }

        const savedData = await Disease.create({
            doctorName,
            patientName,
            age,
            gender,
            notes,
            symptoms,
            codes,
        });

        if (savedData) {
            console.log("Data Saved");
        }

        return res.status(201).json(new ApiResponse(201,savedData,"Data Saved"));
    
    } catch (error) {
        console.log(error)   
        throw new ApiError(500,"Data not saved"); 
    }
}

const showDisease=async (req,res) => {
    try {
        const data=await Disease.find();
        console.log(res)
        return res
            .status(200)
            .json(new ApiResponse(200, data, "Data fetched"));
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Data not fetched"); 
    }
}

export {addDisease,showDisease}



//  const formData = {
//             doctorName,
//             patientName,
//             age: age ? Number(age) : null,
//             gender,
//             notes,
//             symptoms: ["test symptom"], // you can make this dynamic later
//             code