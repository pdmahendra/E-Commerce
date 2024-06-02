import { TryCatch } from "../middlewares/error.js";
import { Request } from "express";
import { Coupon } from "../models/coupon.model.js";
import ErrorHandler from "../utils/utility-class.js";
import { stripe } from "../app.js";

interface NewCouponRequestNody {
    coupon?: string;
    amount?: number;
}


export const createPaymentIntent = TryCatch(async (req: Request<{}, {}, NewCouponRequestNody>, res, next) => {
    const { amount } = req.body;

    if (!amount) {
        return next(new ErrorHandler("Please enter amount", 400));
    }
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount) * 100,
        currency: "inr",
    })

    return res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
    });

});

export const newCoupon = TryCatch(async (req: Request<{}, {}, NewCouponRequestNody>, res, next) => {
    const { coupon, amount } = req.body;

    if (!coupon || !amount) {
        return next(new ErrorHandler("Please provide all required fields.", 400));
    }

    await Coupon.create({ coupon, amount });
    return res.status(201).json({
        success: true,
        message: `Coupon ${coupon} Created Successfully`,
    });

});


export const applyDiscount = TryCatch(async (req: Request, res, next) => {
    const { coupon } = req.query;

    const discount = await Coupon.findOne({ coupon });

    if (!discount) {
        return next(new ErrorHandler("Invalid Coupon Code", 400))
    };

    return res.status(200).json({
        success: true,
        discount: discount.amount,
    });

});


export const allCoupons = TryCatch(async (req: Request, res, next) => {

    const coupons = await Coupon.find({});

    return res.status(200).json({
        success: true,
        coupons,
    });
});

export const deleteCoupon = TryCatch(async (req: Request, res, next) => {

    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
        return next(new ErrorHandler("Invalid Id", 400))
    };

    return res.status(200).json({
        success: true,
        message: "Coupon Deleted Successfully"
    });
});