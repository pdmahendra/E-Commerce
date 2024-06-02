import { Request, Response, NextFunction } from "express";
import User from '../models/user.model.js'
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";

export const newUser = TryCatch(
    async (req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {
        const { name, email, photo, gender, role, _id, dob } = req.body;

        let user = await User.findById(_id);
        if (user) {
            return res.status(201).json({
                success: true,
                message: `Welcome ${user.name}`
            })
        }

        if (!name || !email || !photo || !gender || !role || !dob) {
            return next(new ErrorHandler("Please provide all required fields.", 400))
        }
        
        user = await User.create({
            name,
            email,
            photo,
            gender,
            role,
            _id,
            dob: new Date(dob)
        })

        return res.status(201).json({
            success: true,
            message: `Welcome ${user.name}`
        })
    }
)

export const getAllUsers = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {

        const users = await User.find({})

        return res.status(200).json({
            success: true,
            users,
        })
    }
)

export const getUser = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {

        const { id } = req.params
        const user = await User.findById(id)
        if (!user) return next(new ErrorHandler("Invalid Id", 400))

        return res.status(200).json({
            success: true,
            user,
        })
    }
)


export const deleteUser = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {

        const { id } = req.params
        const user = await User.findByIdAndDelete(id)

        if (!user) return next(new ErrorHandler("Invalid Id", 400))

        return res.status(200).json({
            success: true,
            message: "User Deleted Successfully"
        })
    }
)