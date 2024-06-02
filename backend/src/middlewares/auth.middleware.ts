import { Request, Response, NextFunction } from "express";
import { TryCatch } from "./error.js";
import ErrorHandler from "../utils/utility-class.js";
import User from "../models/user.model.js";

export const adminOnly = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;

    if (!id) return next(new ErrorHandler("Please ensure you are logged in", 401))

    const user = await User.findById(id);

    if (!user) {
        return next(new ErrorHandler("User does not exist", 401))
    }


    if (user.role !== "admin") {
        return next(new ErrorHandler("Unauthorized request", 401))
    }

    next()

})